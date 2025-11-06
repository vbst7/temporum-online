const {logMessage, peekStack} = require("./logHelpers");
const {drawCards, gainMoney, doesPlayerRuleAge, timesRuled,
  discardCard, getAgeIndexFromPlayerZone, moveToZone, stealMoney,
  crowdedness, advanceSpecificCrown, retreatSpecificCrown,
} = require("./resourceHelpers");
const {getFirestore} = require("firebase-admin/firestore");

// Forward declarations for functions that have circular dependencies.
// These will be set via `initializeHelpers` in initHelpers.js.
let executeZoneFollowUp;
let executeCardFollowUp; // eslint-disable-line no-unused-vars
let executeChangeHistoryHelper; // eslint-disable-line no-unused-vars
let processPostVisitQueue; // eslint-disable-line no-unused-vars
let promptPlay;
let promptDiscard;
let promptScore; // Self-reference for internal calls within this module
let promptVisit; // Self-reference for internal calls within this module
let visitSpecificZone; // eslint-disable-line no-unused-vars
let removeHourglass;

/**
 * Sets a prompt for a player, updating all necessary state fields.
 * This is the centralized function for all prompt setting.
 * @param {object} player The player to set the prompt for.
 * @param {object} lobbyData The lobby data object.
 * @param {string} prompt The prompt string (e.g., 'score', 'play').
 * @param {object} [promptContext={}] Optional context for the prompt.
 */
function setPlayerPrompt(player, lobbyData, prompt, promptContext = {}) {
  if (!lobbyData.activePrompts) {
    lobbyData.activePrompts = {};
  }
  player.prompt = prompt;
  player.promptContext = promptContext;
  lobbyData.activePrompts[player.id] = prompt;
}

/**
 * Prompts a player to score a card if they have affordable options.
 * @param {object} player The active player.
 * @param {Array<object>} hand The player's hand.
 * @param {string} instruction The context for scoring (e.g., a zone bonus).
 * @param {object} lobbyData The current lobby data.
 */
exports.promptScore = async function(player, hand, instruction, lobbyData) {
  let currentHand = hand;
  // If hand is not provided, fetch it from the database.
  if (!currentHand) {
    const db = getFirestore();
    const privateRef = db.collection("lobbies").doc(lobbyData.lobbyId)
        .collection("private").doc(player.id);
    const privateSnap = await privateRef.get();
    currentHand = privateSnap.exists ? privateSnap.data().hand : [];
  }
  if (!lobbyData.activePrompts) {
    lobbyData.activePrompts = {};
  }

  let costReduction = 0;
  let bonusCrown = 0;

  if (player.perpetuals && player.perpetuals.score) {
    const friendsCount = player.perpetuals.score
        .filter((c) => c.id === "friends-in-old-places").length;
    costReduction += friendsCount * 2;
    bonusCrown += player.perpetuals.score
        .filter((c) => c.id === "conspiracy").length;
  }

  switch (instruction) {
    case "iron-age":
      costReduction += timesRuled(player, lobbyData.players) * 2;
      break;
    case "time-of-legends":
      bonusCrown += 1;
      break;
    case "pilgrims":
      costReduction += 12;
      bonusCrown -= 2;
      break;
  }

  const scoreableCards = [];

  if (instruction === "scrapyard-world") {
    if (currentHand) {
      currentHand.forEach((card, index) => {
        let finalCost = parseInt(card.cost) - costReduction;
        finalCost = Math.max(0, finalCost);
        finalCost = Math.floor(finalCost / 4);

        if (player.handCount > finalCost) {
          scoreableCards.push(index);
        }
      });
    }
  } else if (currentHand) {
    currentHand.forEach((card, index) => {
      let finalCost = parseInt(card.cost) - costReduction;
      if (instruction === "age-of-cats") {
        finalCost *= 2;
      }
      finalCost = Math.max(0, finalCost);

      if (player.coins >= finalCost) {
        scoreableCards.push(index);
      }
    });
  }
  player.scoreableCards = scoreableCards;

  if (scoreableCards.length === 0) {
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " has no cards they can afford to score."},
    ]);
    // Clear prompt and active prompt entry
    setPlayerPrompt(player, lobbyData, "", {});
    delete lobbyData.activePrompts[player.id];

    // If no scoreable cards, and no new prompt was set,
    // continue with the resolution stack.
    // This will either set a new prompt or process the post-visit queue.
    if (lobbyData.resolutionStack.length > 0) {
      const underlyingAction = peekStack(lobbyData);
      await executeZoneFollowUp(player, underlyingAction.id,
          lobbyData, lobbyData.lobbyId, underlyingAction.instruction);
    }
  } else {
    setPlayerPrompt(player, lobbyData, "score",
        {costReduction, bonusCrown, instruction});
  }
  return currentHand;
};

/**
 * Checks if player has any cards, if they do, prompt them to play one.
 * @param {object} player The active player.
 * @param {Array<object>} hand The player's hand.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.promptPlay = async function(player, hand, lobbyData, lobbyId) {
  let currentHand = hand;
  // If hand is not provided, fetch it from the database.
  if (!currentHand) {
    const db = getFirestore();
    const privateRef = db.collection("lobbies").doc(lobbyId)
        .collection("private").doc(player.id);
    const privateSnap = await privateRef.get();
    currentHand = privateSnap.exists ? privateSnap.data().hand : [];
  }

  if (!lobbyData.activePrompts) {
    lobbyData.activePrompts = {};
  }
  if (currentHand && currentHand.length > 0) {
    setPlayerPrompt(player, lobbyData, "play");
  } else {
    player.prompt = "";
    // If no cards to play, and no new prompt was set,
    // continue with the resolution stack.
    // This will either set a new prompt or process the post-visit queue.
    if (lobbyData.resolutionStack.length > 0) {
      const underlyingAction = peekStack(lobbyData);
      await executeZoneFollowUp(player, underlyingAction.id,
          lobbyData, lobbyId, underlyingAction.instruction);
    }
  }
  return currentHand;
};

/**
 * Checks if a player has any cards, and if so, prompts them to discard one.
 * @param {object} player The player to prompt.
 * @param {object} lobbyData The current lobby data.
 * @param {object|string} [source=null] The source of the discard action.
 */
exports.promptDiscard = function(player, lobbyData, source = null) {
  if (!lobbyData.activePrompts) {
    lobbyData.activePrompts = {};
  }
  if (player.handCount > 0) {
    setPlayerPrompt(player, lobbyData, "discard", {source: source});
  } else {
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " has no cards to discard."},
    ]);
    player.prompt = "";
  }
};

/**
 * Sets the player's prompt to 'visitZone' and calculates legal zones.
 * This is a synchronous helper that mutates the passed-in lobbyData object.
 * @param {object} player The player to prompt.
 * @param {object} lobbyData The lobby data object to mutate.
 * @param {string} [promptType='visitZone'] The type of prompt to set.
 */
exports.promptVisit =
  async function(player, lobbyData, promptType = "visitZone") {
    if (!lobbyData.activePrompts) {
      lobbyData.activePrompts = {};
    }

    if (lobbyData.activePrompts[player.id]) {
      delete lobbyData.activePrompts[player.id];
    }

    if (lobbyData.zones[player.zone].id === "police-state") {
      lobbyData.legalZones = lobbyData.legalZones
          .filter((zoneIndex) => zoneIndex > 2);
    }
    setPlayerPrompt(player, lobbyData, promptType);
  };

/**
 * Executes the actions for visiting an Age I zone.
 * @param {object} player The active player.
 * @param {Array<object>} hand The player's hand.
 * @param {object} zone The zone being visited.
 * @param {object} lobbyData The current lobby data.
 */
async function visitAgeI(player, hand, zone, lobbyData) {
  let instruction = "";
  if (zone.id === "iron-age") {
    instruction = "iron-age";
  } else if (zone.id === "time-of-legends") {
    instruction = "time-of-legends";
  }
  await promptScore(player, hand, instruction, lobbyData);
}

/**
 * Executes the actions for visiting a zone that gives choice of effect.
 * @param {object} player The active player.
 * @param {object} lobbyData The current lobby data.
 */
function visitChoiceZone(player, lobbyData) {
  setPlayerPrompt(player, lobbyData, "choose");
}

/**
 * Executes the actions for visiting an Age II zone.
 * @param {object} player The active player.
 * @param {Array<object>} hand The player's hand.
 * @param {object} zone The zone being visited.
 * @param {object} lobbyData The current lobby data.
 */
async function visitAgeII(player, hand, zone, lobbyData) {
  const ageIndex = getAgeIndexFromPlayerZone(player.zone);


  if (zone.id === "scientist-enclave" && player.scoreTrack[ageIndex] > 0) {
  // You may retreat a ♛ of yours from here. If you do,
  // take a Gizmo card. Otherwise, draw 2 cards.
    setPlayerPrompt(player, lobbyData, "scientist-enclave");
    return hand;
  }


  drawCards(player, hand, 2, lobbyData,
      {name: zone.name, type: zone.color});

  switch (zone.id) {
    case "renaissance":
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        drawCards(player, hand, 1, lobbyData,
            {name: "Renaissance", type: "green"});
      }
      break;
    case "feudal-japan":
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        setPlayerPrompt(player, lobbyData, "feudal-japan");
      }
      break;
    case "age-of-cults": {
      const cultPlayers = lobbyData.players
          .map((p, index) => ({player: p, originalIndex: index}))
          .filter((item) => item.player.handCount > 0);

      if (cultPlayers.length > 1) {
        logMessage(lobbyData, [{
          type: "zone",
          value: "Age of Cults",
          color: zone.color,
        }, {
          type: "text", value: ` triggers a card pass between 
          ${cultPlayers.length} players.`,
        }]);
        lobbyData.passedCards = new Array(cultPlayers.length).fill(null);
        lobbyData.cultPlayerIndices = cultPlayers.map((item) =>
          item.originalIndex);
        cultPlayers.forEach((item) => {
          setPlayerPrompt(item.player, lobbyData, "pass-card");
        });
      }
      break;
    }
    case "crusades": {
      let coins = 0;
      for (const allPlayer of lobbyData.players) {
        if (allPlayer.zone === 0) coins += 2;
      }
      gainMoney(player, coins, lobbyData, {name: "Crusades", type: "green"});
      break;
    }
    case "plague": {
      for (const allPlayer of lobbyData.players) {
        const isInPlagueZone = allPlayer.zone < 6 && allPlayer.zone !== 1 &&
          allPlayer.zone !== 2;
        if (isInPlagueZone && allPlayer.handCount > 0) {
          promptDiscard(allPlayer, lobbyData,
              {name: "Plague", type: "green"});
        }
      }
      break;
    }
    case "roman-empire":
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        gainMoney(player, 2, lobbyData,
            {name: "Roman Empire", type: "green"});
      } else {
        stealMoney(player, 2, lobbyData,
            {name: "Roman Empire", type: "green"});
      }
      break;
    case "holy-norse-empire":
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        gainMoney(player, 3, lobbyData,
            {name: "Holy Norse Empire", type: "green"});
      }
      break;
    case "inquisition": {
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        for (const otherPlayer of lobbyData.players) {
          if (otherPlayer.id !== player.id) {
            if (lobbyData.zones[otherPlayer.zone].id !== "utopia" ||
                otherPlayer.turn === true) {
              setPlayerPrompt(otherPlayer, lobbyData, "inquisition");
            }
          }
        }
      }
      break;
    }
    case "aztec-invasion": {
      if (player.scoreTrack[ageIndex] === 0) {
        if (player.scoreTrack[0] > 0) {
          advanceSpecificCrown(player, 0, lobbyData,
              {name: "Aztec Invasion", type: "green"});
        }
      }
      break;
    }
    case "egyptian-america": {
      if (doesPlayerRuleAge(player, ageIndex,
          lobbyData.players) && ageIndex === 1) {
        if (player.scoreTrack[1] > 0 && ageIndex === 1) {
          advanceSpecificCrown(player, 0, lobbyData,
              {name: "Egyptian America", type: "green"});
        }
      }
      break;
    }
    // Alternate Realities
    case "empire-of-the-amazons": {
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        if (player.scoreTrack[1] > 0 && ageIndex === 1) {
          retreatSpecificCrown(player, ageIndex, lobbyData,
              {name: "Empire of the Amazons", type: "green"});
          drawCards(player, hand, 2, lobbyData,
              {name: "Empire of the Amazons", type: "green"});
        }
      }
      break;
    }
    case "ancient-carthage": {
      // Draw 2 cards. Take a Trade Goods card.
      const tradeGoods = lobbyData.tradeGoodsPile.pop();
      if (tradeGoods) {
        hand.push(tradeGoods);
      }
      break;
    }
    case "bright-ages": {
      // Draw 3 cards. Put a card from your hand on top of the deck,
      // face up.
      drawCards(player, hand, 1, lobbyData,
          {name: "Bright Ages", type: "green"});
      if (hand.length > 0) {
        setPlayerPrompt(player, lobbyData, "return-card");
      }
      break;
    }
    case "byzantine-empire": {
      // Draw 2 cards. When you move here, gain $1 per card in your hand.
      break;
    }
    case "celtic-paradise": {
      // Draw 2 cards. ⧖: Each player with less than $8 gains $8.
      if (removeHourglass(player, lobbyData)) {
        for (const p of lobbyData.players) {
          if (p.coins < 8) {
            gainMoney(p, 8 - p.coins, lobbyData,
                {name: "Celtic Paradise", type: "green"});
          }
        }
      }
      break;
    }
    case "dark-ages": {
      // Draw 3 cards. When you start a turn here, discard a card.
      drawCards(player, hand, 1, lobbyData,
          {name: "Dark Ages", type: "green"});
      break;
    }
    case "greek-america": {
      // Draw 2 cards. If you rule here, you may put a Base here. Either
      // way, if you have a Base here, you may discard a card to gain $6.
      const hasBase = player.bases?.includes(player.zone);
      if (hasBase) break;
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        setPlayerPrompt(player, lobbyData, "greek-america-base-choice");
      }
      break;
    }
    case "mongolian-empire": {
      // Draw 2 cards. If you rule here, other players with as
      // many or more cards in hand than you discard a card.
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        for (const otherPlayer of lobbyData.players) {
          if (otherPlayer.id !== player.id &&
              otherPlayer.handCount >= player.handCount) {
            if (lobbyData.zones[otherPlayer.zone].id !== "utopia" ||
                otherPlayer.turn) {
              promptDiscard(otherPlayer, lobbyData,
                  {name: "Mongolian Empire", type: "green"});
            }
          }
        }
      }
      break;
    }
    case "three-kingdoms": {
      // Draw 2 cards. ⧖: Each player who doesn't rule here
      // discards a card and loses $4.
      break;
    }
    case "tibetan-empire": {
      // Draw 2 cards. If you rule here, you don't get any $ for
      // the rest of the turn, and may play a card.
      break;
    }
    case "viking-america": {
      // Draw 2 cards. When you move from here to a Time you rule,
      // gain $4.
      break;
    }
  }
  return hand;
}

/**
 * Executes the actions for visiting an Age IV zone.
 * @param {object} player The active player.
 * @param {Array<object>} hand The player's hand.
 * @param {object} zone The zone being visited.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
async function visitAgeIV(player, hand, zone, lobbyData, lobbyId) {
  switch (zone.id) {
    case "nanotech-wonderland":
      gainMoney(player, (2 * player.handCount), lobbyData,
          {name: "Nanotech Wonderland", type: "silver"});
      break;
    case "robot-uprising":
      player.crowns = 1;
      setPlayerPrompt(player, lobbyData, "advance", {crownCount: 1,
        source: {name: "Robot Uprising", type: zone.color}});
      break;
    case "space-age":
      lobbyData.resolutionStack.push({type: "zone", id: "space-age", instruction: "score-again"}); // eslint-disable-line max-len
      await promptScore(player, hand, "", lobbyData);
      break;
    case "utopia":
      gainMoney(player, 4, lobbyData, {name: "Utopia", type: "silver"});
      drawCards(player, hand, 1, lobbyData, {name: "Utopia", type: "silver"});
      break;
    case "age-of-cats":
      if (player.coins >= 10) {
        setPlayerPrompt(player, lobbyData, "cats");
      }
      break;
    case "age-of-cybernetics": {
      const hasPerpetuals = player.perpetuals && Object.values(player.perpetuals) // eslint-disable-line max-len
          .some((arr) => arr.length > 0);
      const hasHandCards = player.handCount > 0;
      if (hasPerpetuals && hasHandCards) {
        setPlayerPrompt(player, lobbyData, "cybernetics-perpetual");
      } else {
        logMessage(lobbyData, [
          {type: "zone", value: "Age of Cybernetics", color: zone.color},
          {type: "text", value: " has no effect (no perpetuals or no cards in hand)."}, // eslint-disable-line max-len
        ]);
      }
      break;
    }
    case "age-of-toys":
      if (player.coins >= 4) {
        setPlayerPrompt(player, lobbyData, "toys");
      }
      break;
    case "communist-utopia":
      if (player.coins < 12) {
        lobbyData.resolutionStack.push({type: "zone", id: "communist-utopia",
          instruction: "play-again"});
        await promptPlay(player, hand, lobbyData);
      }
      break;
    case "information-age":
      lobbyData.resolutionStack.push({type: "zone", id: "information-age",
        instruction: 0},
      {type: "zone", id: "information-age", instruction: 1},
      {type: "zone", id: "information-age", instruction: 2},
      {type: "zone", id: "information-age", instruction: 3});
      break;
    case "nuclear-wasteland":
      if (doesPlayerRuleAge(player, 3, lobbyData.players)) {
        gainMoney(player, 2, lobbyData,
            {name: "Nuclear Wasteland", type: "silver"});
        lobbyData.legalZones = lobbyData.realZones.slice(0, 3);
        await promptVisit(player, lobbyData);
      }
      break;
    case "savagery":
      for (let i = player.handCount - 1; i >= 0; i--) {
        discardCard(player, hand, i, lobbyData,
            {name: "Savagery", type: "green"});
      }
      drawCards(player, hand, 3, lobbyData,
          {name: "Savagery", type: "green"});
      break;
    case "steampunk-empire":
      if (player.handCount > 0) {
        lobbyData.resolutionStack.push({type: "zone", id: "steampunk-empire",
          instruction: "advance"});
        promptDiscard(player, lobbyData,
            {name: "Steampunk Empire", type: "silver"});
      }
      break;
    case "warm-globe": {
      gainMoney(player, 8, lobbyData, {name: "Warm Globe", type: "brown"});
      const playerIndex = lobbyData.players
          .findIndex((p) => p.id === player.id);
      const numPlayers = lobbyData.players.length;
      const playersToPrompt = [];
      for (let i = 1; i < numPlayers; i++) {
        const nextPlayerIndex = (playerIndex + i) % numPlayers;
        playersToPrompt.push(nextPlayerIndex);
      }
      for (let i = playersToPrompt.length - 1; i >= 0; i--) {
        lobbyData.resolutionStack.push({
          type: "zone", id: "warm-globe",
          instruction: playersToPrompt[i],
        });
      }
      await promptPlay(player, hand, lobbyData, lobbyId);
      break;
    }
    case "mere-anarchy": {
      stealMoney(player, player.coins, lobbyData,
          {name: "Mere Anarchy", type: "silver"});
      gainMoney(player, (3 * player.scoreTrack[3]), lobbyData,
          {name: "Mere Anarchy", type: "silver"});
      break;
    }
    case "alien-contact": {
      drawCards(player, hand, 1, lobbyData,
          {name: "Alien Contact", type: "silver"});
      if (hand && hand.length > 0) {
        const drawnCard = hand[hand.length - 1];
        if (player.coins >= parseInt(drawnCard.cost)) {
          player.scoreableCards = [hand.length - 1];
          setPlayerPrompt(player, lobbyData, "alien-contact",
              {cardId: drawnCard.id});
        } else {
          player.scoreableCards = [];
        }
      } else {
        player.scoreableCards = [];
      }
      break;
    }
    // Alternate Realities
    case "age-of-superheroes": {
      // "If you are alone here with exactly 0 cards in hand or $0,
      // advance a ♛ of yours from Time I to here."
      if (crowdedness(player, lobbyData.players) !== 0 ||
      player.scoreTrack[0] === 0) break;
      if (player.coins === 0 || hand.length === 0) {
        advanceSpecificCrown(player, 0, lobbyData,
            {name: "Age of Superheroes", type: "silver"});
        advanceSpecificCrown(player, 1, lobbyData,
            {name: "Age of Superheroes", type: "silver"});
        advanceSpecificCrown(player, 2, lobbyData,
            {name: "Age of Superheroes", type: "silver"});
      }
      break;
    }
    case "floating-cities": {
      // "If you have exactly 6 cards in hand, score a card then play a card."
      if (hand.length === 6) {
        lobbyData.resolutionStack.push({
          type: "zone", id: "floating-cities",
          instruction: "play",
        });
        await promptScore(player, hand, "", lobbyData);
      }
      break;
    }
    case "singularity": {
      // "If the last turn was another player's, you may pay $10
      // to take 2 extra turns after this one."
      if (lobbyData.previousTurnPlayerId !== player.id && player.coins >= 10) {
        setPlayerPrompt(player, lobbyData, "singularity-choice");
      }
      break;
    }
    case "simulated-paradise": {
      if (doesPlayerRuleAge(player, 3, lobbyData.players)) {
        const allZoneIndices = lobbyData.zones.map((_, index) => index);
        const legalZonesForSim = allZoneIndices.filter((index) =>
          lobbyData.zones[index].id !== "simulated-paradise");
        lobbyData.legalZones = legalZonesForSim;
        setPlayerPrompt(player, lobbyData, "simulatedChoice");
      }
      break;
    }
    case "endless-city": {
      gainMoney(player, 8, lobbyData, {name: "Endless City", type: "silver"});
      const tradeGoods = lobbyData.tradeGoodsPile.pop();
      if (tradeGoods) {
        hand.push(tradeGoods);
      }
      break;
    }
    case "mafia-city-states": {
      let stolen = 0;
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id) {
          stolen += stealMoney(otherPlayer, 1, lobbyData,
              {name: "Mafia City-States", type: "yellow"});
        }
      }
      gainMoney(player, stolen, lobbyData,
          {name: "Mafia City-States", type: "yellow"});
      await promptScore(player, hand, "", lobbyData);
      break;
    }
    case "underground-haven": {
      // "You may discard a card. If you do, gain $12
      // and if you rule here, take the Sage from the
      // supply or the player that has it."
      if (player.handCount > 0) {
        lobbyData.resolutionStack.push({type: "zone", id: "underground-haven",
          instruction: "sage"});
        promptDiscard(player, lobbyData,
            {name: "Underground Haven", type: "silver"});
      }
      break;
    }
    case "scrapyard-world": {
      // "Score a card, paying by discarding a card per
      // $4 cost, rather than paying $."
      await promptScore(player, hand, "scrapyard-world", lobbyData);
      break;
    }
    case "poison-earth": {
      // "Gain $8 and draw 2 cards. Take a Poison token."
      gainMoney(player, 8, lobbyData, {name: "Poison Earth",
        type: "silver"});
      drawCards(player, hand, 2, lobbyData, {name: "Poison Earth",
        type: "silver"});
      if (!player.poison) player.poison = [];
      player.poison.push({turn: lobbyData.turn, value: 1});
      break;
    }
  }
  return hand;
}

/**
 * Handles the logic for a player visiting a specific zone.
 * @param {object} player The player visiting the zone.
 * @param {Array<object>} hand The player's hand.
 * @param {number} zoneIndex The index of the zone to visit.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
exports.visitSpecificZone =
  async function(player, hand, zoneIndex, lobbyData, lobbyId) {
    const zone = lobbyData.zones[zoneIndex];

    moveToZone(player, zoneIndex, lobbyData);

    if (!player.visitedZones) player.visitedZones = [];
    player.visitedZones.push(zoneIndex);
    lobbyData.lastAction = {type: player.prompt, uid: player.id};
    player.prompt = "";
    if (lobbyData.activePrompts && lobbyData.activePrompts[player.id]) {
      delete lobbyData.activePrompts[player.id];
    }

    lobbyData.legalZones = [];
    lobbyData.resolutionStack.push({type: "zone", id: zone.id, instruction: ""}); // eslint-disable-line max-len
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " is visiting "},
      {type: "zone", value: zone.name, color: zone.color},
      {type: "text", value: "."},
    ]);

    // Check for Sage perpetual
    const sage = player.perpetuals?.visit?.find((c) => c.id === "sage");
    if (sage) {
      const ageOfZone = getAgeIndexFromPlayerZone(zoneIndex);
      if (doesPlayerRuleAge(player, ageOfZone, lobbyData.players)) {
        drawCards(player, hand, 1, lobbyData, {name: "Sage", type: "#d2b48c"});
      }
    }


    if (zone.has_coin && (crowdedness(player, lobbyData.players) === 0)) {
      gainMoney(player, 2, lobbyData,
          {name: "Primitive Paradise", type: "yellow"});
      zone.has_coin = false;
    }


    if (player.hq === zoneIndex) {
      gainMoney(player, 2, lobbyData,
          {name: "Age of Atlantis", type: "yellow"});
    }

    if (zone.color === "white") {
      visitChoiceZone(player, lobbyData);
    } else {
      switch (zone.age) {
        case "1":
          await visitAgeI(player, hand, zone, lobbyData);
          break;
        case "2":
          hand = await visitAgeII(player, hand, zone, lobbyData);
          break;
        case "3": {
          await promptPlay(player, hand, lobbyData, lobbyId);
          break;
        }
        case "4":
          hand = await visitAgeIV(player, hand, zone, lobbyData, lobbyId);
          break;
        default:
          logMessage(lobbyData, `Unknown zone age: ${zone.age}`, "warn");
      }
    }

    // Special case for Information Age: it just populates the
    // stack and then we let the game loop handle it.
    if (zone.id === "information-age") {
      return hand;
    }

    const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
    if (!anyPlayerHasPrompt) {
      // If no new prompt was set, continue with the resolution stack.
      // This will either set a new prompt or process the post-visit queue.
      if (lobbyData.resolutionStack.length > 0) {
        const action = peekStack(lobbyData);
        await executeZoneFollowUp(player, action.id, lobbyData,
            lobbyId, action.instruction, {updatedHand: hand});
      }
    }

    // After all potential follow-ups, save the final hand state.
    const db = getFirestore();
    const privateRef = db.collection("lobbies").doc(lobbyId)
        .collection("private").doc(player.id);
    await privateRef.update({hand: hand});

    return hand;
  };

// Setters for circular dependencies
exports.setExecuteZoneFollowUp = (func) => {
  executeZoneFollowUp = func;
};
exports.setExecuteCardFollowUp = (func) => {
  executeCardFollowUp = func;
};
exports.setExecuteChangeHistoryHelper = (func) => {
  executeChangeHistoryHelper = func;
};
exports.setProcessPostVisitQueue = (func) => {
  processPostVisitQueue = func;
};
exports.setPromptPlay = (func) => {
  promptPlay = func;
};
exports.setPromptScore = (func) => {
  promptScore = func;
};
exports.setPromptDiscard = (func) => {
  promptDiscard = func;
};
exports.setPlayerPrompt = setPlayerPrompt; // Export the new function
exports.setPromptVisit = (func) => {
  promptVisit = func;
};
exports.setVisitSpecificZone = (func) => {
  visitSpecificZone = func;
};
exports.setRemoveHourglass = (func) => {
  removeHourglass = func;
};
exports.visitChoiceZone = visitChoiceZone;
exports.visitAgeI = visitAgeI;
exports.visitAgeII = visitAgeII;
exports.visitAgeIV = visitAgeIV;
