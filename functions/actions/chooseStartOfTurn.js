const {logMessage} = require("../utils/logHelpers");
const {processStartOfTurnQueue} = require("../utils/turnManagementHelpers");
const {executeStartOfTurnEffect,
  handleSecretCard} = require("../utils/loopHelpers");

/**
 * Handles the 'CHOOSE_START_OF_TURN' action.
 * A player with multiple start-of-turn effects chooses which one to resolve.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload.
 * @param {string} payload.choiceId The ID of the chosen effect.
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const choiceId = payload.choiceId;
  logMessage(lobbyData, JSON.stringify(payload));
  console.log(payload);

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player || player.prompt !== "start-of-turn-choice") {
    logMessage(lobbyData,
        "Player not found or not in correct state for start-of-turn choice.",
        "error");
    return lobbyData;
  }

  lobbyData.lastAction = {type: "start-of-turn-choice", uid: playerId,
    context: {choiceId}};
  player.prompt = "";
  delete player.promptContext;
  let batch = null;

  if (choiceId === "secret-card") {
    batch = await handleSecretCard(player, payload.secretIndex,
        lobbyData, lobbyId);
  } else {
    // Find the chosen effect from all possible sources
    let effectIndex = -1;
    if (lobbyData.startOfTurnQueue) {
      effectIndex = lobbyData.startOfTurnQueue.findIndex((item) =>
        item.id === choiceId);
    }

    if (effectIndex === -1) {
      // The effect might be a zone effect or secret-decline,
      // which are not in the queue.
      if (choiceId.startsWith("cold-war")) {
        await executeStartOfTurnEffect({cardId: "cold-war"},
            player, lobbyData, lobbyId);
      } else if (choiceId.startsWith("dark-ages")) {
        await executeStartOfTurnEffect({cardId: "dark-ages"},
            player, lobbyData, lobbyId);
      } else if (choiceId.startsWith("secret-decline")) {
        await executeStartOfTurnEffect({cardId: "secret-decline"},
            player, lobbyData, lobbyId);
      } else {
        logMessage(lobbyData, `Turn-start effect with id ${choiceId} not found in queue.`, "error"); // eslint-disable-line max-len
      }
    } else {
      const [effect] = lobbyData.startOfTurnQueue.splice(effectIndex, 1);
      // Execute the chosen effect's logic directly.
      await executeStartOfTurnEffect(effect, player, lobbyData, lobbyId);
    }
  }

  // If the chosen effect set a new prompt (e.g., discard for Dark Ages),
  // we must stop and let the player resolve it. The action that resolves
  // that new prompt will be responsible for re-processing the queue.
  if (player.prompt) {
    return {updatePayload: lobbyData, batch};
  }

  // Otherwise, re-process the queue to handle the next item or start the turn.
  // This is crucial to handle any remaining effects
  // BEFORE resolving a new prompt
  // set by the chosen effect (like a discard from Dark Ages).
  const finalLobbyData = await processStartOfTurnQueue(player,
      lobbyData, lobbyId);
  return {updatePayload: finalLobbyData, batch};
};
