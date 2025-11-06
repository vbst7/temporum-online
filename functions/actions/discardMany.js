const {logMessage, peekStack} = require("../utils/logHelpers");
const {discardCard, gainMoney} = require("../utils/resourceHelpers");
const {executeZoneFollowUp, executeCardFollowUp} =
  require("../utils/followUpHelpers");
const {getFirestore} = require("firebase-admin/firestore");
const {setPlayerPrompt} = require("../utils/promptingHelpers.js");
/**
 * Handles the 'discardMany' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data, potentially with winner information.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {discardArray} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {
    type: player.prompt,
    uid: playerId,
    context: {cardIndices: discardArray},
  };
  // The card that prompted this is on top of the resolution stack.
  const cardAction = peekStack(lobbyData);
  const source = player.promptContext?.source;

  // Sort indices in descending order to avoid issues with splice
  discardArray.sort((a, b) => b - a);
  const discardedCount = discardArray.length;

  for (const cardIndex of discardArray) {
    discardCard(player, hand, cardIndex, lobbyData, source);
  }

  player.prompt = "";
  if (player.promptContext) {
    delete player.promptContext;
  }
  if (lobbyData.activePrompts && lobbyData.activePrompts[player.id]) {
    delete lobbyData.activePrompts[player.id];
  }

  if (cardAction) {
    switch (cardAction.id) {
      case "barbarian-horde": {
        if (discardedCount > 0) {
          player.crowns = discardedCount;
          setPlayerPrompt(player, lobbyData, "advance",
              {crownCount: discardedCount,
                source: {name: "Barbarian Horde", type: "M"}});
        }
        break;
      }
      case "crown-jewels": {
        gainMoney(player, (4 * discardedCount), lobbyData,
            {name: "Crown Jewels", type: "M"});
        break;
      }
      case "engineer": {
        if (discardedCount !== 2) {
          logMessage(lobbyData, `Engineer effect requires discarding 2 cards, but ${discardedCount} were selected. Action aborted.`, "error"); // eslint-disable-line max-len
          player.prompt = "discard-n"; // Re-prompt the player
        }
        break;
      }
      case "scrapyard-world": {
        setPlayerPrompt(player, lobbyData, "advance",
            {crownCount: player.crowns, source: {type: "score"},
              scoredCardId: player.cardBeingScored.id});
        if (!lobbyData.discardPile) lobbyData.discardPile = [];
        lobbyData.discardPile.push(player.cardBeingScored);
        player.cardBeingScored = null;
        break;
      }
    }
  }

  // If a new prompt was set for any player (e.g., 'advance'),
  // we just update and are done.
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
  if (anyPlayerHasPrompt) { // eslint-disable-line no-unused-vars
    player.handCount = hand.length;
    batch.update(privateRef, {hand});
    return {updatePayload: lobbyData, batch};
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  // Finish playing the card or executing the zone
  if (lobbyData.resolutionStack.length === 0) {
    // If the resolution stack is empty, process the post-visit queue.
    await require("../utils/turnManagementHelpers")
        .processPostVisitQueue(lobbyId, lobbyData);
    // The game loop will handle the next step if a
    // prompt was set or turn ended.
    return {updatePayload: lobbyData, batch};
  } else {
    const action = peekStack(lobbyData);
    if (action && action.type === "zone") {
      const turnEnded = await executeZoneFollowUp(player, action.id, lobbyData,
          lobbyId, action.instruction, {updatedHand: hand});
      // Follow-up handled the update and turn progression
      if (turnEnded) return {updatePayload: lobbyData, batch};
    } else if (action && action.type === "card") {
      const turnEnded = await executeCardFollowUp(player, action.id, lobbyData,
          lobbyId, action.instruction, {updatedHand: hand});
      if (turnEnded) return {updatePayload: lobbyData, batch};
    }
  }

  return {updatePayload: lobbyData, batch};
};
