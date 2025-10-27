// functions/actions/resolveY2KDiscard.js

const {logMessage, peekStack} = require("../utils/logHelpers");
const {discardCard, gainMoney} = require("../utils/resourceHelpers");
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
 * Handles a player's choice for the Y2K zone effect.
 * The player can either discard a specific Perpetual card to gain $12,
 * or decline the offer.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player making the choice.
 * @param {object} payload The action-specific payload.
 * @param {number|null} payload.cardIndex The index of the card to discard,
 * or null to decline.
 * @param {object} lobbyData The current state of the lobby document.
 * @return {object} The updated lobby data.
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
  const source = {name: "Y2K", type: "brown"};
  switch (cardIndex) { // eslint-disable-line no-unused-vars
    case null:
      logMessage(lobbyData, [
        {type: "player", value: player.name, color: player.color},
        {type: "text", value: " declines to discard for "},
        {type: "zone", value: "Y2K", color: "brown"},
        {type: "text", value: "."},
      ]);
      break;
    default: // Player chose to discard a card.
      gainMoney(player, 12, lobbyData, source);
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
