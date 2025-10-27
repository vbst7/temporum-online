const {logMessage} = require("../utils/logHelpers");
const {gainMoney, drawCards} = require("../utils/resourceHelpers");
const {setPlayerPrompt} = require("../utils/promptingHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'resolveBabylonianChoice' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload.
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
  const source = {name: "Babylonian Bazaar", type: "yellow"};

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: player.prompt, uid: playerId,
    context: {choice}};

  player.prompt = "";

  if (choice && player.coins >= 10) {
    gainMoney(player, -10, lobbyData, source);
    drawCards(player, hand, 2, lobbyData, source);
    player.crowns = 2;
    setPlayerPrompt(player, lobbyData, "advance",
        {crownCount: 2, source: source});
  } else {
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " declined the offer from "},
      {type: "zone", value: "Babylonian Bazaar", color: "yellow"},
      {type: "text", value: "."},
    ]);
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
  if (anyPlayerHasPrompt) {
    return {updatePayload: lobbyData, batch};
  }

  const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
  if (result && result.winnerDeclared) {
    const winnerPayload = await declareWinner(lobbyId, lobbyData,
        result.winnerPlayer, result.reason);
    return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
  }

  return {updatePayload: lobbyData, batch};
};
