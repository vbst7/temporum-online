const {logMessage} = require("../utils/logHelpers");
const {discardCard} = require("../utils/resourceHelpers");
const {processEndOfTurnQueue} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'RESOLVE_SUNBOAT' action.
 * @param {string} lobbyId The ID of the lobby.
* @param {string} playerId The ID of the player initiating the action.
* @param {object} payload The action-specific payload (e.g., {choice: true}).
* @param {object} afterData The current state of the lobby document.
*/
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {choice} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "sunboat-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for Sunboat of Ra.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: "sunboat-choice", uid: playerId,
    context: {choice: choice}};

  if (choice) {
    const cardIndex = player.perpetuals.turnEnd
        .findIndex((c) => c.id === "sunboat-of-ra");
    if (cardIndex > -1) {
      const [perpetual] = player.perpetuals.turnEnd.splice(cardIndex, 1);
      const card = {...perpetual, type: "P"};

      hand.push(card); // Temporarily add card back to hand for discard
      discardCard(player, hand, hand.length - 1, lobbyData,
          {name: "Sunboat of Ra", type: "P"});

      if (!player.extraTurns) player.extraTurns = 0;
      player.extraTurns += 1;
    }
  } else {
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " declines to use "},
      {type: "card", value: "Sunboat of Ra", cardType: "P"},
      {type: "text", value: "."},
    ]);
  }

  player.prompt = "";
  delete player.promptContext;

  await processEndOfTurnQueue(player, lobbyData, lobbyId);

  player.handCount = hand.length;
  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};

