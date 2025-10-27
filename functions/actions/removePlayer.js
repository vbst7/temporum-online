const {FieldValue, getFirestore} = require("firebase-admin/firestore");

/**
 * Executes the logic for the host to remove a player.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action, containing
 * playerIdToRemove.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {playerIdToRemove} = payload;

  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can remove players.");
  }
  const playerToRemove = lobbyData.players
      .find((p) => p.id === playerIdToRemove);
  if (!playerToRemove) {
    throw new Error("Player to remove not found in lobby.");
  }
  if (playerToRemove.id === uid) {
    throw new Error("Host cannot remove themselves. Use 'Leave Lobby' instead."); // eslint-disable-line max-len
  }

  // --- Clear Session for Human Players ---
  const batch = getFirestore().batch();
  if (!playerToRemove.isAI) {
    const sessionRef = getFirestore().collection("user_sessions")
        .doc(playerIdToRemove);
    batch.update(sessionRef, {lobbyId: null});
  }

  // --- Prepare Update Payload ---
  const updatePayload = {
    players: FieldValue.arrayRemove(playerToRemove),
  };

  return {
    updatePayload,
    batch,
  };
};
