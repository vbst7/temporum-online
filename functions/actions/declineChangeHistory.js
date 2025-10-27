const {logMessage} = require("../utils/logHelpers");
const {promptVisit} = require("../utils/promptingHelpers");

/**
 * Handles the 'declineChangeHistory' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (empty for this action).
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;

  const playerIndex = lobbyData.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    logMessage(lobbyData, "Player not found in lobby.", "error");
    return lobbyData;
  }

  const player = lobbyData.players[playerIndex];

  lobbyData.lastAction = {type: player.prompt, uid: playerId};
  // Explicitly clear the old prompt from the map before setting the new one.
  if (lobbyData.activePrompts && lobbyData.activePrompts[playerId]) {
    delete lobbyData.activePrompts[playerId];
  }

  lobbyData.legalZones = lobbyData.realZones;
  await promptVisit(player, lobbyData);

  return lobbyData;
};
