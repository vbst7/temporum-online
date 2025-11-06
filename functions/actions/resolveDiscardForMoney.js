const {logMessage, peekStack} = require("../utils/logHelpers");
const {discardCard, gainMoney} = require("../utils/resourceHelpers");
const {
  executeZoneFollowUp,
  executeCardFollowUp,
} = require("../utils/followUpHelpers");
const {
  processPostVisitQueue,
} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles generic "discard a card for money" actions.
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
  const {cardIndex, sourceZoneId} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: player.prompt, uid: playerId,
    context: {sourceZoneId, cardIndex}};

  let moneyToGain = 0;
  let source = {};

  if (sourceZoneId === "imperial-china") {
    moneyToGain = 4;
    source = {name: "Imperial China", type: "white"};
  } else if (sourceZoneId === "greek-america") {
    moneyToGain = 6;
    source = {name: "Greek America", type: "green"};
  }

  discardCard(player, hand, cardIndex, lobbyData, source);
  gainMoney(player, moneyToGain, lobbyData, source);

  player.prompt = "";
  player.handCount = hand.length;

  lobbyData.resolutionStack.pop();
  let turnEnded;
  // Check if there's a zone follow-up or end the turn.
  // If the resolution stack is empty, process the post-visit queue.
  // Otherwise, continue with the resolution stack.
  if (lobbyData.resolutionStack.length === 0) {
    await processPostVisitQueue(lobbyId, lobbyData);
    // The game loop will handle the next step if a
    // prompt was set or turn ended.
  } else {
    const action = peekStack(lobbyData);
    if (action && action.type === "zone") {
      turnEnded = await executeZoneFollowUp(player, action.id, lobbyData,
          lobbyId, action.instruction);
      if (turnEnded) return lobbyData;
    } else if (action && action.type === "card") {
      turnEnded = await executeCardFollowUp(player, action.id, lobbyData,
          lobbyId, action.instruction);
      if (turnEnded) return lobbyData;
    }
  }

  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};
