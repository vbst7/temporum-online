const {logMessage} = require("../utils/logHelpers");
const {discardCard} = require("../utils/resourceHelpers");
const {playSpecificCard} = require("../utils/gameLogicHelpers");
const {declareWinner} =
  require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'resolveToysChoice' action for Age of Toys.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { chosenCardIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data, potentially with winner information.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId).collection("private").doc(playerId); // eslint-disable-line max-len
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {chosenCardIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "toys-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for Age of Toys.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {
    type: "toys-choice",
    uid: playerId,
    context: {cardIndex: chosenCardIndex},
  };
  const handSize = hand.length;
  if (handSize < 2) {
    logMessage(lobbyData,
        "Age of Toys choice made with less than 2 cards in hand.", "error");
    player.prompt = ""; // clear prompt to avoid getting stuck
    // End turn if something went wrong
    const {processPostVisitQueue} = require("../utils/turnManagementHelpers");
    const result = await processPostVisitQueue(lobbyId, lobbyData);
    if (result && result.winnerDeclared) {
      const winnerPayload = await declareWinner(lobbyId, lobbyData,
          result.winnerPlayer, result.reason);
      return {...lobbyData, ...winnerPayload};
    }
    return lobbyData;
  }

  const card1Index = handSize - 2;
  const card2Index = handSize - 1;

  if (chosenCardIndex !== card1Index && chosenCardIndex !== card2Index) {
    logMessage(lobbyData,
        `Invalid card choice for Age of Toys. Chosen: ${chosenCardIndex}, options: ${card1Index}, ${card2Index}`, // eslint-disable-line max-len
        "error");
    return lobbyData;
  }

  const unchosenCardIndex = (chosenCardIndex === card1Index) ?
    card2Index : card1Index;

  // Get objects before modifying array
  const cardToPlay = hand[chosenCardIndex];
  const cardToDiscard = hand[unchosenCardIndex];

  // Remove both from hand. Sort indices to splice correctly.
  const sortedIndices = [chosenCardIndex, unchosenCardIndex]
      .sort((a, b) => b - a);
  hand.splice(sortedIndices[0], 1);
  hand.splice(sortedIndices[1], 1);

  // Discard the unchosen card
  if (!lobbyData.discardPile) lobbyData.discardPile = [];
  hand.push(cardToDiscard); // Temporarily add card back to hand for discard
  discardCard(player, hand, hand.length - 1, lobbyData,
      {name: "Age of Toys", type: "silver"});

  // Play the other card.
  player.prompt = ""; // Clear toys-choice prompt
  // playSpecificCard handles its own follow-up logic
  await playSpecificCard(player, hand, cardToPlay, lobbyData, lobbyId);

  // If playSpecificCard set a new prompt or ended the turn,
  // the game loop will pick it up.
  // In either case, we return the current lobbyData.
  player.handCount = hand.length;
  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};
