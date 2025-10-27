const {logMessage} = require("../utils/logHelpers");
const {executeChangeHistoryHelper} = require("../utils/gameLogicHelpers");
const {promptVisit} = require("../utils/promptingHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'changeHistory' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { zoneIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const lobbyData = afterData;
  const {zoneIndex} = payload;

  const playerIndex = lobbyData.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    logMessage(lobbyData, "Player not found in lobby.", "error");
    return lobbyData;
  }

  const player = lobbyData.players[playerIndex];
  lobbyData.lastAction = {type: player.prompt, uid: playerId};

  await executeChangeHistoryHelper(lobbyData, zoneIndex, db, lobbyId);

  lobbyData.legalZones = lobbyData.realZones;
  await promptVisit(player, lobbyData);

  return lobbyData;
};
