const {logMessage, peekStack} = require("../utils/logHelpers");
const {drawCards} = require("../utils/resourceHelpers");
const {promptScore, promptPlay} = require("../utils/promptingHelpers");
const {executeZoneFollowUp} =
  require("../utils/followUpHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'CHOOSE_ACTION' action for white zones.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { choice: 'draw' }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  // TODO: privateSnap is unused.

  const lobbyData = afterData;
  const {choice} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  const action = peekStack(lobbyData);
  lobbyData.lastAction = {type: "choose", uid: playerId, context: {choice}};

  switch (choice) {
    case "score":
      await promptScore(player, hand, "", lobbyData);
      break;
    case "draw":
      if (action && action.type === "zone") {
        const zone = lobbyData.zones.find((z) => z.id === action.id);
        drawCards(player, hand, 2, lobbyData,
            {name: zone.name, type: zone.color});
      } else {
        drawCards(player, hand, 2, lobbyData); // Fallback without context
      }
      player.prompt = "";
      break;
    case "play":
      await promptPlay(player, hand, lobbyData);
      break;
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  // If the choice resulted in no new prompt (i.e., 'draw'),
  // then we can proceed with the zone follow-up.
  if (!player.prompt) { // eslint-disable-line max-len
    if (action && action.type === "zone") {
      const result = await executeZoneFollowUp(player, action.id,
          lobbyData, lobbyId, action.instruction, {updatedHand: hand});

      player.handCount = result.hand.length;
      batch.update(privateRef, {hand: result.hand});
      if (result.turnEnded) return {updatePayload: lobbyData, batch};
    }
  }

  return {updatePayload: lobbyData, batch};
};
