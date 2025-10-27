/**
 * Appends a message to the game log.
 * @param {object} lobbyData The lobby data object containing the log.
 * @param {string|Array<object>} message The message text or an array of
 * message parts.
 * @param {string} [type='normal'] The type of log for styling.
 */
exports.logMessage = function(lobbyData, message, type = "normal") {
  if (!lobbyData.log) lobbyData.log = [];
  if (typeof message === "string") {
    lobbyData.log.push({text: message, type});
  } else {
    lobbyData.log.push({parts: message, type});
  }
  // For debugging resolution stack:
  //  lobbyData.log.push({ text: `Stack:
  //  ${JSON.stringify(lobbyData.resolutionStack)}`, type: 'debug' });
};

/**
 * Peeks at the top element of the resolution stack without removing it.
 * @param {object} lobbyData The lobby data object.
 * @return {object|null} The top element of the stack, or null if empty.
 */
exports.peekStack = function(lobbyData) {
  if (lobbyData.resolutionStack && lobbyData.resolutionStack.length > 0) {
    return lobbyData.resolutionStack[lobbyData.resolutionStack.length - 1];
  }
  return null;
};
