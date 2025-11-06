const {logMessage} = require("../utils/logHelpers");
const {processPostVisitQueue} = require("../utils/turnManagementHelpers");
const {executePostVisitEffect} = require("../utils/loopHelpers");

/**
 * Handles the 'CHOOSE_POST_VISIT' action.
 * A player with multiple post-visit effects chooses which one to resolve first.
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
  if (!player || player.prompt !== "post-visit-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for post-visit choice.",
        "error");
    return lobbyData;
  }

  lobbyData.lastAction = {type: "post-visit-choice", uid: playerId,
    context: {choiceId}};
  player.prompt = "";
  delete player.promptContext;

  // Find the chosen effect and remove it from the queue.
  const effectIndex = lobbyData.postVisitQueue.findIndex((item) =>
    item.id === choiceId);

  if (effectIndex === -1) {
    logMessage(lobbyData, `Post-visit effect with id ${choiceId} not found in queue.`, "error"); // eslint-disable-line max-len
    // Still try to continue the queue to avoid getting stuck.
    await processPostVisitQueue(lobbyId, lobbyData);
    return lobbyData;
  }

  const [effect] = lobbyData.postVisitQueue.splice(effectIndex, 1);

  // Execute the chosen effect's logic directly.
  executePostVisitEffect(effect, lobbyData);

  return lobbyData;
};
