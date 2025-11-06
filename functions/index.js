/**
 * @fileoverview Cloud Functions for Temporum Online game logic. This is the
 * main entry point for all backend game actions.
 * @author Valerie Brown
 */

const {onDocumentUpdated, onDocumentCreated} =
  require("firebase-functions/v2/firestore");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {setGlobalOptions} = require("firebase-functions/v2");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} =
  require("firebase-admin/firestore"); // eslint-disable-line no-unused-vars
const logger = require("firebase-functions/logger");

const {initializeHelpers} = require("./utils/initHelpers");
// Set global options for all functions. This is a good practice to ensure all
// functions are deployed to the same region.
// Firestore is in 'nam5' (US multi-region), so 'us-central1' is a good choice.
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

// Initialize Firebase Admin SDK
initializeApp(); // Initialize circular dependencies in helper modules.
// This only needs to run once.
initializeHelpers();

const db = getFirestore();

// --- Performance Optimization: Load all handlers and data once ---
const createLobbyAction = require("./actions/createLobby").execute;

/**
 * A map of action types to their corresponding handler functions.
 * This makes the main function cleaner and more extensible.
 */
const actionHandlers = {
  // Lobby Actions
  START_GAME: require("./actions/startGame").execute,
  JOIN_LOBBY: require("./actions/joinLobby").execute,
  LEAVE_LOBBY: require("./actions/leaveLobby").execute,
  CHANGE_COLOR: require("./actions/changeColor").execute,
  ADD_AI: require("./actions/addAI").execute,
  REMOVE_PLAYER: require("./actions/removePlayer").execute,
  REMOVE_SPECTATOR: require("./actions/removeSpectator").execute,
  BECOME_SPECTATOR: require("./actions/becomeSpectator").execute,
  REPLACE_PLAYER: require("./actions/replacePlayer").execute,
  UPDATE_ZONE: require("./actions/updateZone").execute,
  UPDATE_TIMELINE: require("./actions/updateTimeline").execute,
  TOGGLE_TEST_MODE: require("./actions/toggleTestMode").execute,
  UPDATE_INITIAL_CARD: require("./actions/updateInitialCard").execute,
  UPDATE_ALTERNATE_REALITIES:
    require("./actions/updateAlternateRealities").execute,

  // In-Game Actions

  VISIT_ZONE: require("./actions/visitZone").execute,
  SCORE_CARD: require("./actions/scoreCard").execute,
  PLAY_CARD: require("./actions/playCard").execute,
  ADVANCE_CROWN: require("./actions/advanceCrown").execute,
  CHOOSE_ACTION: require("./actions/chooseAction").execute,
  DISCARD_AND_CONTINUE: require("./actions/discardAndContinue").execute,
  DISCARD_MANY: require("./actions/discardMany").execute,
  CHANGE_HISTORY: require("./actions/changeHistory").execute,
  DECLINE_CHANGE_HISTORY: require("./actions/declineChangeHistory").execute,
  RESOLVE_OPTIONAL_ZONE: require("./actions/resolveOptionalZone").execute,
  RESOLVE_TOYS_CHOICE: require("./actions/resolveToysChoice").execute,
  RESOLVE_DISCARD_FOR_MONEY:
    require("./actions/resolveDiscardForMoney").execute,
  RESOLVE_INQUISITION: require("./actions/resolveInquisition").execute,
  RESOLVE_INVENTOR: require("./actions/resolveInventor").execute,
  RESOLVE_Y2K_DISCARD:
    require("./actions/resolveY2KDiscard").execute,
  RESOLVE_PREDICT_THE_FUTURE:
    require("./actions/resolvePredictTheFuture").execute,
  RESOLVE_BABYLONIAN_CHOICE:
    require("./actions/resolveBabylonianChoice").execute,
  RESOLVE_INVESTMENTS: require("./actions/resolveInvestments").execute,
  RESOLVE_TREASURE_MAP:
    require("./actions/resolveTreasureMap").execute,
  RESOLVE_SUNBOAT: require("./actions/resolveSunboat").execute,
  RESOLVE_SIMULATED_PARADISE_CHOICE:
    require("./actions/resolveSimulatedParadiseChoice").execute,
  RESOLVE_MOVE: require("./actions/resolveMove").execute,
  RESOLVE_GIZMO_CHOICE: require("./actions/resolveGizmoChoice").execute,
  RETREAT_CROWN: require("./actions/retreatCrown").execute,
  RESOLVE_SET_HQ: require("./actions/resolveSetHq").execute,
  CHOOSE_END_OF_TURN: require("./actions/chooseEndOfTurn").execute,
  CHOOSE_START_OF_TURN: require("./actions/chooseStartOfTurn").execute,
  CHOOSE_POST_VISIT:
    require("./actions/choosePostVisit.js").execute,
  SELECT_CYBERNETICS_PERPETUAL:
    require("./actions/selectCyberneticsPerpetual").execute,
  SELECT_CYBERNETICS_HAND_CARD:
    require("./actions/selectCyberneticsHandCard").execute,
  SELECT_CARD_TO_PASS: require("./actions/selectCardToPass").execute,
  RESOLVE_TRADE_GOODS: require("./actions/resolveTradeGoods").execute,
  RETURN_CARD: require("./actions/returnCard").execute,

  // AI Actions
  // RUN_AI: require("./actions/runAI").execute,
};
/**
 * A callable function to create a new lobby.
 * This is used instead of the gameEngine trigger because it's a creation event.
 */
// Existing createLobby function
exports.createLobby = onCall(async (request) => {
  try {
    // request.data contains the data sent from the client.
    // request.auth contains user authentication info.
    return await createLobbyAction(db, request.data, request);
  } catch (error) {
    logger.error("Error creating lobby:", error);
    throw new HttpsError("internal",
        "Failed to create lobby: " + error.message);
  }
});

/**
 * This Cloud Function triggers whenever a lobby document is updated.
 * It checks for a `pendingAction` and routes it to the correct handler.
 */
exports.gameEngine = onDocumentUpdated("lobbies/{lobbyId}", async (event) => {
  // Conditionally require test-related modules inside the function
  const runAITestHelper = (process.env.FUNCTIONS_EMULATOR) ?
  require("./utils/aiTestHelper").runAITestAction : null;

  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Only process if the pendingAction field has actually changed.
  // This is the most reliable way to detect a new action and prevent re-runs,
  // avoiding race conditions where one function clears an action another set.
  const beforeActionId = beforeData.pendingAction?.actionId;
  const afterActionId = afterData.pendingAction?.actionId;

  // --- Primary Action Processing ---
  // Only process a new pendingAction if the actionId has changed.
  // This is the main gatekeeper for player-driven actions.
  if (beforeActionId !== afterActionId && afterData.pendingAction) {
    const {type, uid, payload} = afterData.pendingAction;
    const lobbyId = event.params.lobbyId;
    logger.info(
        `Processing action: ${type} for lobby: ${lobbyId} by user: ${uid}`,
    );

    const handler = actionHandlers[type];
    if (!handler) {
      logger.error(`No handler found for action type: ${type}`);
      return event.data.after.ref.update({
        pendingAction: FieldValue.delete()});
    }

    try {
      const result = await handler(lobbyId, uid, payload, afterData);
      const batch = result.batch || db.batch();
      const updatePayload =
        result.updatePayload ||
        (result.batch ? {} :
          (result.updatePayload === undefined ? result : {}));

      if (updatePayload.deleteMe === true) {
        logger.info(
            `Action ${type} triggered recursive deletion for lobby ${lobbyId}.`,
        );
        const sessionsRef = event.data.after.ref.collection("sessions");
        const sessionsSnapshot = await sessionsRef.get();
        sessionsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

        const privateRef = event.data.after.ref.collection("private");
        const privateSnapshot = await privateRef.get();
        privateSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

        batch.delete(event.data.after.ref);
      } else {
        const finalPayload = {
          ...updatePayload,
          pendingAction: FieldValue.delete(),
        };
        batch.update(event.data.after.ref, finalPayload);
      }

      // --- AI Script Consumption ---
      // If the action was from a scripted AI, consume the action from its
      // script.
      const actingPlayerIndex = afterData.players.findIndex((p) =>
        p.id === uid);
      if (actingPlayerIndex !== -1 &&
          afterData.players[actingPlayerIndex].isAI &&
          afterData.players[actingPlayerIndex].script?.length > 0) {
        // Update player in payload to ensure change is in the same write.
        if (!updatePayload.players) {
          updatePayload.players = [...afterData.players];
        }
        const playerToUpdate =
          updatePayload.players.find((p) => p.id === uid);
        if (playerToUpdate) {
          playerToUpdate.script = playerToUpdate.script.slice(1);
        }
      }

      return batch.commit();
    } catch (error) {
      logger.error(
          `Error processing action ${type} for lobby ${lobbyId}:`, error,
      );
      return event.data.after.ref
          .update({pendingAction: FieldValue.delete()});
    }
  }

  // --- Test-Only AI Triggering ---
  // This block runs after the main action processing. It checks if an AI
  // in a test lobby needs to act.
  if (runAITestHelper && afterData.isTest &&
    afterData.status === "in-progress") {
    const aiToAct = afterData.players.find((p) => p.isAI && p.prompt);

    if (aiToAct) {
      const aiPendingAction = runAITestHelper(aiToAct, event.params.lobbyId);

      // Only dispatch if there isn't already a pending action.
      // This prevents overwriting an action that might have just been set.
      if (aiPendingAction && !afterData.pendingAction) {
        logger.info(
            `(onUpdate) AI for ${aiToAct.id} is dispatching ` +
          `next action: ${aiPendingAction.type}`);
        // We return the promise to ensure the function waits for the update.
        return event.data.after.ref.update({pendingAction: aiPendingAction});
      }
    }
  }

  return null; // No new action to process.
});

/**
 * A scheduled function that runs every hour to clean up old, abandoned lobbies.
 */
exports.cleanupOldLobbies = onSchedule("every 1 hours", async (event) => {
  logger.info("Running hourly lobby cleanup job.");
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const oldLobbiesQuery =
    db.collection("lobbies").where("createdAt", "<", twoHoursAgo);
  const snapshot = await oldLobbiesQuery.get();

  if (snapshot.empty) {
    logger.info("No old lobbies found to delete.");
    return null;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    logger.log(`Deleting old lobby: ${doc.id}`);
    batch.delete(doc.ref);
  });

  await batch.commit();
  logger.log(`Successfully deleted ${snapshot.size} old lobbies.`);
  return null;
});

// --- Development & Testing Only ---
// The following functions and handlers will only be included when running
// locally with the emulator, where NODE_ENV is 'development'.
if (process.env.FUNCTIONS_EMULATOR) {
  logger.info("Running in development mode, including test-only functions.");

  // Conditionally require test-related modules
  const runAITestAction = require("./actions/runAITest").execute;
  actionHandlers.EVALUATE_TEST = require("./actions/evaluateTest").execute;

  /**
   * A callable function to run an automated AI test. (DEV ONLY)
   */
  exports.runAITest = onCall(async (request) => {
    try {
      return await runAITestAction(db, request.data, request);
    } catch (error) {
      logger.error("Error running AI test:", error);
      throw new HttpsError("internal",
          "Failed to run AI test: " + error.message);
    }
  });

  /**
   * Triggers on lobby creation to kick off the first AI action in a test.
   * (DEV ONLY)
   */
  exports.triggerInitialAITest =
    onDocumentCreated("lobbies/{lobbyId}", async (event) => {
      const lobbyData = event.data.data();
      const lobbyId = event.params.lobbyId;

      const runAITestHelper = require("./utils/aiTestHelper").runAITestAction;

      if (lobbyData.isTest && lobbyData.status === "in-progress") {
        const aiToAct = lobbyData.players.find((p) =>
          p.isAI && p.prompt && p.script?.length > 0);

        if (aiToAct) {
          const aiPendingAction = runAITestHelper(aiToAct, lobbyId);
          if (aiPendingAction) {
            logger.info(
                `(onCreate) AI for ${aiToAct.id} is dispatching ` +
              `first action: ${aiPendingAction.type}`);
            return event.data.ref.update({pendingAction: aiPendingAction});
          }
        }
      }
      return null;
    });
}
