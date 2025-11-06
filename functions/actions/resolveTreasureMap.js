const {logMessage} = require("../utils/logHelpers");
const {drawCards, discardCard} = require("../utils/resourceHelpers");
const {processPostVisitQueue, declareWinner} =
require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");
/**
 * Handles the 'resolveTreasureMap' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { choice: true }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 **/
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId).collection("private").doc(playerId); // eslint-disable-line max-len
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {choice} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "treasure-map-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for Treasure Map.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {
    type: "treasure-map-choice",
    uid: playerId, context: {choice: choice},
  };

  console.log(`Choice: ${choice}`);

  if (choice) {
    const cardIndex = player.perpetuals.postVisit.findIndex((c) =>
      c.id === "treasure-map");
    if (cardIndex > -1) {
      const [perpetual] = player.perpetuals.postVisit.splice(cardIndex, 1);
      const cardToDiscard = {...perpetual, type: "P"}; // Ensure type is present

      // Temporarily add card back to hand for discard function
      hand.push(cardToDiscard);
      discardCard(player, hand, hand.length - 1, lobbyData);
      drawCards(player, hand, 2, lobbyData, {name: "Treasure Map", type: "P"});
    }
  } else {
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " keeps their "},
      {type: "card", value: "Treasure Map", cardType: "P"},
      {type: "text", value: "."},
    ]);
  }

  player.prompt = "";
  delete player.promptContext;
  player.handCount = hand.length;
  batch.update(privateRef, {hand});


  // The Treasure Map choice is done. Continue the original resolution.
  // Re-run the post-visit queue processing to handle any remaining effects.
  const result = await processPostVisitQueue(lobbyId, lobbyData);
  if (result?.winnerDeclared) {
    const winnerPayload = await declareWinner(
        lobbyId,
        lobbyData,
        result.winnerPlayer,
        result.reason,
    );
    return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
  }

  return {updatePayload: lobbyData, batch};
};
