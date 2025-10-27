const {logMessage} = require("../utils/logHelpers");
const {setPlayerPrompt} = require("../utils/promptingHelpers.js");

/**
 * Handles the 'selectCyberneticsPerpetual' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { perpetualCardId: '...' }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const {perpetualCardId} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "cybernetics-perpetual") {
    logMessage(lobbyData,
        "Player not found or not in correct state for cybernetics.", "error");
    return lobbyData;
  }

  lobbyData.lastAction = {
    type: "cybernetics-perpetual",
    uid: playerId,
    context: {cardId: perpetualCardId},
  };
  logMessage(lobbyData, [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: " selects a perpetual to copy."},
  ]);

  setPlayerPrompt(player, lobbyData, "cybernetics-hand",
      {perpetualId: perpetualCardId});

  return lobbyData;
};
