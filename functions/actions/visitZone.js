const {logMessage} = require("../utils/logHelpers");
const {visitSpecificZone} = require("../utils/promptingHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'visitZone' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { zoneIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId).collection("private").doc(playerId); // eslint-disable-line max-len
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {zoneIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);

  if (!player) {
    logMessage(lobbyData, `Player ${playerId} not found in lobby.`, "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];

  // The core logic is in visitSpecificZone, which handles setting prompts,
  // executing zone effects, and managing the resolution stack.
  const newHand = await visitSpecificZone(player, hand, zoneIndex, lobbyData,
      lobbyId);

  // Update the public hand count and commit the private hand data.
  if (newHand !== undefined) {
    player.handCount = newHand.length;
    batch.update(privateRef, {hand: newHand});
  }

  return {updatePayload: lobbyData, batch};
};
