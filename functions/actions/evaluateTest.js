// functions/actions/evaluateTest.js

const {getFirestore} = require("firebase-admin/firestore");
const {evaluateEndCondition, recordTestResult, getAuthoritativeLobbyState} = require("../utils/testResultHelpers");
const {logMessage} = require("../utils/logHelpers");

/**
 * Evaluates the final state of an automated test.
 * This is a primary action triggered by an AI with the 'test' prompt.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the AI player initiating the action.
 * @param {object} payload The action-specific payload (empty for this action).
 * @param {object} lobbyData The current state of the lobby document.
 * @return {object} The updated lobby data with the test result.
 */
exports.execute = async (lobbyId, playerId, payload, lobbyData) => {
  const authoritativeLobbyData = await getAuthoritativeLobbyState(lobbyId);
  if (!authoritativeLobbyData) {
    lobbyData.status = "finished";
    lobbyData.winner = "ERROR: Lobby not found during evaluation.";
    return lobbyData;
  }

  const testConfig = authoritativeLobbyData.testConfig;
  const evaluationResult = evaluateEndCondition(authoritativeLobbyData, testConfig.endCondition);
  const spectatorLeaves = await recordTestResult(lobbyId, testConfig, authoritativeLobbyData, evaluationResult.success ? "pass" : "fail");

  const resultMessage = evaluationResult.success ? "Automated test PASSED" : `Automated test FAIL: ${evaluationResult.message}`;
  logMessage(authoritativeLobbyData, `Automated test finished. Result: ${evaluationResult.success ? "PASS" : "FAIL"}.`);

  // Modify the lobbyData object directly. The gameEngine will handle the update.
  authoritativeLobbyData.status = "finished";
  authoritativeLobbyData.winner = resultMessage;
  if (spectatorLeaves) {
    authoritativeLobbyData.deleteMe = true;
  }

  return authoritativeLobbyData;
};
