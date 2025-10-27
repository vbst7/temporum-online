const {logMessage, peekStack} = require("../utils/logHelpers");
const {discardCard, stealMoney} = require("../utils/resourceHelpers");
const {
  executeZoneFollowUp,
  executeCardFollowUp,
} = require("../utils/followUpHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'resolveInquisition' action.
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
  const {cardIndex} = payload; // eslint-disable-line no-unused-vars

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: player.prompt, uid: playerId};
  const source = {name: "Inquisition", type: "green"};
  switch (cardIndex) { // eslint-disable-line no-unused-vars
    case null:
      stealMoney(player, 2, lobbyData, source);
      break;
    case -1: // Player chose to discard but had no cards.
      logMessage(lobbyData, [
        {type: "player", value: player.name, color: player.color},
        {type: "text", value: " chooses to discard a card for "},
        {type: "zone", value: "Inquisition", color: "green"},
        {type: "text", value: "(but had none)."},
      ]);
      break;
    default: // Player chose to discard a card.
      discardCard(player, hand, cardIndex, lobbyData, source);
      player.handCount = hand.length;
      batch.update(privateRef, {hand});
  }
  player.prompt = "";

  // Check if any other players still have a prompt.
  // eslint-disable-next-line no-unused-vars
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);

  if (!anyPlayerHasPrompt) {
    // Everyone has responded. The original zone visit is now fully resolved.
    // Check if there's a zone follow-up or end the turn.
    const turnPlayer = lobbyData.players.find((p) => p.turn);
    let turnEnded;
    if (lobbyData.resolutionStack.length === 0) {
      const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
      if (result && result.winnerDeclared) {
        const winnerPayload = await declareWinner(lobbyId, lobbyData,
            result.winnerPlayer, result.reason);
        return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
      }
    } else {
      const action = peekStack(lobbyData);
      if (action && action.type === "zone") {
        turnEnded = await executeZoneFollowUp(turnPlayer, action.id, lobbyData,
            lobbyId, action.instruction);
        if (turnEnded) return {updatePayload: lobbyData, batch};
      } else if (action && action.type === "card") {
        turnEnded = await executeCardFollowUp(turnPlayer, action.id, lobbyData,
            lobbyId, action.instruction);
        if (turnEnded) return {updatePayload: lobbyData, batch};
      }
    }
  } else {
    // Still waiting on others, just update the state.
  }

  return {updatePayload: lobbyData, batch};
};
