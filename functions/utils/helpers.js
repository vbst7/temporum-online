// functions/utils/helpers.js

/**
 * Appends a message to the game log.
 * @param {object} lobbyData The lobby data object containing the log.
 * @param {string} text The message text.
 * @param {string} [type='system'] The type of log for styling ('system',
 * 'game', etc.).
 */
function logMessage(lobbyData, text, type = "system") {
  if (!lobbyData.log) {
    lobbyData.log = [];
  }
  // To prevent excessively long logs, you might want to cap the log size
  if (lobbyData.log.length > 100) {
    lobbyData.log.shift(); // Remove the oldest message
  }
  lobbyData.log.push({text, timestamp: new Date().toISOString(), type});
}

/**
 * Checks if a player has more crowns in a specific age than any other player.
 * @param {object} player The player to check.
 * @param {number} ageIndex The index of the age (0-3).
 * @param {Array<object>} allPlayers The array of all player objects.
 * @return {boolean} True if the player is the sole ruler of the age.
 */
function doesPlayerRuleAge(player, ageIndex, allPlayers) {
  const playerScore = player.scoreTrack[ageIndex];
  if (playerScore === 0) return false;
  for (const otherPlayer of allPlayers) {
    if (otherPlayer.id !== player.id) {
      if (otherPlayer.scoreTrack[ageIndex] >= playerScore) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Counts how many ages a player is currently ruling.
 * @param {object} player The player to check.
 * @param {Array<object>} allPlayers The array of all player objects.
 * @return {number} The number of ages ruled by the player.
 */
function timesRuled(player, allPlayers) {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (doesPlayerRuleAge(player, i, allPlayers)) {
      count++;
    }
  }
  return count;
}


module.exports = {
  logMessage,
  doesPlayerRuleAge,
  timesRuled,
};
