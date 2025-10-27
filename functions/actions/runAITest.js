// functions/actions/runAITest.js

const {FieldValue} = require("firebase-admin/firestore");
const {chooseNickname} = require("../utils/nicknames.js");

/**
 * Creates a new game lobby for an automated AI test.
 * @param {FirebaseFirestore.Firestore} db The Firestore database instance.
 * @param {object} data Data from the client, e.g., { testConfig: {...} }.
 * @param {object} context The context of the function call, containing auth info.
 * @return {object} The ID of the newly created lobby.
 */
exports.execute = async (db, data, context) => {
  if (!context.auth) {
    throw new Error("User must be authenticated to run an AI test.");
  }

  const testConfig = data.testConfig || {};

  // Use the existing createLobby logic, but force spectator mode and auto-start
  const createLobbyAction = require("./createLobby").execute;
  const lobbyIdResult = await createLobbyAction(db, {
    nickName: chooseNickname(), // Assign a random nickname for the spectator
    // Spread the incoming testConfig to flatten it.
    // This ensures properties like aiPlayerCount and the nested testConfig are at the top level.
    ...testConfig,
    spectate: true, // Always spectate for tests
    isTest: true, // Add a clear flag to identify this as a test lobby.
    // Merge the testConfig from the test suite with required overrides.
    testConfig: {
      ...testConfig.testConfig,
      enabled: true,
      autoStart: true,
      autoEndTurn: true,
    },
  }, context);

  return lobbyIdResult;
};
