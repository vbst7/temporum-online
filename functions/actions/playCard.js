const {logMessage} = require("../utils/logHelpers");
const {playSpecificCard} = require("../utils/gameLogicHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'playCard' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { cardIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {cardIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found in lobby.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];

  if (cardIndex === -1 || !hand[cardIndex]) {
    logMessage(lobbyData,
        "Card not found in player's hand or invalid index.", "error");
    return lobbyData;
  }

  const cardToPlay = hand[cardIndex];
  lobbyData.lastAction = {type: "play", uid: playerId,
    context: {cardId: cardToPlay.id}};
  hand.splice(cardIndex, 1);
  player.handCount = hand.length;

  const result = await playSpecificCard(player,
      hand, cardToPlay, lobbyData, lobbyId);

  // The hand may have been modified by follow-up actions.
  player.handCount = result.hand.length;

  // If playSpecificCard set a new prompt or ended the turn,
  // the game loop will pick it up.
  // In either case, we return the current lobbyData.
  batch.update(privateRef, {hand: result.hand});
  return {updatePayload: lobbyData, batch};
};
