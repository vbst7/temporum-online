const {FieldValue, getFirestore} = require("firebase-admin/firestore");

/**
 * Executes the logic to replace a player with an AI.
 * Can be triggered by the host, or by a player resigning.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action.
 * @param {object} payload The data associated with the action, containing
 * playerIdToReplace.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {playerIdToReplace} = payload;
  const players = lobbyData.players;
  const playerIndex = players.findIndex((p) => p.id === playerIdToReplace);

  // --- Validation ---
  if (playerIndex === -1) {
    throw new Error("Player to replace not found.");
  }
  // Authorization is handled by security rules, but good to double-check.
  if (lobbyData.ownerId !== uid && playerIdToReplace !== uid) {
    throw new Error("Not authorized to replace this player.");
  }

  const playerToReplaceObject = players[playerIndex];
  if (playerToReplaceObject.isAI) {
    console.log("Cannot replace an AI with another AI.");
    return {}; // No-op
  }

  const batch = getFirestore().batch();

  // --- Clear Session for Replaced Player ---
  // This is safe here because the action is authorized for either the host or
  // the player themselves.
  const sessionRef = getFirestore().collection("user_sessions").doc(playerIdToReplace); // eslint-disable-line max-len
  batch.update(sessionRef, {lobbyId: FieldValue.delete()});


  // --- Handle Game State ---
  if (lobbyData.status === "in-progress") {
    const remainingHumanPlayers = players
        .filter((p) => !p.isAI && p.id !== playerIdToReplace);
    const hasSpectators = (lobbyData.spectators &&
      lobbyData.spectators.length > 0);

    // If only one human is left, they win by default.
    if (remainingHumanPlayers.length === 1 && !hasSpectators) {
      const winner = remainingHumanPlayers[0];
      if (winner) {
        return {
          batch,
          updatePayload: {
            status: "finished",
            winner: winner.name,
            log: FieldValue.arrayUnion({
              text: `${playerToReplaceObject.name} resigned. ${winner.name} wins!`, // eslint-disable-line max-len
              type: "system",
            }),
          },
        };
      }
    } else if (remainingHumanPlayers.length === 0 && !hasSpectators) {
      // The last human player resigned, and there are no spectators.
      // The lobby should be deleted.
      return {
        batch,
        updatePayload: {
          deleteMe: true,
          log: FieldValue.arrayUnion({
            text: `The last human player, ${playerToReplaceObject.name}, has left. The lobby is closing.`, // eslint-disable-line max-len
            type: "system",
          }),
        },
      };
    }
  }

  // --- Replace with AI ---
  const newAIName = `Robot (Replaced ${playerToReplaceObject.name})`;
  const newAIPlayer = {
    ...playerToReplaceObject,
    id: `ai_replaced_${Date.now()}`,
    name: newAIName,
    isAI: true,
  };

  // Always clear the prompt when replacing a player.
  // The turn logic will re-issue a prompt if needed.
  newAIPlayer.prompt = "";

  const updatedPlayers = [...players];
  updatedPlayers[playerIndex] = newAIPlayer;

  return {
    batch,
    updatePayload: {
      players: updatedPlayers,
      log: FieldValue.arrayUnion({
        text: `${playerToReplaceObject.name} has been replaced by an AI.`,
        type: "system",
      }),
    },
  };
};
