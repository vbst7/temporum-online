const {logMessage, peekStack} = require("../utils/logHelpers");
const {discardCard} = require("../utils/resourceHelpers");
const {
  executeZoneFollowUp,
  executeCardFollowUp,
} = require("../utils/followUpHelpers");
const {
  processPostVisitQueue,
  processStartOfTurnQueue,
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
  const origin = source?.origin;
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
    // If the resolution stack is empty, process the post-visit queue.
    // Otherwise, continue with the resolution stack.
    if (lobbyData.resolutionStack.length === 0) {
      if (origin === "start-of-turn") {
        await processStartOfTurnQueue(player, lobbyData, lobbyId);
      } else {
        await processPostVisitQueue(lobbyId, lobbyData);
      }
    } else {
      // The resolution stack is not empty, so we continue with the follow-up.
      const underlyingAction = peekStack(lobbyData);
      if (underlyingAction && underlyingAction.type === "zone") {
        const turnEnded = await executeZoneFollowUp(turnPlayer,
            underlyingAction.id, lobbyData, lobbyId,
            underlyingAction.instruction);
        if (turnEnded) return {updatePayload: lobbyData, batch};
      } else if (underlyingAction && underlyingAction.type === "card") {
        const turnEnded = await executeCardFollowUp(turnPlayer,
            underlyingAction.id, lobbyData, lobbyId,
            underlyingAction.instruction);
        if (turnEnded) return {updatePayload: lobbyData, batch};
      }
    }
  }
  // If we're here, either there are still players discarding,
  // or the follow-up didn't end the turn.
  return {updatePayload: lobbyData, batch};
};
