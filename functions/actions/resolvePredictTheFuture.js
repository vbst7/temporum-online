const {logMessage} = require("../utils/logHelpers");
const {executeChangeHistoryHelper} = require("../utils/gameLogicHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles the 'resolvePredictTheFuture' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { choice: true }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data, potentially with winner information.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const {choice} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  lobbyData.lastAction = {type: "predict-the-future", uid: playerId,
    context: {choice: choice}};
  if (choice) {
    logMessage(lobbyData,
        `${player.name} chose to change history for Predict the Future.`);
    // Only get a db instance if a zone that needs it (like Endless City)
    // is present in the timeline.
    let db = null;
    const timeIVZones = lobbyData.zones.slice(6, 10);
    if (timeIVZones.some((z) => z.id === "endless-city")) {
      db = getFirestore();
    }
    executeChangeHistoryHelper(lobbyData,
        player.promptContext.zoneIndex, db, lobbyId);
  }

  player.prompt = "";
  delete player.promptContext;

  // After resolving, continue the post-visit sequence.
  await require("../utils/turnManagementHelpers")
      .processPostVisitQueue(lobbyId, lobbyData);
  // If processPostVisitQueue set a new prompt or ended the turn,
  // the game loop will pick it up.
  return lobbyData;
};
