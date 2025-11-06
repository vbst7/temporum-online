const {logMessage} = require("../utils/logHelpers");
const {scoreSpecificCard, scoreScrapyardCard} =
  require("../utils/gameLogicHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'scoreCard' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { cardIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId).collection("private").doc(playerId); // eslint-disable-line max-len
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

  const cardToScore = hand[cardIndex];
  lobbyData.lastAction = {
    type: "score",
    uid: playerId, context: {cardId: cardToScore.id},
  };

  hand.splice(cardIndex, 1);
  player.handCount = hand.length;

  if (player.promptContext.instruction === "scrapyard-world") {
    await scoreScrapyardCard(player, cardToScore, lobbyData, lobbyId);
  } else await scoreSpecificCard(player, cardToScore, lobbyData, lobbyId);

  player.handCount = hand.length;

  // If scoreSpecificCard or scoreScrapyardCard set a new prompt
  // or ended the turn, the game loop will pick it up.
  // In either case, we return the current lobbyData.
  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};
