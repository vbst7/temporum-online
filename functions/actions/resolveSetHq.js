const {getFirestore} = require("firebase-admin/firestore");
const {logMessage} = require("../utils/logHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");

/**
 * Handles the 'resolveSetHq' action for Age of Atlantis.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { zoneIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const lobbyData = afterData;
  const {zoneIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, `Player ${playerId} not found.`, "error");
    return lobbyData;
  }

  if (player.prompt !== "set-hq") {
    logMessage(lobbyData, `Player ${player.name}
       is not being prompted to set an HQ.`, "error");
    return lobbyData;
  }

  if (!lobbyData.legalZones.includes(zoneIndex)) {
    logMessage(lobbyData, `Invalid zone choice for HQ: ${zoneIndex}.`, "error");
    return lobbyData;
  }

  const chosenZone = lobbyData.zones[zoneIndex];
  player.hq = zoneIndex;

  logMessage(lobbyData, [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: " established their HQ in "},
    {type: "zone", value: chosenZone.name, color: chosenZone.color},
    {type: "text", value: " ("},
    {type: "zone", value: "Age of Atlantis", color: "yellow"},
    {type: "text", value: ")."},
  ]);


  // Clear the prompt
  player.prompt = "";
  delete lobbyData.activePrompts[player.id];
  if (player.promptContext) delete player.promptContext;
  lobbyData.legalZones = [];

  // The zone action is now fully resolved.
  lobbyData.resolutionStack.pop();

  const result = checkAnubisAndEndTurn(lobbyId, lobbyData);
  if (result?.winnerDeclared) {
    const winnerPayload = declareWinner(lobbyId, lobbyData,
        result.winnerPlayer, result.reason);
    return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
  }

  return {updatePayload: lobbyData, batch};
};
