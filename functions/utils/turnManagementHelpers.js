const {getFirestore} = require("firebase-admin/firestore");
const {logMessage} = require("./logHelpers");
const {setPlayerPrompt} = require("./promptingHelpers");
const {gainMoney, crowdedness} = require("./resourceHelpers");

// Forward declarations for functions that have circular dependencies.
// These will be set via `initializeHelpers` in initHelpers.js.
let promptVisit;
// Self-reference for internal calls within this module
let checkAnubisAndEndTurn;
let executeChangeHistoryHelper;
let executeZoneFollowUp; // eslint-disable-line no-unused-vars
let executeCardFollowUp; // eslint-disable-line no-unused-vars
let promptPlay; // eslint-disable-line no-unused-vars
let promptScore; // eslint-disable-line no-unused-vars
let declareWinner; // eslint-disable-line no-unused-vars
let startTurn; // Self-reference for internal calls
let endTurn; // Self-reference for internal calls

/**
 * Sets a player's state to the start of their turn.
 * @param {object} player The player whose turn is starting.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.startTurn = async function(player, lobbyData, lobbyId) {
  player.turn = true;
  player.active = true;
  player.visitedZones = [];
  player.moneyGainedThisTurn = 0;
  logMessage(lobbyData, [
    {type: "text", value: `Turn ${lobbyData.turn}: `},
    {type: "player", value: player.name, color: player.color},
  ], "turn-start");

  // Check for "Cold War" zone effect at the start of the turn
  const currentZone = lobbyData.zones[player.zone];
  if (currentZone && currentZone.id === "cold-war") {
    if (crowdedness(player, lobbyData.players) === 0) {
      gainMoney(player, 4, lobbyData, {name: "Cold War", type: "brown"});
    }
  }

  if (player.zone < 6) {
    setPlayerPrompt(player, lobbyData, "changeHist");
  } else {
    lobbyData.legalZones = lobbyData.realZones;
    await promptVisit(player, lobbyData);
  }
};

/**
 * Ends the current player's turn and starts the next player's turn.
 * @param {object} player The player whose turn is ending.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 * @return {object} An object indicating a winner was declared & relevant data.
 */
exports.endTurn = async function(player, lobbyData, lobbyId) {
  logMessage(lobbyData, [
    // eslint-disable-line max-len
    {type: "text", value: "End of "},
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: "'s turn."},
  ]);

  // --- Singularity: Extra Turn Logic ---
  if (player.extraTurns && player.extraTurns > 0) {
    player.extraTurns -= 1;
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: ` is taking an extra turn 
        (${player.extraTurns} remaining).`},
    ]);

    // TODO it is possible to win even when you have extra turns , should check
    lobbyData.previousTurnPlayerId = player.id;
    await startTurn(player, lobbyData, lobbyId);
    return {winnerDeclared: false};
  }

  const playerIndex = lobbyData.players.findIndex((p) => p.id === player.id);

  player.turn = false;
  lobbyData.previousTurnPlayerId = player.id;
  player.active = false;
  player.prompt = "";

  // Increment turn counter when the
  // last player in the order finishes their turn
  if (playerIndex === lobbyData.players.length - 1) {
    lobbyData.turn += 1;
  }

  // --- Automated Test Evaluation Trigger ---
  // After the first player's turn in an auto-ending test, we prompt the
  // player to finalize the test.
  if (lobbyData.testConfig?.autoEndTurn && lobbyData.testConfig?.enabled) {
    setPlayerPrompt(player, lobbyData, "test");

    // The AI will see this prompt and dispatch an EVALUATE_TEST action.
    // We return here to prevent the normal start of the next turn.
    return lobbyData;
  }

  // --- Win Condition Check ---
  if (player.scoreTrack[3] === 10) { // eslint-disable-line no-magic-numbers
    // This needs to return a special payload to
    // the gameEngine to update status and winner
    const winnerPayload = await declareWinner(lobbyId, lobbyData, player,
        `${player.name} has all crowns in Time IV.`);
    lobbyData.winner = winnerPayload.winner;
    lobbyData.status = "finished";
    return lobbyData;
  } else {
    const nextPlayerIndex = (playerIndex + 1) % lobbyData.players.length;
    const nextPlayer = lobbyData.players[nextPlayerIndex];
    await startTurn(nextPlayer, lobbyData, lobbyId);
  }
  // No updateLobbyState here,
  // the action handler will return the modified lobbyData.
  return {winnerDeclared: false};
};

/**
 * Declares a winner and prepares the lobby data for final update.
 * @param {string} lobbyId The ID of the lobby.
 * @param {object} lobbyData The current lobby data.
 * @param {object} winnerPlayer The player who won.
 * @param {string} reason The reason for winning.
 * @return {object} The payload to be merged into the lobby document.
 */
exports.declareWinner =
  async function(lobbyId, lobbyData, winnerPlayer, reason) {
    logMessage(lobbyData, reason);
    logMessage(lobbyData, [
    // eslint-disable-line max-len
      {type: "player", value: winnerPlayer.name, color: winnerPlayer.color},
      {type: "text", value: " wins the game!"},
    ], "turn-start");

    lobbyData.players.forEach((p) => {
      p.prompt = "";
      p.active = false;
    });

    return {
      status: "finished",
      winner: winnerPlayer.name,
      players: lobbyData.players,
      log: lobbyData.log,
    };
  };

/**
 * Checks for post-visit effects like Anubis Statuette and executes them, or
 * ends the turn.
 * This function modifies lobbyData and returns a flag if a winner was declared.
 * @param {string} lobbyId The ID of the lobby.
 * @param {object} lobbyData The current lobby data.
 * @return {object} An object indicating if winner was declared & relevant data.
 */
exports.checkAnubisAndEndTurn = async function(lobbyId, lobbyData) {
  const players = lobbyData.players; // eslint-disable-line no-unused-vars

  if (!lobbyData.postVisitQueue) {
    lobbyData.postVisitQueue = [];
  }
  const postVisitQueue = lobbyData.postVisitQueue;

  const anubisIndex = postVisitQueue.findIndex((item) =>
    item.effect === "anubis");

  if (anubisIndex > -1) {
    logMessage(lobbyData, "Anubis Statuette effect triggered.");
    const anubisJob = postVisitQueue.splice(anubisIndex, 1)[0];
    const anubisPlayer = lobbyData.players
        .find((p) => p.id === anubisJob.playerId);
    const currentPlayer = players.find((p) => p.turn);

    if (anubisPlayer) {
      if (currentPlayer && currentPlayer.id !== anubisPlayer.id) {
        currentPlayer.active = false;
      }

      if (currentPlayer) {
        currentPlayer.prompt = "";
      }

      if (!anubisPlayer.visitedZones) anubisPlayer.visitedZones = [];
      const allZoneIndices = lobbyData.zones.map((_, index) =>
        index);
      lobbyData.legalZones = allZoneIndices.filter((index) =>
        !anubisPlayer.visitedZones.includes(index));
      logMessage(lobbyData, [
        {type: "player", value: anubisPlayer.name, color: anubisPlayer.color},
        {type: "text", value: " can visit any unvisited zone."},
      ]);

      anubisPlayer.active = true;
      await promptVisit(anubisPlayer, lobbyData, "anubisVisit");
    } // No updateLobbyState here, the action handler will return the modified
    // lobbyData.
  } else {
    if (!lobbyData.endOfTurnQueue) lobbyData.endOfTurnQueue = [];

    const butterflyIndex = lobbyData.endOfTurnQueue.findIndex((item) =>
      item.cardId === "step-on-a-butterfly");
    if (butterflyIndex > -1) {
      lobbyData.endOfTurnQueue.splice(butterflyIndex, 1)[0];
      logMessage(lobbyData, [
        {type: "card", value: "Step on a Butterfly", cardType: "M"},
        {type: "text", value: " effect activated."},
      ]);
      let db = null;
      // Only get a db instance if a zone that needs it (like Endless City)
      // is present in the timeline.
      const timeIVZones = lobbyData.zones.slice(6, 10);
      if (timeIVZones.some((z) => z.id === "endless-city")) {
        db = getFirestore();
      }
      await executeChangeHistoryHelper(lobbyData, 0, db, lobbyId);
      await executeChangeHistoryHelper(lobbyData,
          lobbyData.realZones[1], db, lobbyId);
      await executeChangeHistoryHelper(lobbyData,
          lobbyData.realZones[2], db, lobbyId);
      // Re-check for more effects.
      // Recursive call, return its result
      return await checkAnubisAndEndTurn(lobbyId, lobbyData);
    }

    const currentPlayerForEnd = players.find((p) => p.turn);
    if (currentPlayerForEnd &&
        currentPlayerForEnd.perpetuals?.turnEnd?.length > 0) {
      const investment = currentPlayerForEnd.perpetuals.turnEnd.find((c) =>
        c.id === "investments");
      if (investment && currentPlayerForEnd.moneyGainedThisTurn !== 0) {
        setPlayerPrompt(currentPlayerForEnd, lobbyData, "investments-choice",
            {id: investment.id});
        return {}; // A prompt was set, stop here, action handler will update.
      }
    }

    const predictFutureIndex = lobbyData.endOfTurnQueue
        .findIndex((item) => item.cardId === "predict-the-future");
    if (predictFutureIndex > -1) {
      const predictJob = lobbyData.endOfTurnQueue
          .splice(predictFutureIndex, 1)[0];
      const player = players.find((p) => p.id === predictJob.playerId);
      if (player) {
        setPlayerPrompt(player, lobbyData, "predict-the-future",
            {zoneIndex: predictJob.zoneIndex});
        return {}; // A prompt was set, stop here, action handler will update.
      }
    }

    // If no other effects are pending, end the turn.
    if (currentPlayerForEnd) {
      return await endTurn(currentPlayerForEnd, lobbyData, lobbyId);
    }
  }
  // Return empty object if no special handling needed, just update lobbyData.
  return {};
};

// Setters for circular dependencies
exports.setPromptVisit = (func) => {
  promptVisit = func;
};
exports.setCheckAnubisAndEndTurn = (func) => {
  checkAnubisAndEndTurn = func;
};
exports.setExecuteChangeHistoryHelper = (func) => {
  executeChangeHistoryHelper = func;
};
exports.setExecuteZoneFollowUp = (func) => {
  executeZoneFollowUp = func;
};
exports.setExecuteCardFollowUp = (func) => {
  executeCardFollowUp = func;
};
exports.setPromptPlay = (func) => {
  promptPlay = func;
};
exports.setPromptScore = (func) => {
  promptScore = func;
};
exports.setDeclareWinner = (func) => {
  declareWinner = func;
};
exports.setStartTurn = (func) => {
  startTurn = func;
};
exports.setEndTurn = (func) => {
  endTurn = func;
};
