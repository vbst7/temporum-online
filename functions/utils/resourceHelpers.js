const {logMessage} = require("./logHelpers");

/**
 * Determines the age index (0-3) based on a player's zone index (0-9).
 * @param {number} playerZoneIndex The player's current zone index.
 * @return {number} The corresponding age index.
 */
function getAgeIndexFromPlayerZone(playerZoneIndex) {
  if (playerZoneIndex === 0) return 0; // Time I
  if (playerZoneIndex <= 2) return 1; // Time II
  if (playerZoneIndex <= 5) return 2; // Time III
  if (playerZoneIndex <= 9) return 3; // Time IV
  // Default for safety, though zone indices should always be 0-9.
  return 0;
}


/**
 * Checks if a player has more crowns in a specific age than any other player.
 * @param {object} player The player to check.
 * @param {number} ageIndex The index of the score track column (0-3).
 * @param {Array} allPlayers The array of all players in the game.
 * @return {boolean} True if the player rules the age, false otherwise.
 */
function doesPlayerRuleAge(player, ageIndex, allPlayers) {
  const playerScore = player.scoreTrack[ageIndex];
  if (playerScore === 0) return false;

  const numPlayers = allPlayers.length;

  // Logic for 3 or fewer players
  if (numPlayers <= 3) {
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.id !== player.id) {
        if (otherPlayer.scoreTrack[ageIndex] >= playerScore) {
          return false;
        }
      }
    }
    return true;
  }

  // Logic for 4 or 5 players
  const scores = allPlayers.map((p) =>
    p.scoreTrack[ageIndex]).sort((a, b) => b - a);
  const firstPlaceScore = scores[0];
  const secondPlaceScore = scores[1];
  const thirdPlaceScore = scores[2];

  // Case 1: Player is in 1st place (or tied for 1st)
  if (playerScore === firstPlaceScore) {
    // If there's a 3-way (or more) tie for first, no one rules.
    // Otherwise (clear 1st or 2-way tie for 1st), the player rules.
    return firstPlaceScore > thirdPlaceScore;
  }

  // Case 2: Player is in 2nd place (or tied for 2nd)
  if (playerScore === secondPlaceScore) {
    // To rule from 2nd, there must be a clear 1st place AND a clear 2nd place.
    return firstPlaceScore > secondPlaceScore &&
      secondPlaceScore > thirdPlaceScore;
  }

  // Player is not in 1st or 2nd, so they cannot rule.
  return false;
}
exports.doesPlayerRuleAge = doesPlayerRuleAge;

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array<any>} array The array to shuffle.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Internal helper for gainMoney to avoid circular dependencies.
 * It handles the logic of changing a player's coin count and logging it.
 * @param {object} player The player object to modify.
 * @param {number} amount The amount of money to give (can be negative).
 * @param {object} lobbyData The current lobby data.
 * @param {object|string} [source=null] The source of the money change for
 * logging purposes.
 */
function _gainMoney(player, amount, lobbyData, source = null) {
  if (amount === 0) return;

  let moneyGained = Number(amount);
  // player cannot lose more money than they have
  if (player.coins < (0 - moneyGained)) moneyGained = (0 - player.coins);
  player.coins += moneyGained;
  if (moneyGained > 0) player.moneyGainedThisTurn += moneyGained;
  if (moneyGained !== 0) {
    const messageParts = [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: ` ${amount >= 0 ? "gained" : "spent"} `},
      {type: "coin", value: Math.abs(moneyGained)},
    ];

    if (source) {
      messageParts.push({type: "text", value: " ("});
      if (source.type && source.name) { // It's a card or zone object
        const isCard = ["M", "P", "S"].includes(source.type);
        if (isCard) {
          messageParts.push({type: "card", value: source.name,
            cardType: source.type});
        } else { // It's a zone
          messageParts.push({type: "zone", value: source.name,
            color: source.color || source.type});
        }
      } else { // It's just a string
        messageParts.push({type: "text", value: source});
      }
      messageParts.push({type: "text", value: ")"});
    }

    messageParts.push({type: "text", value: "."});
    logMessage(lobbyData, messageParts);
  }
}

/**
 * Draws a specified number of cards from the deck
 * and adds them to a player's hand.
 * @param {object} player The player object to receive the cards.
 * @param {Array<object>} hand The player's hand array to add cards to.
 * @param {number} count The number of cards to draw.
 * @param {object} lobbyData The current lobby data.
 * @param {object|string} [source=null] The source of the draw action.
 */
exports.drawCards = function(player, hand, count, lobbyData, source = null) { // eslint-disable-line max-len
  // If there's a face-up card, it's no longer face-up once drawing starts.
  if (lobbyData.topCard) {
    lobbyData.topCard = null;
  }

  let cardsDrawn = 0; // eslint-disable-line no-unused-vars

  for (let i = 0; i < count; i++) {
    if (lobbyData.deck.length === 0) {
      if (lobbyData.discardPile && lobbyData.discardPile.length > 0) {
        logMessage(lobbyData,
            "Deck is empty. Reshuffling the discard pile.", "system");
        shuffle(lobbyData.discardPile);
        lobbyData.deck = lobbyData.discardPile;
        lobbyData.discardPile = [];
      } else {
        logMessage(lobbyData,
            `Cannot draw card, no cards in deck or discard pile.`, "warn");
        break; // Stop trying to draw if there are no cards left anywhere.
      }
    }
    const card = lobbyData.deck.shift();
    hand.push(card);
    cardsDrawn++; // eslint-disable-line no-unused-vars
  }

  if (cardsDrawn > 0) {
    const messageParts = [
      {type: "player", value: player.name, color: player.color}, {
        type: "text",
        value: ` drew ${count > 1 ? count : "a"} card${count > 1 ? "s" : ""}`,
      },
    ];
    if (source) {
      messageParts.push({type: "text", value: " ("});
      if (source.type && source.name) {
        const isCard = ["M", "P"].includes(source.type);
        if (isCard) {
          messageParts.push({type: "card", value: source.name,
            cardType: source.type});
        } else { // It's a zone
          messageParts.push({type: "zone", value: source.name,
            color: source.type});
        }
      } else { // It's a string
        messageParts.push({type: "text", value: source});
      }
      messageParts.push({type: "text", value: ")"});
    }
    messageParts.push({type: "text", value: "."});
    logMessage(lobbyData, messageParts);

    player.handCount = hand.length;

    if (player.perpetuals && player.perpetuals.draw && cardsDrawn > 0) {
      const explorerCount = player.perpetuals.draw
          .filter((c) => c.id === "explorer").length;
      _gainMoney(player, cardsDrawn * explorerCount, lobbyData,
          {name: "Explorer", type: "P"});
    }
  }
};

/**
 * Moves a card from a player's hand to the discard pile.
 * @param {object} player The player object.
 * @param {Array<object>} hand The player's hand array.
 * @param {number} cardIndex The index of the card in the hand.
 * @param {object} lobbyData The lobby data object.
 * @param {object|string} [source=null] The source of the discard action.
 */
exports.discardCard = function(player, hand, cardIndex, lobbyData,
    source = null) {
  if (!lobbyData.discardPile) {
    lobbyData.discardPile = [];
  }
  if (hand && hand[cardIndex]) {
    const card = hand.splice(cardIndex, 1)[0];
    lobbyData.discardPile.push(card);
    console.log(card);
    const messageParts = [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " discarded "},
      {type: "card", value: card.name, cardType: card.type},
    ];
    if (source) {
      messageParts.push({type: "text", value: " ("});
      if (source.type && source.name) {
        const sourceType = (source.type === "M" || source.type === "P") ?
          "card" : "zone";
        const logPart = {type: sourceType, value: source.name,
          cardType: source.type};
        if (sourceType === "zone") {
          logPart.color = source.type;
        }
        messageParts.push(logPart);
      } else {
        messageParts.push({type: "text", value: source});
      }
      messageParts.push({type: "text", value: ")"});
    }
    messageParts.push({type: "text", value: "."});
    logMessage(lobbyData, messageParts);

    if (player.perpetuals && player.perpetuals.discard) {
      const thinkTankCount = player.perpetuals.discard
          .filter((c) => c.id === "think-tank").length;
      _gainMoney(player, thinkTankCount, lobbyData,
          {name: "Think Tank", type: "P"});
    }
  }
};

exports.getAgeIndexFromPlayerZone = getAgeIndexFromPlayerZone;
exports.advanceSpecificCrown = function(player, ageIndex, lobbyData,
    source = null ) {
  if (ageIndex === 3) return false;

  player.crowns -= 1;
  player.scoreTrack[ageIndex] -= 1;
  player.scoreTrack[ageIndex + 1] += 1;


  if (source) {
    const messageParts = [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " advanced a "},
      {type: "crown"},
    ];
    messageParts.push({type: "text", value: " ("});
    if (source.type && source.name) {
      const sourceType = (source.type === "M" || source.type === "P") ?
        "card" : "zone";
      const logPart = {type: sourceType, value: source.name,
        cardType: source.type};
      if (sourceType === "zone") {
        logPart.color = source.type;
      }
      messageParts.push(logPart);
    } else {
      messageParts.push({type: "text", value: source});
    }
    messageParts.push({type: "text", value: ")."});
    logMessage(lobbyData, messageParts);
  }

  // Check for Prime Real Estate
  if (ageIndex === 2) { // Advanced from Age III to Age IV
    if (player.perpetuals && player.perpetuals.advance) {
      const primeRealEstateCount = player.perpetuals.advance
          .filter((c) => c.id === "prime-real-estate").length;
      _gainMoney(player, primeRealEstateCount, lobbyData,
          {name: "Prime Real Estate", type: "P"});
    }
  }
};

exports.retreatSpecificCrown = function(player, ageIndex, lobbyData,
    source = null ) {
  if (ageIndex === 0) return false;

  player.scoreTrack[ageIndex] -= 1;
  player.scoreTrack[ageIndex - 1] += 1;


  if (source) {
    const messageParts = [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " retreated a "},
      {type: "crown"},
    ];
    messageParts.push({type: "text", value: " ("});
    if (source.type && source.name) {
      const sourceType = (source.type === "M" || source.type === "P") ?
        "card" : "zone";
      const logPart = {type: sourceType, value: source.name,
        cardType: source.type};
      if (sourceType === "zone") {
        logPart.color = source.type;
      }
      messageParts.push(logPart);
    } else {
      messageParts.push({type: "text", value: source});
    }
    messageParts.push({type: "text", value: ")."});
    logMessage(lobbyData, messageParts);
  }
};

/**
 * Steals a specified amount of money from a player, respecting Utopia's
 * protection, and returns the amount stolen.
 * @param {object} player The player object to steal from.
 * @param {number} amount The maximum amount of money to steal (a positive
 * number).
 * @param {object} lobbyData The current lobby data.
 * @param {object|string} [source=null] The source of the money loss for
 * logging.
 * @return {number} The actual amount of money stolen.
 */
exports.stealMoney = function(player, amount, lobbyData, source = null) {
  // Utopia protection: If the player is in Utopia and it's not their turn,
  // they cannot have money stolen.
  if (lobbyData.zones[player.zone]?.id === "utopia" && !player.turn) {
    logMessage(lobbyData, [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " is protected from theft by "},
      {type: "zone", value: "Utopia", color: "silver"},
      {type: "text", value: "."},
    ]);
    return 0;
  }

  // Determine the actual amount that can be stolen (cannot be more than the
  // player has).
  const actualStolen = Math.min(player.coins, amount);
  if (actualStolen === 0) return 0;

  if (amount === 0) return;

  player.coins -= actualStolen;

  const messageParts = [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: ` lost `},
    {type: "coin", value: actualStolen},
  ];

  if (source) {
    messageParts.push({type: "text", value: " ("});
    if (source.type && source.name) { // It's a card or zone object
      const isCard = ["M", "P", "S"].includes(source.type);
      if (isCard) {
        messageParts.push({type: "card", value: source.name,
          cardType: source.type});
      } else { // It's a zone
        messageParts.push({type: "zone", value: source.name,
          color: source.type});
      }
    } else { // It's just a string
      messageParts.push({type: "text", value: source});
    }
    messageParts.push({type: "text", value: ")"});
  }

  messageParts.push({type: "text", value: "."});
  logMessage(lobbyData, messageParts);

  // Return the positive amount that was successfully stolen.
  return actualStolen;
};

exports.moveToZone = function(player, zoneIndex, lobbyData, source = null ) {
  const oldZone = lobbyData.zones[player.zone];
  player.zone = zoneIndex;
  const newZone = lobbyData.zones[zoneIndex];

  // Check for Byzantium and Vikings
  // When you move here, gain $1 per card in your hand.
  // When you move from here to a Time you rule, gain $4.
  if (oldZone !== newZone) {
    if (newZone.id === "byzantine-empire") {
      _gainMoney(player, player.handCount,
          lobbyData, {name: "Byzantine Empire", type: "green"});
    }
    if (oldZone.id === "viking-america") {
      if (doesPlayerRuleAge(player,
          getAgeIndexFromPlayerZone(zoneIndex), lobbyData.players)) {
        _gainMoney(player, 4, lobbyData,
            {name: "Viking America", type: "green"});
      }
    }
  }

  if (source) {
    const messageParts = [
      {type: "player", value: player.name, color: player.color},
      {type: "text", value: " moved to "},
      {type: "zone", value: newZone.name, color: newZone.color},
      {type: "text", value: " from "},
      {type: "zone", value: oldZone.name, color: oldZone.color},
      {type: "text", value: " ("},
    ];
    const isCard = ["M", "P", "S"].includes(source.type);
    if (isCard) {
      messageParts.push({type: "card", value: source.name,
        cardType: source.type});
    } else if (source.type && source.name) { // It's a zone
      messageParts.push({type: "zone", value: source.name,
        color: source.type});
    } else { // It's just a string
      messageParts.push({type: "text", value: source});
    }
    messageParts.push({type: "text", value: ")."});
    logMessage(lobbyData, messageParts);
  }
};

/**
 * Gives a specified amount of money to a player.
 * @param {object} player The player object to receive the money.
 * @param {number} amount The amount of money to give.
 * @param {object} lobbyData The current lobby data.
 * @param {object|string} [source=null] The source of the money change.
 */
exports.gainMoney = _gainMoney;

/**
 * Calculates the number of ages a player rules.
 * @param {object} player The player to check.
 * @param {Array} allPlayers The array of all players in the game.
 * @return {number} The number of ages the player rules.
 */
exports.timesRuled = function(player, allPlayers) {
  let ruledCount = 0;
  for (let i = 0; i < 4; i++) {
    if (exports.doesPlayerRuleAge(player, i, allPlayers)) {
      ruledCount++;
    }
  }
  return ruledCount;
};

/**
 * Checks number of other players in the same zone as target player.
 * @param {object} player The player to check.
 * @param {Array} allPlayers The array of all players in the game.
 * @return {number} Number of other players in the same zone as target player.
 */
exports.crowdedness = function(player, allPlayers) {
  let crowdedness = 0;
  for (const otherPlayer of allPlayers) {
    if (otherPlayer.id !== player.id) {
      if (otherPlayer.zone === player.zone) crowdedness += 1;
    }
  }
  return crowdedness;
};
