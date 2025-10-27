const {logMessage, peekStack} = require("../utils/logHelpers");
const {discardCard} = require("../utils/resourceHelpers");
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
 * Handles the 'discardAndContinue' action.
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
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: player.prompt, uid: playerId};
  const source = player.promptContext?.source;
  // Discard the card
  discardCard(player, hand, cardIndex, lobbyData, source);
  player.handCount = hand.length;
  // Batch the update for the discarding player's hand immediately.
  // This must happen before any early returns.
  batch.update(privateRef, {hand});

  // Clear the prompt for the player who just acted
  player.prompt = "";

  // Check if any other players still have a prompt.
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);

  if (!anyPlayerHasPrompt) {
    // All discard actions are complete. The original turn can now proceed.
    const turnPlayer = lobbyData.players.find((p) => p.turn);
    if (lobbyData.resolutionStack.length > 0) {
      const underlyingAction = peekStack(lobbyData);
      // We need the turn player's hand for the follow-up.
      const turnPlayerPrivateRef = db.collection("lobbies").doc(lobbyId)
          .collection("private").doc(turnPlayer.id);
      const turnPlayerPrivateSnap = await turnPlayerPrivateRef.get();
      const turnPlayerHand = turnPlayerPrivateSnap.exists ?
        turnPlayerPrivateSnap.data().hand : [];

      if (underlyingAction && underlyingAction.type === "zone") {
        const turnEnded = await executeZoneFollowUp(turnPlayer,
            underlyingAction.id, lobbyData, lobbyId,
            underlyingAction.instruction,
            {updatedHand: turnPlayerHand});
        if (turnEnded) return {updatePayload: lobbyData, batch};
      } else if (underlyingAction && underlyingAction.type === "card") {
        const turnEnded = await executeCardFollowUp(turnPlayer,
            underlyingAction.id, lobbyData, lobbyId,
            underlyingAction.instruction,
            {updatedHand: turnPlayerHand});
        if (turnEnded) return {updatePayload: lobbyData, batch};
      }
    } else {
      // The stack is empty, so the turn is over.
      const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
      if (result?.winnerDeclared) {
        const winnerPayload = await declareWinner(lobbyId, lobbyData,
            result.winnerPlayer, result.reason);
        return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
      }
      return {updatePayload: lobbyData, batch};
    }
  }
  // If we're here, either there are still players discarding,
  // or the follow-up didn't end the turn.
  return {updatePayload: lobbyData, batch};
};
