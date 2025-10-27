const {logMessage} = require("../utils/logHelpers");
const {playSpecificCardTwice} = require("../utils/gameLogicHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'RESOLVE_GIZMO_CHOICE' action.
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
  if (!player || player.prompt !== "gizmo-choice") {
    logMessage(lobbyData, "Player not found in correct state for Gizmo.",
        "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  const cardToPlay = hand[cardIndex];

  if (!cardToPlay || cardToPlay.type !== "M" || cardToPlay.id === "gizmo") {
    logMessage(lobbyData, "Invalid card choice for Gizmo.", "error");
    return lobbyData;
  }

  // Find the Gizmo card itself to pass as the source.
  const gizmoCard = lobbyData.players.flatMap((p) =>
    p.cardsInPlay).find((c) => c.id === "gizmo");

  // Play the chosen card. The follow-up logic will handle the replay.
  hand.splice(cardIndex, 1);
  await playSpecificCardTwice(player, hand, cardToPlay,
      lobbyData, lobbyId, gizmoCard);

  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};
