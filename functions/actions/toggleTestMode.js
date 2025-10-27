/**
 * Executes the logic for the host to toggle testing mode.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action, containing
 * {enabled: boolean}.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {enabled} = payload;

  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can toggle testing mode.");
  }
  if (lobbyData.status !== "waiting") {
    throw new Error("Cannot change testing mode after the game has started.");
  }

  return {"testConfig.enabled": !!enabled};
};
