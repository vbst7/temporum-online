const {logMessage} = require("../utils/logHelpers");
const {gainMoney, discardCard} = require("../utils/resourceHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'resolveInvestments' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., {choice: true}).
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {choice} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "investments-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for Investments.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: "investments-choice", uid: playerId,
    context: {choice: choice}};
  const id = player.promptContext.id;

  if (choice) {
    const cardIndex = player.perpetuals.turnEnd.findIndex((c) => c.id === id);
    if (cardIndex > -1) {
      const [card] = player.perpetuals.turnEnd.splice(cardIndex, 1);
      card.type = "P";
      const moneyToGain = Math.floor(player.moneyGainedThisTurn / 2);

      hand.push(card); // Temporarily add card back to hand
      discardCard(player, hand, hand.length - 1, lobbyData);
      if (moneyToGain > 0) {
        gainMoney(player, moneyToGain, lobbyData,
            {name: "Investments", type: "P"});
      }
    }
  } else {
    player.moneyGainedThisTurn = 0;
  }

  player.prompt = "";
  delete player.promptContext;

  // After resolving, continue the end-of-turn sequence.
  const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
  if (result && result.winnerDeclared) {
    const winnerPayload = await declareWinner(lobbyId, lobbyData,
        result.winnerPlayer, result.reason);
    batch.update(privateRef, {hand});
    return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};
