const {logMessage} = require("./logHelpers");
const {drawCards, discardCard, gainMoney, timesRuled, doesPlayerRuleAge,
  moveToZone, stealMoney,
  crowdedness} = require("./resourceHelpers");
const {setPlayerPrompt} = require("./promptingHelpers");
// Forward declarations for functions that have circular dependencies.
// These will be set via `initializeHelpers` in initHelpers.js.
let promptScore;
let promptPlay;
let promptDiscard;
let promptVisit; // eslint-disable-line no-unused-vars
let executeZoneFollowUp; // eslint-disable-line no-unused-vars
let processPostVisitQueue; // eslint-disable-line no-unused-vars
let declareWinner; // eslint-disable-line no-unused-vars
let startTurn; // eslint-disable-line no-unused-vars
let endTurn; // eslint-disable-line no-unused-vars
let visitSpecificZone; // eslint-disable-line no-unused-vars
let executeCardFollowUp;

/**
 * A helper function to modify the arrows and recalculate real zones.
 * This function mutates the lobbyData object.
 * @param {object} lobbyData The lobby data object.
 * @param {number} zoneIndex The index of the zone where history is being
 * changed (0-5).
 * @param {FirebaseFirestore.Firestore} db The Firestore database instance.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.executeChangeHistoryHelper = async function(lobbyData,
    zoneIndex, db, lobbyId) {
  const arrows = lobbyData.arrows;
  if (zoneIndex >= 0 && zoneIndex < 6) { // eslint-disable-line no-magic-numbers
    arrows[zoneIndex] = !arrows[zoneIndex];
    logMessage(lobbyData, `History was changed in Time ${parseInt(lobbyData.zones[zoneIndex].age)}.`); // eslint-disable-line max-len

    // Determine which zones are real based on the arrow states
    const realZones = [0];

    // Determine second real zone (from Time I to Time II)
    const secondZone = arrows[0] ? 2 : 1;
    realZones.push(secondZone);

    // Determine third real zone (from Time II to Time III)
    const thirdZone = arrows[secondZone] ? secondZone + 3 : secondZone + 2;
    realZones.push(thirdZone);

    // Determine fourth real zone (from Time III to Time IV)
    const fourthZone = arrows[thirdZone] ? thirdZone + 4 : thirdZone + 3;
    realZones.push(fourthZone);

    const originalFourthZone = lobbyData.realZones[3];

    lobbyData.realZones = realZones;
    lobbyData.arrows = arrows;

    // If the fourth real zone is now Endless City or Mafia City-States,
    // but it was not before the change, then execute its effect
    if (fourthZone !== originalFourthZone) {
      if (lobbyData.zones[fourthZone].id === "endless-city") {
        const batch = db.batch();
        logMessage(lobbyData, [
          {type: "zone", value: "Endless City", color: "silver"},
          {type: "text", value: " has become real! All players draw a card."},
        ]);
        for (const player of lobbyData.players) {
          const playerRef = db.collection("lobbies").doc(lobbyId)
              .collection("private").doc(player.id);
          const playerSnap = await playerRef.get();
          const playerHand = playerSnap.exists ? playerSnap.data().hand : [];

          drawCards(player, playerHand, 1, lobbyData,
              {name: "Endless City", type: "silver"});

          player.handCount = playerHand.length;
          batch.update(playerRef, {hand: playerHand});
        }
        await batch.commit();
      } else if (lobbyData.zones[fourthZone].id === "mafia-city-states") {
        // all players gain 2
        for (const allPlayer of lobbyData.players) {
          gainMoney(allPlayer, 2, lobbyData,
              {name: "Mafia City-States", type: "yellow"});
        }
      }
    }

    // Check each player and move them if they are in an unreal zone.
    lobbyData.players.forEach((player) => {
      const currentZoneIndex = player.zone;
      // Check if the player's current zone is still real.
      if (!realZones.includes(currentZoneIndex)) {
        const currentZone = lobbyData.zones[currentZoneIndex];
        if (currentZone) {
          const ageIndex = parseInt(currentZone.age) - 1;
          // Find the new real zone for that age.
          const newRealZoneIndex = realZones[ageIndex];
          const newRealZone = lobbyData.zones[newRealZoneIndex];

          // Move the player.
          player.zone = newRealZoneIndex;
          logMessage(lobbyData, [
            {type: "player", value: player.name, color: player.color},
            {type: "text", value: " was time-shifted to "},
            {type: "zone", value: newRealZone.name, color: newRealZone.color},
            {type: "text", value: " due to a history change."},
          ]);
        }
      }
    });
  } else {
    logMessage(lobbyData,
        "Attempted to change history in an invalid zone index.", "warn");
  }
};

/**
 * Handles the hourglass mechanic for zones.
 * Decrements the hourglass count for the player's current zone.
 * If the hourglass count reaches 0, it resets and returns true.
 * @param {object} player The active player.
 * @param {object} lobbyData The current lobby data.
 * @return {boolean} True if the hourglass was reset, false otherwise.
 */
exports.removeHourglass = function(player, lobbyData) {
  const zone = lobbyData.zones[player.zone];
  const playerCount = lobbyData.players.length;

  if (zone.hourglass == null) {
    zone.hourglass = playerCount;
    return true;
  }

  zone.hourglass--;

  if (zone.hourglass === 0) {
    zone.hourglass = playerCount;
    return true;
  }

  return false;
};

/**
 * Executes the actions for playing a Momentary card.
 * @param {object} player The active player.
 * @param {Array<object>} hand The player's hand.
 * @param {object} card The card being played.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.playMomentary = async function(player, hand, card, lobbyData, lobbyId) {
  const {getFirestore} = require("firebase-admin/firestore");
  switch (card.id) {
    case "anubis-statuette": {
      if (!lobbyData.postVisitQueue) lobbyData.postVisitQueue = [];
      const anubisCount = lobbyData.postVisitQueue.filter((i) =>
        i.cardId === "anubis-statuette" && i.playerId === player.id).length;
      lobbyData.postVisitQueue.push({
        id: `anubis-${player.id}-${anubisCount}`,
        label: "Anubis Statuette",
        cardId: "anubis-statuette",
        playerId: player.id,
      });
      break;
    }
    case "artist":
      drawCards(player, hand, 1, lobbyData, {name: card.name, type: card.type});
      break;
    case "barbarian-horde":
      setPlayerPrompt(player, lobbyData, "discard-many");
      break;
    case "crown-jewels":
      setPlayerPrompt(player, lobbyData, "discard-many");
      break;
    case "engineer":
      drawCards(player, hand, 2, lobbyData, {name: card.name, type: card.type});
      if (hand.length <= 2) {
        for (let i = hand.length - 1; i >= 0; i--) {
          discardCard(player, hand, i, lobbyData,
              {name: card.name, type: card.type});
        }
        break;
      }
      setPlayerPrompt(player, lobbyData, "discard-n",
          {required: 2, source: {name: card.name, type: card.type}});
      break;
    case "gizmo":
      // Prompt player to choose a momentary card to play twice.
      setPlayerPrompt(player, lobbyData, "gizmo-choice");
      break;
    case "gladiators-gladius": {
      const ruledCount = timesRuled(player, lobbyData.players);
      drawCards(player, hand, ruledCount, lobbyData,
          {name: card.name, type: card.type});
      break;
    }
    case "golden-goose": {
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id) {
          gainMoney(otherPlayer, 5, lobbyData,
              {name: card.name, type: card.type});
        }
      }
      break;
    }
    case "infected-rat": {
      for (const otherPlayer of lobbyData.players) {
        // Skip the current player
        if (!otherPlayer || otherPlayer.id === player.id) {
          continue;
        }

        // Only prompt if they have more cards
        if (otherPlayer.handCount <= player.handCount) {
          continue;
        }

        // Skip if they're in Utopia and it's not their turn
        if (lobbyData.zones[otherPlayer.zone].id === "utopia" &&
          !otherPlayer.turn) {
          continue;
        }

        promptDiscard(otherPlayer, lobbyData,
            {name: card.name, type: card.type});
      }
      break;
    }
    case "inventor":
      setPlayerPrompt(player, lobbyData, "inventor");
      break;
    case "kill-your-grandfather":
      for (let i = hand.length - 1; i >= 0; i--) {
        discardCard(player, hand, i, lobbyData,
            {name: card.name, type: card.type});
      }
      drawCards(player, hand, 2, lobbyData, {name: card.name, type: card.type});
      break;
    case "kings-sword": {
      const kingsSwordCrowns = timesRuled(player, lobbyData.players);
      player.crowns = kingsSwordCrowns;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: kingsSwordCrowns,
            source: {name: card.name, type: card.type}});
      break;
    }
    case "mayan-ritual-knife": {
      const mayanLoss = 2 * timesRuled(player, lobbyData.players);
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id) {
          stealMoney(otherPlayer, mayanLoss, lobbyData,
              {name: card.name, type: card.type});
        }
      }
      break;
    }
    case "papal-tiara":
      await promptScore(player, hand, "", lobbyData);
      break;
    case "predict-the-future": {
      if (!lobbyData.endOfTurnQueue) lobbyData.endOfTurnQueue = [];
      const predictCount = lobbyData.endOfTurnQueue.filter((i) =>
        i.cardId === "predict-the-future" && i.playerId === player.id).length;
      lobbyData.endOfTurnQueue.push({
        id: `predict-${player.id}-${predictCount}`,
        label: "Predict the Future",
        cardId: "predict-the-future",
        playerId: player.id,
      });
      break;
    }
    case "settlers":
      player.crowns = 1;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 1, source: {name: "Settlers", type: "M"}});
      break;
    case "shoguns-katana":
      gainMoney(player, (2 * timesRuled(player, lobbyData.players)),
          lobbyData, {name: card.name, type: card.type});
      break;
    case "step-on-a-butterfly": {
      if (!lobbyData.endOfTurnQueue) lobbyData.endOfTurnQueue = [];
      const butterflyCount = lobbyData.endOfTurnQueue.filter((i) =>
        i.cardId === "step-on-a-butterfly" && i.playerId === player.id).length;
      lobbyData.endOfTurnQueue.push({
        id: `butterfly-${player.id}-${butterflyCount}`,
        label: "Step on a Butterfly",
        cardId: "step-on-a-butterfly",
        playerId: player.id});
      break;
    }
    case "trinket":
      await promptPlay(player, hand, lobbyData, lobbyId);
      break;
    case "tulip-stocks": {
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id && lobbyData.zones[otherPlayer.zone]) {
          stealMoney(otherPlayer, 5, lobbyData,
              {name: card.name, type: card.type});
        }
      }
      break;
    }
    // Alternate Realities Cards
    case "trade-goods":
      setPlayerPrompt(player, lobbyData, "trade-goods-choice");
      break;
    case "panacea":
      if (doesPlayerRuleAge(player, 2, lobbyData.players)) {
        gainMoney(player, 4, lobbyData, {name: "Panacea", type: "M"});
      }
      if (doesPlayerRuleAge(player, 1, lobbyData.players)) {
        drawCards(player, hand, 1, lobbyData, {name: "Panacea", type: "M"});
      }
      if (doesPlayerRuleAge(player, 0, lobbyData.players)) {
        setPlayerPrompt(player, lobbyData, "advance",
            {crownCount: 1, source: {name: "Panacea", type: "M"}});
      }
      break;
    case "ancient-scroll": {
      const db = getFirestore();
      const batch = db.batch();
      for (const p of lobbyData.players) {
        if (p.id === player.id) {
          // Handle current player's draw directly with their in-memory hand
          drawCards(p, hand, 1, lobbyData,
              {name: card.name, type: card.type});
        } else {
          // For other players, fetch their hand, draw, and batch the update
          const playerRef = db.collection("lobbies").doc(lobbyId)
              .collection("private").doc(p.id);
          const playerSnap = await playerRef.get();
          const playerHand = playerSnap.exists ? playerSnap.data().hand : [];
          drawCards(p, playerHand, 1, lobbyData,
              {name: card.name, type: card.type});
          p.handCount = playerHand.length;
          batch.update(playerRef, {hand: playerHand});
        }
      }
      await batch.commit();
      break;
    }
    case "assassins-dagger": {
      player.crowns = 1;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 1, source: {name: "Assassin's Dagger", type: "M"}});
      break;
    }
    case "golden-apple":
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id) {
          moveToZone(otherPlayer, player.zone, lobbyData,
              {name: card.name, type: card.type});
        }
      }
      break;
    case "visionary": {
      player.crowns = 1;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 1, source: {name: "Visionary", type: "M"}});
      break;
    }
    case "meet-younger-self": {
      drawCards(player, hand, 3, lobbyData,
          {name: "Meet Younger Self", type: "M"});
      break;
    }
    case "pilgrims": {
      await promptScore(player, hand, "pilgrims", lobbyData);
      break;
    }
    case "maneuver": {
      if (!lobbyData.postVisitQueue) lobbyData.postVisitQueue = [];
      const maneuverCount = lobbyData.postVisitQueue.filter((i) =>
        i.cardId === "maneuver" && i.playerId === player.id).length;
      lobbyData.postVisitQueue.push({
        id: `maneuver-${player.id}-${maneuverCount}`,
        label: "Maneuver",
        cardId: "maneuver",
        playerId: player.id,
      });
      break;
    }
    case "secret-mission": {
      // Draw a card. Advance one of your ♛.
      drawCards(player, hand, 1, lobbyData,
          {name: "Secret Mission", type: "M"});
      player.crowns = 1;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 1, source: {name: "Secret Mission", type: "M"}});
      break;
    }
    case "secret-plot": {
      // Discard a card. Score a card (paying). Play a card.
      // TODO: add follow-up to resolution stack.
      // One of a few Momentary cards with follow-up (also Visionary)
      promptDiscard(player, lobbyData,
          {name: card.name, type: card.type});
      break;
    }
    case "secret-stash": {
      // If you're alone, gain $1 per ♛ you have here.
      if (crowdedness(player, lobbyData.players) === 0) {
        const ageIndex = parseInt(lobbyData.zones[player.zone].age) - 1;
        gainMoney(player, (player.scoreTrack[ageIndex]),
            lobbyData, {name: "Secret Stash", type: "M"});
      }
      break;
    }
    case "secret-weapon": {
      // Draw a card. Play a card.
      drawCards(player, hand, 1, lobbyData,
          {name: "Secret Weapon", type: "M"});
      await promptPlay(player, hand, lobbyData, lobbyId);
      break;
    }
  }
};

/**
 * Executes the actions for playing a Perpetual card.
 * @param {object} player The active player.
 * @param {object} card The card being played.
 * @param {object} lobbyData The current lobby data.
 */
exports.playPerpetual = function(player, card, lobbyData) {
  if (!player.perpetuals) {
    player.perpetuals = {play: [], score: [], draw: [], postPlay: [],
      postScore: [], turnEnd: [], discard: [], postVisit: [], advance: []};
  }
  switch (card.id) {
    case "black-market":
      player.perpetuals.play.push(card);
      break;
    case "conspiracy":
    case "friends-in-old-places":
      player.perpetuals.score.push(card);
      break;
    case "explorer":
    case "detective":
      player.perpetuals.draw.push(card);
      break;
    case "bank":
      player.perpetuals.draw.push(card);
      break;
    case "gang-of-pickpockets":
      player.GOP = true;
      player.perpetuals.postPlay.push(card);
      break;
    case "revolutionaries":
      player.newRevolutionaries = true;
      player.perpetuals.postPlay.push(card);
      break;
    case "investments":
    case "hideout":
    case "sunboat-of-ra":
      player.perpetuals.turnEnd.push(card);
      break;
    case "prime-real-estate":
      player.perpetuals.advance.push(card);
      break;
    case "secret-society":
      player.perpetuals.postScore.push(card);
      break;
    case "think-tank":
      player.perpetuals.discard.push(card);
      break;
    case "treasure-map":
    case "university":
      player.perpetuals.postVisit.push(card);
      break;
  }
};

/**
 * Handles the logic for playing a specific card.
 * @param {object} player The player playing the card.
 * @param {Array<object>} hand The player's hand.
 * @param {object} cardToPlay The card object to play.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.playSpecificCard =
  async function(player, hand, cardToPlay, lobbyData, lobbyId) {
    player.cardsInPlay.push(cardToPlay);

    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " played "},
      {type: "card", value: cardToPlay.name, cardType: cardToPlay.type},
      {type: "text", value: "."},
    ]);

    if (player.perpetuals && player.perpetuals.play) {
      const blackMarketCount = player.perpetuals.play
          .filter((c) => c.id === "black-market").length;
      gainMoney(player, (2 * blackMarketCount), lobbyData,
          {name: "Black Market", type: "P"});
    }

    gainMoney(player, cardToPlay.coin, lobbyData,
        {name: cardToPlay.name, type: cardToPlay.type});

    const actionType = lobbyData.activePrompts[player.id] || "play";
    lobbyData.lastAction = {type: actionType, uid: player.id};
    player.prompt = "";
    if (lobbyData.activePrompts && lobbyData.activePrompts[player.id]) {
      delete lobbyData.activePrompts[player.id];
    }

    lobbyData.resolutionStack.push({type: "card", id: cardToPlay.id,
      instruction: ""});

    if (cardToPlay.type === "M") {
      await exports.playMomentary(player, hand, cardToPlay, lobbyData, lobbyId);
    } else if (cardToPlay.type === "P") {
      exports.playPerpetual(player, cardToPlay, lobbyData);
    }

    const result = await executeCardFollowUp(player,
        cardToPlay.id, lobbyData, lobbyId, null, {updatedHand: hand});
    return result;
  };

exports.playSpecificCardTwice =
  async function(player, hand, cardToPlay, lobbyData, lobbyId, sourceCard) {
    // Push a generic marker onto the stack to indicate this is the first play
    // of a two-play sequence.
    lobbyData.resolutionStack.push({type: "play-twice", id: cardToPlay.id,
      instruction: "first-play", sourceCard: sourceCard});

    // Play the card for the first time.
    return await exports.playSpecificCard(player, hand,
        cardToPlay, lobbyData, lobbyId);
  };

/**
 * Handles the logic for scoring a specific card.
 * @param {object} player The player scoring the card.
 * @param {object} cardToScore The card object to score.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.scoreSpecificCard =
  async function(player, cardToScore, lobbyData, lobbyId) {
    player.cardBeingScored = cardToScore;
    lobbyData.lastAction = {type: player.prompt, uid: player.id};

    const context = player.promptContext || {};
    const costReduction = context.costReduction || 0;
    const bonusCrown = context.bonusCrown || 0;
    const instruction = context.instruction || "";

    let finalCost = parseInt(cardToScore.cost) - costReduction;
    let finalCrowns = parseInt(cardToScore.score) + bonusCrown;

    if (instruction === "age-of-cats") {
      finalCost *= 2; // eslint-disable-line no-magic-numbers
      finalCrowns *= 2;
    }
    finalCost = Math.max(0, finalCost);

    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " scores "},
      {type: "card", value: cardToScore.name, cardType: cardToScore.type},
      {type: "text", value: " for "},
      {type: "coin", value: finalCost},
      {type: "text", value: ` to gain ${finalCrowns} `},
      {type: "crown"},
      {type: "text", value: "."},
    ]);
    // eslint-disable-next-line max-len
    gainMoney(player, -finalCost, lobbyData);
    player.crowns = finalCrowns;
    setPlayerPrompt(player, lobbyData, "advance", {crownCount: finalCrowns,
      source: {type: "score"}, scoredCardId: cardToScore.id,
      instruction: instruction});
    player.scoreableCards = [];

    // Handle returning Gizmo/Trade Goods to their piles when scored
    if (cardToScore.id === "gizmo") {
      if (!lobbyData.gizmoPile) lobbyData.gizmoPile = [];
      lobbyData.gizmoPile.push(player.cardBeingScored);
      player.gizmoCount = (player.gizmoCount || 0) - 1;
    } else if (cardToScore.id === "trade-goods") {
      if (!lobbyData.tradeGoodsPile) lobbyData.tradeGoodsPile = [];
      lobbyData.tradeGoodsPile.push(player.cardBeingScored);
      player.tradeGoodsCount = (player.tradeGoodsCount || 0) - 1;
    } else {
      if (!lobbyData.discardPile) lobbyData.discardPile = [];
      lobbyData.discardPile.push(player.cardBeingScored);
    }
    player.cardBeingScored = null;
  };


/**
 * Handles the logic for scoring a specific card in Scrapyard World.
 * @param {object} player The player scoring the card.
 * @param {object} cardToScore The card object to score.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.scoreScrapyardCard =
  async function(player, cardToScore, lobbyData, lobbyId) {
    player.cardBeingScored = cardToScore;
    lobbyData.lastAction = {type: player.prompt, uid: player.id};

    const context = player.promptContext || {};
    const costReduction = context.costReduction || 0;
    const bonusCrown = context.bonusCrown || 0;

    let finalCost = parseInt(cardToScore.cost) - costReduction;
    const finalCrowns = parseInt(cardToScore.score) + bonusCrown;

    finalCost = Math.max(0, finalCost);
    finalCost = Math.floor(finalCost / 4);

    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: ` discards ${finalCost > 1 ?
        finalCost : "a"} card${finalCost > 1 ? "s" : ""} to score `},
      {type: "card", value: cardToScore.name, cardType: cardToScore.type},
      {type: "text", value: ` to gain ${finalCrowns} `},
      {type: "crown"},
      {type: "text", value: "."},
    ]);

    player.crowns = finalCrowns;
    setPlayerPrompt(player, lobbyData, "discard-n",
        {required: finalCost, source:
          {name: "Scrapyard World", type: "yellow"}});
    player.scoreableCards = [];
  };

// Setters for circular dependencies
exports.setPromptScore = (func) => {
  promptScore = func;
};
exports.setPromptPlay = (func) => {
  promptPlay = func;
};
exports.setPromptDiscard = (func) => {
  promptDiscard = func;
};
exports.setExecuteCardFollowUp = (func) => {
  executeCardFollowUp = func;
};
exports.setPromptVisit = (func) => {
  promptVisit = func;
};
exports.setExecuteZoneFollowUp = (func) => {
  executeZoneFollowUp = func;
};
exports.setProcessPostVisitQueue = (func) => {
  processPostVisitQueue = func;
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
exports.setVisitSpecificZone = (func) => {
  visitSpecificZone = func;
};
