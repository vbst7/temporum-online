const {FieldValue, getFirestore} = require("firebase-admin/firestore");

/**
 * Executes the logic for the host to remove a spectator.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action, containing
 * spectatorIdToRemove.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {spectatorIdToRemove} = payload;

  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can remove spectators.");
  }
  const spectatorToRemove = lobbyData.spectators
      ?.find((s) => s.id === spectatorIdToRemove);

  if (!spectatorToRemove) {
    console.log(`Spectator to remove (${spectatorIdToRemove}) not found.`);
    return {}; // No-op
  }

  // --- Clear Session for Removed Spectator ---
  const batch = getFirestore().batch();
  const sessionRef = getFirestore().collection("user_sessions")
      .doc(spectatorIdToRemove);
  batch.update(sessionRef, {lobbyId: FieldValue.delete()});

  // --- Prepare Update Payload ---
  const updatePayload = {
    spectators: FieldValue.arrayRemove(spectatorToRemove),
    log: FieldValue.arrayUnion({
      text: `${spectatorToRemove.name} was removed by the host.`,
      type: "system",
    }),
  };

  return {
    updatePayload,
    batch,
  };
};
