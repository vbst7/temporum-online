const {logMessage} = require("../utils/logHelpers");
const {processEndOfTurnQueue} = require("../utils/turnManagementHelpers");
const {executeEndOfTurnEffect} = require("../utils/loopHelpers");

/**
 * Handles the 'CHOOSE_END_OF_TURN' action.
 * A player with multiple end-of-turn effects chooses which one to resolve.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload.
 * @param {string} payload.choiceId The ID of the chosen effect.
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const {choiceId} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "end-of-turn-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for end-of-turn choice.",
        "error");
    return lobbyData;
  }

  lobbyData.lastAction = {type: "end-of-turn-choice", uid: playerId,
    context: {choiceId}};
  player.prompt = "";
  delete player.promptContext;


  // Find the chosen effect from all possible sources
  const effectIndex = lobbyData.endOfTurnQueue.findIndex((item) =>
    item.id === choiceId);

  if (effectIndex === -1) {
    logMessage(lobbyData, `Post-visit effect with id ${choiceId} not found in queue.`, "error"); // eslint-disable-line max-len
    // Still try to continue the queue to avoid getting stuck.
    await processEndOfTurnQueue(player, lobbyData, lobbyId);
    return lobbyData;
  }

  const [effect] = lobbyData.endOfTurnQueue.splice(effectIndex, 1);

  // Execute the chosen effect's logic directly.
  executeEndOfTurnEffect(effect, player, lobbyData, lobbyId);

  // If the chosen effect set a new prompt, we are done for now.
  if (player.prompt) {
    return lobbyData;
  }

  // Otherwise, re-process the queue to handle the next item or end the turn.
  await processEndOfTurnQueue(player, lobbyData, lobbyId);
  return lobbyData;
};
