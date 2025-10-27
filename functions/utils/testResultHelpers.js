// functions/utils/testResultHelpers.js

const {getFirestore} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const {logMessage} = require("./logHelpers");

/**
 * Fetches the complete and authoritative state of a lobby, including private
 * data like player hands. This is crucial for accurate end-of-test evaluation.
 * @param {string} lobbyId The ID of the lobby to fetch.
 * @return {object|null} The complete lobby data object, or null if not found.
 */
async function getAuthoritativeLobbyState(lobbyId) {
  const db = getFirestore();
  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const lobbySnap = await lobbyRef.get();

  if (!lobbySnap.exists) {
    logger.error(`Lobby ${lobbyId} not found for authoritative state fetch.`);
    return null;
  }

  const lobbyData = lobbySnap.data();

  // Fetch and attach each player's private hand data.
  for (const player of lobbyData.players) {
    const privateRef = lobbyRef.collection("private").doc(player.id);
    const privateSnap = await privateRef.get();
    const hand = privateSnap.exists ? privateSnap.data().hand : [];
    player.hand = hand; // Attach the actual hand for detailed checks
    player.handCount = hand.length; // Ensure handCount is perfectly accurate.
  }

  return lobbyData;
}
/**
 * Evaluates the end condition for an automated test.
 * @param {object} lobbyData The current lobby data.
 * @param {object} endCondition The condition to evaluate.
 * @return {boolean} True if the condition is met, false otherwise.
 */
function evaluateEndCondition(lobbyData, endCondition) {
  if (!endCondition) {
    logger.warn("No endCondition specified for automated test. Defaulting to pass.");
    return {success: true, message: ""};
  }

  // Handle complex "AND" conditions
  if (endCondition.type === "AND" && Array.isArray(endCondition.conditions)) {
    for (const cond of endCondition.conditions) {
      const result = evaluateEndCondition(lobbyData, cond);
      logger.info(`Result: ${result.success}`);
      logger.info(`Message: ${result.message}`);
      if (result.success === false) {
        logger.info(`Failure, returning success:false`);
        return {success: false, message: `Sub-condition failed: ${result.message}`};
      }
    }
    return {success: true, message: ""};
  }

  // Some conditions are global and don't need a player.
  const player = lobbyData.players.find((p) => p.id === endCondition.playerId);
  if (!player &&
      endCondition.type !== "discardPileCount" &&
      endCondition.type !== "discardPileContains" &&
      endCondition.type !== "zoneHourglass" &&
      endCondition.type !== "playerZone") {
    logger.error(`Player ${endCondition.playerId} not found for end condition evaluation.`);
    return {success: false, message: `Player ${endCondition.playerId} not found.`};
  }

  switch (endCondition.type) {
    case "playerCoins":
      const playerCoins = player.coins;
      const targetCoins = endCondition.value;
      switch (endCondition.operator) {
        case ">":
          if (playerCoins > targetCoins) return {success: true}; else return {success: false, message: `playerCoins: ${playerCoins} was not > ${targetCoins}`};
        case "<":
          if (playerCoins < targetCoins) return {success: true}; else return {success: false, message: `playerCoins: ${playerCoins} was not < ${targetCoins}`};
        case ">=":
          if (playerCoins >= targetCoins) return {success: true}; else return {success: false, message: `playerCoins: ${playerCoins} was not >= ${targetCoins}`};
        case "<=":
          if (playerCoins <= targetCoins) return {success: true}; else return {success: false, message: `playerCoins: ${playerCoins} was not <= ${targetCoins}`};
        case "===":
          if (playerCoins === targetCoins) return {success: true}; else return {success: false, message: `playerCoins: ${playerCoins} was not === ${targetCoins}`};
        default:
          logger.error(`Unknown operator ${endCondition.operator} for playerCoins condition.`);
          return {success: false, message: `Unknown operator ${endCondition.operator} for playerCoins`};
      }
    case "playerCrownsInAge":
      const ageIndex = endCondition.ageIndex;
      const crownsInAge = player.scoreTrack[ageIndex];
      const targetCrowns = endCondition.value;
      switch (endCondition.operator) {
        case ">":
          if (crownsInAge > targetCrowns) return {success: true}; else return {success: false, message: `playerCrownsInAge[${ageIndex}]: ${crownsInAge} was not > ${targetCrowns}`};
        case "<":
          if (crownsInAge < targetCrowns) return {success: true}; else return {success: false, message: `playerCrownsInAge[${ageIndex}]: ${crownsInAge} was not < ${targetCrowns}`};
        case ">=":
          if (crownsInAge >= targetCrowns) return {success: true}; else return {success: false, message: `playerCrownsInAge[${ageIndex}]: ${crownsInAge} was not >= ${targetCrowns}`};
        case "<=":
          if (crownsInAge <= targetCrowns) return {success: true}; else return {success: false, message: `playerCrownsInAge[${ageIndex}]: ${crownsInAge} was not <= ${targetCrowns}`};
        case "===":
          if (crownsInAge === targetCrowns) return {success: true}; else return {success: false, message: `playerCrownsInAge[${ageIndex}]: ${crownsInAge} was not === ${targetCrowns}`};
        default:
          logger.error(`Unknown operator ${endCondition.operator} for playerCrownsInAge condition.`);
          return {success: false, message: `Unknown operator ${endCondition.operator} for playerCrownsInAge`};
      }
    case "playerHandCount":
      const handCount = player.handCount;
      const targetCount = endCondition.value;
      switch (endCondition.operator) {
        case ">":
          if (handCount > targetCount) return {success: true}; else return {success: false, message: `playerHandCount: ${handCount} was not > ${targetCount}`};
        case "<":
          if (handCount < targetCount) return {success: true}; else return {success: false, message: `playerHandCount: ${handCount} was not < ${targetCount}`};
        case ">=":
          if (handCount >= targetCount) return {success: true}; else return {success: false, message: `playerHandCount: ${handCount} was not >= ${targetCount}`};
        case "<=":
          if (handCount <= targetCount) return {success: true}; else return {success: false, message: `playerHandCount: ${handCount} was not <= ${targetCount}`};
        case "===":
          if (handCount === targetCount) return {success: true}; else return {success: false, message: `playerHandCount: ${handCount} was not === ${targetCount}`};
        default:
          logger.error(`Unknown operator ${endCondition.operator} for playerHandCount condition.`);
          return {success: false, message: `Unknown operator ${endCondition.operator} for playerHandCount`};
      }
    case "playerHandContains":
      if (!player.hand) {
        logger.error(`Player ${endCondition.playerId} hand data not available for playerHandContains check.`);
        return {success: false, message: `Player ${endCondition.playerId} hand data not available`};
      }
      if (player.hand.some((card) => card.id === endCondition.cardId)) return {success: true}; else return {success: false, message: `playerHand did not contain cardId: ${endCondition.cardId}`};
    case "discardPileContains":
      if (!lobbyData.discardPile) {
        // If the condition expects a card, but the pile is empty/null, it's a failure.
        return {success: false, message: `discardPile was empty`};
      }
      if (lobbyData.discardPile.some((card) => card.id === endCondition.cardId)) return {success: true}; else return {success: false, message: `discardPile did not contain cardId: ${endCondition.cardId}`};
    case "discardPileCount":
    {
      const discardCount = lobbyData.discardPile?.length || 0;
      const targetDiscardCount = endCondition.value;
      switch (endCondition.operator) {
        case ">":
          if (discardCount > targetDiscardCount) return {success: true}; else return {success: false, message: `discardPileCount: ${discardCount} was not > ${targetDiscardCount}`};
        case "<":
          if (discardCount < targetDiscardCount) return {success: true}; else return {success: false, message: `discardPileCount: ${discardCount} was not < ${targetDiscardCount}`};
        case ">=":
          if (discardCount >= targetDiscardCount) return {success: true}; else return {success: false, message: `discardPileCount: ${discardCount} was not >= ${targetDiscardCount}`};
        case "<=":
          if (discardCount <= targetDiscardCount) return {success: true}; else return {success: false, message: `discardPileCount: ${discardCount} was not <= ${targetDiscardCount}`};
        case "===":
          if (discardCount === targetDiscardCount) return {success: true}; else return {success: false, message: `discardPileCount: ${discardCount} was not === ${targetDiscardCount}`};
        default:
          logger.error(`Unknown operator ${endCondition.operator} for discardPileCount condition.`);
          return {success: false, message: `Unknown operator ${endCondition.operator} for discardPileCount`};
      }
    }
    case "playerScoreTrack":
    {
      const playerScoreTrack = player.scoreTrack;
      const targetScoreTrack = endCondition.value;
      const actual = JSON.stringify(playerScoreTrack);
      const expected = JSON.stringify(targetScoreTrack);
      if (actual === expected) return {success: true}; else return {success: false, message: `playerScoreTrack: ${actual} was not === ${expected}`};
    }
    case "playerPerpetualsContain": {
      const perpetuals = player.perpetuals;
      const cardId = endCondition.cardId;
      const shouldExist = endCondition.exists !== false; // Default to true

      if (endCondition.count !== undefined) {
        const count = perpetuals ? Object.values(perpetuals).flat().filter((card) => card.id === cardId).length : 0;
        if (count === endCondition.count) {
          return {success: true};
        } else {
          return {success: false, message: `playerPerpetuals for ${cardId} count: ${count} was not === ${endCondition.count}`};
        }
      } else {
        const cardExists = perpetuals ? Object.values(perpetuals).some((arr) => arr.some((card) => card.id === cardId)) : false;

        if (cardExists === shouldExist) {
          return {success: true};
        } else {
          return {success: false, message: `playerPerpetuals ${shouldExist ? "did not contain" : "contained"} cardId: ${cardId}`};
        }
      }
    }
    case "playerZone": {
      const playerZone = player.zone;
      const targetZone = endCondition.value;
      if (playerZone === targetZone) return {success: true}; else return {success: false, message: `playerZone: ${playerZone} was not > ${targetZone}`};

    }
    case "zoneHourglass": {
      const zone = lobbyData.zones.find((z) => z.id === endCondition.zoneId);
      const hourglassValue = zone?.hourglass;
      if (hourglassValue === endCondition.value) return {success: true};
      return {success: false, message: `zoneHourglass for ${endCondition.zoneId}: ${hourglassValue} was not === ${endCondition.value}`};
    }
    // Add more condition types as needed (e.g., card in hand, specific zone visited)
    default:
      logger.error(`Unknown end condition type: ${endCondition.type}`);
      return {success: false, message: `Unknown end condition type: ${endCondition.type}`};
  }
}

/**
 * The main function to evaluate a test, record its result, and return the
 * final lobby update payload.
 * @param {string} lobbyId The ID of the lobby to evaluate.
 * @param {FirebaseFirestore.Firestore} db The Firestore database instance.
 * @return {object|null} The payload to update the lobby document with, or null.
 */
async function evaluateAndRecordTest(lobbyId, db) {
  const authoritativeLobbyData = await getAuthoritativeLobbyState(lobbyId);
  if (!authoritativeLobbyData) {
    // If lobby is not found, it might have been deleted. Log and exit.
    logger.error(`Could not find lobby ${lobbyId} to evaluate test.`);
    return null;
  }

  const testConfig = authoritativeLobbyData.testConfig;
  const evaluationResult = evaluateEndCondition(authoritativeLobbyData, testConfig.endCondition);

  const resultMessage = (evaluationResult.success === true) ? "Automated test PASSED" : `Automated test FAIL: ${evaluationResult.message}`;
  logMessage(authoritativeLobbyData, `${resultMessage}`);

  const finalPayload = {
    status: "finished",
    winner: resultMessage,
    log: authoritativeLobbyData.log, // Ensure final log is saved
    evaluateTest: false, // Clear the flag
  };

  // This function now also handles recording the result and deciding if the lobby should be deleted.
  const spectatorLeaves = await recordTestResult(lobbyId, testConfig, authoritativeLobbyData, evaluationResult.success ? "pass" : "fail");

  if (spectatorLeaves) {
    finalPayload.deleteMe = true;
  }

  // Return the payload for the gameEngine to commit.
  return finalPayload;
}

/**
 * Records the result of an automated test in a dedicated Firestore collection.
 * @param {string} lobbyId The ID of the lobby where the test ran.
 * @param {object} testConfig The test configuration.
 * @param {object} lobbyData The final lobby data (for logging).
 * @param {string} status The test status ('pass' or 'fail').
 */
async function recordTestResult(lobbyId, testConfig, lobbyData, status) {
  const db = getFirestore();
  await db.collection("test_results").add({
    testName: testConfig.testName || "Unnamed Test",
    lobbyId: lobbyId,
    status: status,
    timestamp: new Date(),
    gameLog: status === "fail" ? lobbyData.log : null, // Only store log on failure
    testConfig: testConfig, // Store full config for reproducibility
  });
  logger.info(`Test result for '${testConfig.testName}' (Lobby: ${lobbyId}) recorded as ${status.toUpperCase()}.`);

  // IMPORTANT: Only delete the lobby if the test PASSES and the config allows it.
  // We never want to delete a failed test lobby automatically, as we need it for debugging.
  const shouldDelete = status === "pass" && testConfig.spectatorLeaves === true;
  if (shouldDelete) logger.info(`Lobby ${lobbyId} will be flagged for deletion upon test completion.`);
  return shouldDelete;
}

module.exports = {
  getAuthoritativeLobbyState,
  evaluateEndCondition,
  recordTestResult,
  evaluateAndRecordTest,
};
