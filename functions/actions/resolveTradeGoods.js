const {logMessage} = require("../utils/logHelpers");
const {drawCards, gainMoney} = require("../utils/resourceHelpers");
const {executeCardFollowUp} = require("../utils/followUpHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'RESOLVE_TRADE_GOODS' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., {choice: 'draw'}).
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
  if (!player || player.prompt !== "trade-goods-choice") {
    logMessage(lobbyData, "Player not found in correct state for Trade Goods."
        , "error");
    if (player) player.prompt = ""; // Clear prompt to avoid getting stuck
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: "trade-goods-choice", uid: playerId,
    context: {choice: choice}};

  player.prompt = ""; // Clear the prompt

  const source = {name: "Trade Goods", type: "M"};

  switch (choice) {
    case "draw":
      drawCards(player, hand, 2, lobbyData, source);
      break;
    case "gain":
      gainMoney(player, 8, lobbyData, source);
      break;
    case "draw-gain":
      drawCards(player, hand, 1, lobbyData, source);
      gainMoney(player, 4, lobbyData, source);
      break;
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  // The card action is complete. The follow-up function will pop the stack
  // and handle returning the card to its pile.
  await executeCardFollowUp(player, "trade-goods", lobbyData,
      lobbyId, null, {updatedHand: hand});
  // If executeCardFollowUp set a new prompt or ended the turn,
  // the game loop will pick it up.
  // In either case, we return the current lobbyData.
  return {updatePayload: lobbyData, batch};
};
