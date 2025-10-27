const {logMessage, peekStack} = require("../utils/logHelpers");
const {executeZoneFollowUp} = require("../utils/followUpHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'returnCard' action for Bright Ages.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { cardIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
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
  const cardToReturn = hand[cardIndex];

  if (!cardToReturn) {
    logMessage(lobbyData, "Card to return not found in hand.", "error");
    return lobbyData;
  }

  // Remove card from hand and place it on top of the deck
  hand.splice(cardIndex, 1);
  lobbyData.deck.unshift(cardToReturn);
  lobbyData.topCard = cardToReturn; // Set for UI display

  logMessage(lobbyData, [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: " returned "},
    {type: "card", value: cardToReturn.name, cardType: cardToReturn.type},
    {type: "text", value: " to the top of the deck (Bright Ages)."},
  ]);

  player.prompt = "";
  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  const action = peekStack(lobbyData);
  await executeZoneFollowUp(player, action.id,
      lobbyData, lobbyId, action.instruction, {updatedHand: hand});

  return {updatePayload: lobbyData, batch};
};
