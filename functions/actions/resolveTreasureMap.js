const {logMessage, peekStack} = require("../utils/logHelpers");
const {drawCards, discardCard} = require("../utils/resourceHelpers");
const {executeZoneFollowUp} = require("../utils/followUpHelpers");
const {getFirestore} = require("firebase-admin/firestore");
/**
 * Handles the 'resolveTreasureMap' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { choice: true }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
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
  const id = player.promptContext.id;

  if (choice) {
    const cardIndex = player.perpetuals.postVisit.findIndex((c) => c.id === id);
    if (cardIndex > -1) {
      const [card] = player.perpetuals.postVisit.splice(cardIndex, 1);

      // Temporarily add card back to hand for discard function
      hand.push(card);
      discardCard(player, hand, hand.length - 1, lobbyData,
          {name: "Treasure Map", type: "P"});
      drawCards(player, hand, 2, lobbyData, {name: "Treasure Map", type: "P"});
    }
  } else {
    const card = player.perpetuals.postVisit.find((c) => c.id === id);
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " keeps their "},
      {type: "card", value: card.name, cardType: card.type},
      {type: "text", value: "."},
    ]);
  }

  player.prompt = "";
  delete player.promptContext;
  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  // The Treasure Map choice is done. Continue the original resolution.
  const action = peekStack(lobbyData);
  if (action && action.type === "zone") {
    const turnEnded = await executeZoneFollowUp(player, action.id, lobbyData,
        lobbyId, action.instruction);
    if (turnEnded) return {updatePayload: lobbyData, batch};
  }
  return {updatePayload: lobbyData, batch};
};
