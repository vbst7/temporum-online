const {logMessage} = require("./logHelpers");
const {setPlayerPrompt} = require("./promptingHelpers");
const {getFirestore} = require("firebase-admin/firestore");
const {executePostVisitEffect, executeEndOfTurnEffect,
  executeStartOfTurnEffect} = require("../utils/loopHelpers");

// Forward declarations for functions that have circular dependencies.
// These will be set via `initializeHelpers` in initHelpers.js.
let promptVisit;
let processPostVisitQueue;
let executeZoneFollowUp; // eslint-disable-line no-unused-vars
let executeCardFollowUp; // eslint-disable-line no-unused-vars
let promptPlay; // eslint-disable-line no-unused-vars
let promptScore; // eslint-disable-line no-unused-vars
let declareWinner; // eslint-disable-line no-unused-vars
let startTurn; // Self-reference for internal calls
let processEndOfTurnQueue;
let processStartOfTurnQueue;
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

  // TODO: loop similar to in endTurn

  // add Cache & Beggar to the queue


  // Process the start-of-turn queue.
  const startOfTurnResult = await processStartOfTurnQueue(player,
      lobbyData, lobbyId);
  if (startOfTurnResult) {
    return startOfTurnResult; // A prompt was set.
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
  if (!lobbyData.endOfTurnQueue) lobbyData.endOfTurnQueue = [];

  // Add any Investments to the end-of-turn queue
  const investmentsCount = player.perpetuals?.turnEnd?.filter((c) =>
    c.id === "investments").length;
  if (player.moneyGainedThisTurn >= 2) {
    for (let i = 0; i < investmentsCount; i++) {
      lobbyData.endOfTurnQueue.push({
        id: `investments-${player.id}-${i}`,
        label: "Investments",
        cardId: "investments",
        playerId: player.id,
      });
    }
  }

  // Add any Hideouts to the end-of-turn queue
  const hideoutCount = player.perpetuals?.turnEnd?.filter((c) =>
    c.id === "hideout").length;
  if (player.coins >= 40) {
    for (let i = 0; i < hideoutCount; i++) {
      lobbyData.endOfTurnQueue.push({
        id: `hideout-${player.id}-${i}`,
        label: "Hideout",
        cardId: "hideout",
        playerId: player.id,
      });
    }
  }

  // Add any Sunboats of Ra to the end-of-turn queue
  const sunboatCount = player.perpetuals?.turnEnd?.filter((c) =>
    c.id === "sunboat-of-ra").length;
  if (lobbyData.previousTurnPlayerId !== player.id) {
    for (let i = 0; i < sunboatCount; i++) {
      lobbyData.endOfTurnQueue.push({
        id: `sunboat-${player.id}-${i}`,
        label: "Sunboat of Ra",
        cardId: "sunboat-of-ra",
        playerId: player.id,
      });
    }
  }

  // Add any Poison Tokens to the end-of-turn queue
  const poisonCount = player.poison?.length;
  for (let i = 0; i < poisonCount; i++) {
    lobbyData.endOfTurnQueue.push({
      id: `poison-${player.poison[i].turn}`,
      label: "Poison",
      cardId: "poison-token",
      playerId: player.id,
    });
  }

  // Process the end-of-turn queue.
  const endOfTurnResult = await processEndOfTurnQueue(player,
      lobbyData, lobbyId);
  if (endOfTurnResult) {
    return endOfTurnResult; // A prompt was set or the turn ended.
  }
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
 * Processes the post-visit queue, handling effects for one or more players.
 * This function modifies lobbyData and returns a flag if a winner was declared.
 * @param {string} lobbyId The ID of the lobby.
 * @param {object} lobbyData The current lobby data.
 * @return {object} An object indicating if winner was declared & relevant data.
 */
exports.processPostVisitQueue = async function(lobbyId, lobbyData) {
  if (!lobbyData.postVisitQueue) {
    lobbyData.postVisitQueue = [];
  }

  // Find the first player with items in the queue.
  const playerWithEffects = lobbyData.players.find((p) =>
    lobbyData.postVisitQueue.some((item) => item.playerId === p.id));

  if (!playerWithEffects) {
    // No players have post-visit effects. Proceed to end of turn.
    const currentPlayerForEnd = lobbyData.players.find((p) => p.turn);
    if (currentPlayerForEnd) {
      return await endTurn(currentPlayerForEnd, lobbyData, lobbyId);
    }
    return {};
  }

  const playerEffects = lobbyData.postVisitQueue.filter((item) =>
    item.playerId === playerWithEffects.id);

  if (playerEffects.length === 1) {
    // Only one effect, execute it directly.
    const effect = playerEffects[0];
    // Remove from queue before prompting
    const effectIndex = lobbyData.postVisitQueue
        .findIndex((item) => item.id === effect.id);
    lobbyData.postVisitQueue.splice(effectIndex, 1);

    executePostVisitEffect(effect, lobbyData);

    // After executing a single effect, if no new prompt was set,
    // immediately re-process the queue to handle the next item or end the turn.
    const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
    if (!anyPlayerHasPrompt) {
      return await processPostVisitQueue(lobbyId, lobbyData);
    }
  } else if (playerEffects.length > 1) {
    // Multiple effects, prompt player to choose.
    const player = lobbyData.players.find((p) => p.id === playerWithEffects.id);
    const choices = playerEffects.map((effect) => ({
      id: effect.id,
      label: effect.label,
    }));
    setPlayerPrompt(player, lobbyData, "post-visit-choice", {choices});
  } else {
    // This player is done, re-run the logic for the next player.
    return await processPostVisitQueue(lobbyId, lobbyData);
  }

  return {};
};

/**
 * Processes the end-of-turn queue for a player.
 * @param {object} player The player whose turn is ending.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 * @return {object|null} A result if the turn ends or a prompt is set,
 * otherwise null.
 */
exports.processEndOfTurnQueue = async function(player, lobbyData, lobbyId) {
  const effects = [];

  // 1. Check for effects in the endOfTurnQueue
  if (lobbyData.endOfTurnQueue) {
    lobbyData.endOfTurnQueue.forEach((item) => {
      if (item.playerId === player.id) {
        effects.push({
          id: item.id || `${item.cardId}-${player.id}`,
          label: item.label || item.cardId.replace(/-/g, " "),
          cardId: item.cardId,
          source: "queue",
        });
      }
    });
  }

  if (effects.length === 0) {
    // proceed with normal turn end logic.
    logMessage(lobbyData, [
      // eslint-disable-line max-len
      {type: "text", value: "End of "},
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: "'s turn."},
    ]);

    // Reset player booleans
    player.secretDeclined = false;
    // tibetan empire for all players

    // Reset zone flags
    lobbyData.zones.forEach((zone) => {
      if (zone.id === "cold-war" || zone.id === "dark-ages") {
        zone.applied = false;
      }
    });

    // --- Singularity: Extra Turn Logic ---
    if (player.extraTurns && player.extraTurns > 0) {
      player.extraTurns -= 1;
      logMessage(lobbyData, [
        {type: "player", value: player.name, color: player.color},
        {type: "text", value: ` is taking an extra turn 
          (${player.extraTurns} remaining).`},
      ]);

      // TODO it is possible to win even when you have extra
      // turns , should check
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
  }

  if (effects.length === 1) {
    const effect = effects[0];
    // Remove from queue if applicable
    if (effect.source === "queue") {
      const index = lobbyData.endOfTurnQueue.findIndex((item) =>
        (item.id || `${item.cardId}-${player.id}`) === effect.id);
      if (index > -1) lobbyData.endOfTurnQueue.splice(index, 1);
    }

    executeEndOfTurnEffect(effect, player, lobbyData, lobbyId);

    // If no new prompt was set, re-process the queue.
    if (!player.prompt) {
      return await exports.processEndOfTurnQueue(player, lobbyData, lobbyId);
    }
  } else {
    // Multiple effects, prompt player to choose.
    const choices = effects.map((effect) => ({
      id: effect.id,
      label: effect.label,
    }));
    setPlayerPrompt(player, lobbyData, "end-of-turn-choice", {choices});
  }

  // A prompt was set, so we return an empty object to signify we've handled it.
  // The gameEngine will commit the changes.
  return {};
};

/**
 * Processes the start-of-turn queue for a player.
 * @param {object} player The player whose turn is starting.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 * @return {object|null} A result if the turn ends or a prompt is set,
 * otherwise null.
 */
exports.processStartOfTurnQueue = async function(player, lobbyData, lobbyId) {
  const effects = [];

  // 1. Check for effects in the startOfTurnQueue
  if (lobbyData.startOfTurnQueue) {
    lobbyData.startOfTurnQueue.forEach((item) => {
      if (item.playerId === player.id) {
        effects.push({
          id: item.id || `${item.cardId}-${player.id}`,
          label: item.label || item.cardId.replace(/-/g, " "),
          cardId: item.cardId,
          source: "queue",
        });
      }
    });
  }

  // 2. Check for player's current zone and secret cards in hand
  const currentZone = lobbyData.zones[player.zone];
  if (currentZone.id === "cold-war" && !currentZone.applied) {
    effects.push({
      id: `cold-war-${player.id}`, // eslint-disable-next-line max-len
      label: `Cold War: Gain $4`,
      cardId: "cold-war",
      zone: true,
    });
  } else if (currentZone.id === "dark-ages" && !currentZone.applied) {
    effects.push({
      id: `dark-ages-${player.id}`, // eslint-disable-next-line max-len
      label: `Dark Ages: Discard a card`,
      cardId: "dark-ages",
      zone: true,
    });
  }

  if (!player.secretDeclined && lobbyData.alternateRealities) {
    // Fetch player hand to check for secret cards
    const db = getFirestore();
    const privateRef = db.collection("lobbies").doc(lobbyId)
        .collection("private").doc(player.id);
    const privateSnap = await privateRef.get();
    const hand = privateSnap.exists ? privateSnap.data().hand : [];
    const secretCardIds = ["secret-mission", "secret-plot",
      "secret-stash", "secret-weapon"];
    const hasSecretCard = hand.some((cardInHand) => secretCardIds
        .includes(cardInHand.id));

    // if player has a Secret card in hand and has not already declined
    // then include secret-decline in the optional effects
    if (hasSecretCard) {
      effects.push({
        id: `secret-decline-${player.id}`,
        label: "Decline Secret Action",
        cardId: "secret-decline",
      });
    }
  }

  // if no effects left continue the turn
  if (effects.length === 0) {
    if (player.zone < 6) {
      setPlayerPrompt(player, lobbyData, "changeHist");
    } else {
      lobbyData.legalZones = lobbyData.realZones;
      promptVisit(player, lobbyData);
    }
    return lobbyData;
  }

  if (effects.length === 1 && effects[0].cardId !== "secret-decline") {
    const effect = effects[0];
    // Remove from queue if applicable
    if (effect.source === "queue") {
      const index = lobbyData.startOfTurnQueue.findIndex((item) =>
        (item.id || `${item.cardId}-${player.id}`) === effect.id);
      if (index > -1) lobbyData.startOfTurnQueue.splice(index, 1);
    }

    await executeStartOfTurnEffect(effect, player, lobbyData);

    // If no new prompt was set, re-process the queue.
    if (!player.prompt) {
      return await exports.processStartOfTurnQueue(player, lobbyData, lobbyId);
    }
  } else {
    // Multiple effects, prompt player to choose.
    // This will also be the case if there is only a secret-decline effect.
    const choices = effects.map((effect) => ({
      id: effect.id,
      label: effect.label,
    }));
    setPlayerPrompt(player, lobbyData, "start-of-turn-choice", {choices});
  }

  // A prompt was set, so we return an empty object to signify we've handled it.
  // The gameEngine will commit the changes.
  return lobbyData;
};

// Setters for circular dependencies
exports.setPromptVisit = (func) => {
  promptVisit = func;
};
exports.setProcessPostVisitQueue = (func) => {
  processPostVisitQueue = func;
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
exports.setProcessEndOfTurnQueue = (func) => {
  processEndOfTurnQueue = func;
};
exports.setEndTurn = (func) => {
  endTurn = func;
};
exports.setProcessStartOfTurnQueue = (func) => {
  processStartOfTurnQueue = func;
};
