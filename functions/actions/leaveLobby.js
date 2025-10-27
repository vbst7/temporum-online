const {FieldValue, getFirestore} = require("firebase-admin/firestore");

/**
 * Executes the logic for a player to leave a lobby.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user leaving.
 * @param {object} payload The data associated with the action.
 * @param {object} lobbyData The current state of the lobby document.
 * @return {object} The update payload and batch.
 */
exports.execute = (lobbyId, uid, payload, lobbyData) => {
  const playerToRemove = lobbyData.players.find((p) => p.id === uid);
  const spectatorToRemove = lobbyData.spectators?.find((s) => s.id === uid);

  // --- Validation ---
  if (!playerToRemove && !spectatorToRemove) {
    console.log(`Player ${uid} not in lobby, cannot leave.`);
    return {}; // No-op, player not found.
  }

  const db = getFirestore();
  const batch = db.batch();

  // --- Clear Session for Human Players ---
  if ((playerToRemove && !playerToRemove.isAI) || spectatorToRemove) {
    const sessionRef = db.collection("user_sessions").doc(uid);
    batch.update(sessionRef, {lobbyId: FieldValue.delete()});

    // Also clear the presence doc in the lobby's subcollection
    const presenceRef = db.collection("lobbies").doc(lobbyId)
        .collection("sessions").doc(uid);
    batch.delete(presenceRef);
  }

  // --- Handle Spectator Leaving ---
  if (spectatorToRemove) {
    const updatePayload = {
      spectators: FieldValue.arrayRemove(spectatorToRemove),
      log: FieldValue.arrayUnion({
        text: `${spectatorToRemove.name} has stopped spectating.`,
        type: "system",
      }),
    };

    // Check if this was the last human presence in the lobby.
    const remainingSpectators = lobbyData.spectators
        .filter((s) => s.id !== uid);
    const humanPlayers = lobbyData.players.filter((p) => !p.isAI);

    if (remainingSpectators.length === 0 && humanPlayers.length === 0) {
      updatePayload.deleteMe = true;
      updatePayload.log = FieldValue.arrayUnion({
        text: "The last spectator has left an empty lobby. The lobby is closing.", // eslint-disable-line max-len
        type: "system",
      });
    }

    return {
      updatePayload,
      batch,
    };
  }

  const logEntries = [{
    text: `${playerToRemove.name} has left the lobby.`,
    type: "system",
  }];

  // Rebuild the players array without the player who is leaving.
  // This is more reliable than FieldValue.arrayRemove for complex objects.
  const remainingPlayers = lobbyData.players.filter((p) => p.id !== uid);
  const updatePayload = {players: remainingPlayers};
  let newOwnerPlayer = null;

  // --- Handle Host Leaving ---
  if (lobbyData.ownerId === uid) {
    if (remainingPlayers.length > 0) {
      // Find a new human owner
      newOwnerPlayer = remainingPlayers.find((p) => !p.isAI);
      if (newOwnerPlayer) {
        updatePayload.ownerId = newOwnerPlayer.id;
        logEntries.push({
          text: `${newOwnerPlayer.name} is the new host.`,
          type: "system",
        });
      } else {
        // No human players left. The lobby should be deleted by the engine.
        logEntries.push({text: "The last human player has left. " + // eslint-disable-line max-len
          "The lobby is closing.", type: "system"});
        updatePayload.deleteMe = true; // Signal for deletion
      }
    } else {
      // The host was the last player. The lobby should be deleted.
      updatePayload.deleteMe = true;
    }
  }

  // --- Handle Last Human Leaving a Finished Game ---
  if (lobbyData.status === "finished") {
    const remainingHumanPlayers = remainingPlayers.filter((p) => !p.isAI);
    if (remainingHumanPlayers.length === 0) {
      logEntries.push({
        text: "The last human player has left the finished game. " +
          "The lobby is closing.", type: "system",
      });
      updatePayload.deleteMe = true; // Signal for deletion
    }
  }

  // Atomically add all generated log entries.
  updatePayload.log = FieldValue.arrayUnion(...logEntries);

  return {
    updatePayload,
    batch, // Return the batch object


  };
};
