const {FieldValue} = require("firebase-admin/firestore");

/**
 * Executes the logic for the host to set a player's initial card.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action, containing
 * playerId and cardName.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {playerId, cardName} = payload;

  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can set initial cards.");
  }
  if (lobbyData.status !== "waiting") {
    throw new Error("Cannot set initial cards after the game has started.");
  }

  const fieldPath = `initialCards.${playerId}`;

  if (cardName) {
    return {[fieldPath]: cardName};
  } else {
    // If cardName is empty/null, remove the field.
    return {[fieldPath]: FieldValue.delete()};
  }
};
