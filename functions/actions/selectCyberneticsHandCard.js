const {logMessage} = require("../utils/logHelpers");
const {playSpecificCard} = require("../utils/gameLogicHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'selectCyberneticsHandCard' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { handCardIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId).collection("private").doc(playerId); // eslint-disable-line max-len
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {handCardIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "cybernetics-hand") {
    logMessage(lobbyData,
        "Player not found or not in correct state for cybernetics.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {
    type: "cybernetics-hand",
    uid: playerId,
    context: {cardIndex: handCardIndex},
  };
  const perpetualId = player.promptContext?.perpetualId;
  if (!perpetualId) {
    logMessage(lobbyData,
        "Cybernetics hand selection failed: no perpetualId in context.",
        "error");
    return lobbyData;
  }

  // Find the perpetual card object to copy
  let perpetualToCopy = null;
  if (player.perpetuals) {
    // eslint-disable-next-line guard-for-in
    for (const key in player.perpetuals) { // NOSONAR
      const found = player.perpetuals[key].find((c) => c.id === perpetualId);
      if (found) {
        perpetualToCopy = found;
        break;
      }
    }
  }
  if (!perpetualToCopy) {
    logMessage(lobbyData,
        `Could not find perpetual with id ${perpetualId} to copy.`, "error");
    return lobbyData;
  }

  const cardToTransform = hand[handCardIndex];
  if (!cardToTransform) {
    logMessage(lobbyData, "Invalid hand card index for cybernetics.", "error");
    return lobbyData;
  }

  // Create a copy of the perpetual card to be played.
  const newCard = {...perpetualToCopy};

  // Remove the original card from hand.
  hand.splice(handCardIndex, 1);
  player.handCount = hand.length;

  logMessage(lobbyData, [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: " uses "},
    {type: "zone", value: "Age of Cybernetics", color: "silver"},
    {type: "text", value: " to play "},
    {type: "card", value: cardToTransform.name, cardType: cardToTransform.type},
    {type: "text", value: " as a copy of "},
    {type: "card", value: newCard.name, cardType: newCard.type},
    {type: "text", value: "."},
  ]);

  player.prompt = "";
  delete player.promptContext;

  // The playSpecificCard function will handle the rest of the logic,
  // including follow-ups.
  await playSpecificCard(player, hand, newCard, lobbyData, lobbyId);

  return {updatePayload: lobbyData, batch};
};
