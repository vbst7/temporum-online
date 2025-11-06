// functions/utils/game.js

const baseCards = require("../data/cards.json");
const alternateCards = require("../data/alternate-cards.json");
const specialCardsData = require("../data/special-cards.json");
const baseZones = require("../data/zones.json");

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array<any>} array The array to shuffle.
 * @return {Array<any>} The shuffled array.
 */
function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

/**
 * Gives a specified amount of money to a player.
 * @param {object} player The player object to modify.
 * @param {number} amount The amount of money to give.
 */
function gainMoney(player, amount) {
  player.coins = (player.coins || 0) + Number(amount);
  if (player.coins < 0) {
    player.coins = 0;
  }
}

/**
 * Draws a card from the deck and adds it to a player's hand.
 * @param {object} player The player object to receive the card.
 * @param {Array<object>} deck The array of cards representing the deck.
 * @param {Array<object>} discardPile The array of cards in the discard pile.
 * @return {object|null} The card that was drawn.
 */
function drawCard(player, deck, discardPile) {
  if (deck.length === 0) {
    if (discardPile.length > 0) {
      // Reshuffle the discard pile into the deck
      deck.push(...shuffle(discardPile));
      discardPile.length = 0; // Clear the discard pile
    }
  }

  const card = deck.shift();
  if (card) {
    player.hand.push(card);
  }
  return card;
}

/**
 * Initializes the game state.
 * @param {Array<object>} playersArray An array of player objects.
 * @param {Array<string>} selectedZones An array of zone names selected in the
 * lobby.
 * @param {object} testConfig Optional configuration for testing.
 * @param {object} initialCards Optional map of player IDs to initial card
 * names.
 * @param {boolean} alternateRealities Whether to include
 * Alternate Realities cards names.
 * @return {object} The initial game state.
 */
function initializeGame(
    playersArray,
    selectedZones,
    testConfig = {},
    initialCards = {},
    alternateRealities = false,
) {
  // 1. Load and prepare cards
  const mainDeckCardsData = [...(baseCards.default || baseCards)];
  if (alternateRealities) {
    const altCards = alternateCards.default || alternateCards;
    mainDeckCardsData.push(...altCards);
  }
  const allCards = [...mainDeckCardsData, ...specialCardsData];

  let deck;

  // If a specific deck is provided for testing, use it. Otherwise, create and
  // shuffle a standard deck.
  if (testConfig.deck) {
    deck = testConfig.deck.map((cardName, index) => {
      const cardTemplate = allCards.find((c) => c.name === cardName);
      return {
        ...cardTemplate, instanceId: `${cardTemplate.id}-test-${index}`,
      };
    });
  } else {
    const deckContents = [];
    mainDeckCardsData.forEach((card) => {
      deckContents.push({...card, instanceId: `${card.id}-1`});
      deckContents.push({...card, instanceId: `${card.id}-2`});
    });
    deck = shuffle(deckContents);
  }

  // 2. Randomize player order and initialize player state
  // Only shuffle player order for non-test games for deterministic tests.
  // If it's a test, don't shuffle.
  const shuffledPlayers = (testConfig && Object.keys(testConfig).length > 0) ?
    [...playersArray] :
    shuffle([...playersArray]);
  const players = shuffledPlayers.map((player) => ({
    ...player,
    hand: [],
    handCount: 2,
    coins: 0,
    crowns: 0,
    scoreTrack: [10, 0, 0, 0],
    zone: 7, // Starting zone
    turn: false,
    active: false,
    prompt: "",
    cardsInPlay: [],
    GOP: false,
    gizmoCount: 0,
    tradeGoodsCount: 0,
    newRevolutionaries: false,
    visitedZones: [],
    perpetuals: {
      play: [],
      score: [],
      draw: [],
      postPlay: [],
      postScore: [],
      turnEnd: [],
      discard: [],
      gain: [],
      visit: [],
      postVisit: [],
      advance: [],
    },
    // Assign the script from the testConfig.
    script: testConfig.aiScripts?.[player.id] || [],
  }));

  // 3. Deal initial cards
  players.forEach((player) => {
    if (testConfig.initialHands && testConfig.initialHands[player.id]) {
      player.hand = [];
      const desiredCards = testConfig.initialHands[player.id];
      desiredCards.forEach((cardInfo) => {
        const deckIndex = deck.findIndex((c) => c.id === cardInfo.id);
        if (deckIndex > -1) { // NOSONAR
          const [dealtCard] = deck.splice(deckIndex, 1);
          player.hand.push(dealtCard);
        } else {
          // Card not in deck, check special cards (like Gizmo)
          const specialCardTemplate = specialCardsData.find((c) =>
            c.id === cardInfo.id);
          if (specialCardTemplate) {
            player.hand.push({...specialCardTemplate,
              instanceId: `${specialCardTemplate.id}-test-${Math.random()}`});
          } else {
            player.hand.push({
              ...cardInfo, instanceId: `${cardInfo.id}-test-${Math.random()}`,
            });
          }
        }
      });
    } else {
      const initialCardName = initialCards?.[player.id];
      if (initialCardName) {
        const card = allCards.find((c) =>
          c.name.toLowerCase() === initialCardName.toLowerCase());
        const deckIndex = card ? deck.findIndex((c) => c.id === card.id) : -1;
        if (deckIndex > -1) {
          const [dealtCard] = deck.splice(deckIndex, 1);
          player.hand.push(dealtCard);
        }
      }
      // Draw cards until the player has 2.
      while (player.hand.length < 2) {
        drawCard(player, deck, []);
      }
    }
  });

  // 4. Set starting money
  const moneyDistribution = [0, 4, 3, 2, 2];
  players.forEach((player, index) => {
    if (index > 0) { // Player 1 starts with 0
      gainMoney(player, moneyDistribution[index] || 0);
      if (index > 1) gainMoney(players[index], moneyDistribution[index-1]);
    }
  });

  // Apply test-specific overrides
  if (testConfig.initialCoins) {
    players.forEach((p) => {
      if (testConfig.initialCoins[p.id] !== undefined) {
        p.coins = testConfig.initialCoins[p.id];
      }
    });
  }
  if (testConfig.initialScoreTrack) {
    players.forEach((p) => {
      if (testConfig.initialScoreTrack[p.id]) {
        p.scoreTrack = [...testConfig.initialScoreTrack[p.id]];
      }
    });
  }
  if (testConfig.initialZones) {
    players.forEach((p) => {
      if (testConfig.initialZones[p.id] !== undefined) {
        p.zone = testConfig.initialZones[p.id];
      } else {
        p.zone = 7; // Default starting zone
      }
    });
  }
  if (testConfig.initialScoreTrack) {
    players.forEach((p) => {
      if (testConfig.initialScoreTrack[p.id]) {
        p.scoreTrack = [...testConfig.initialScoreTrack[p.id]];
      }
    });
  }
  if (testConfig.initialPerpetuals) {
    players.forEach((p) => {
      if (testConfig.initialPerpetuals[p.id]) {
        for (const trigger in testConfig.initialPerpetuals[p.id]) {
          if (p.perpetuals[trigger]) {
            p.perpetuals[trigger]
                .push(...testConfig.initialPerpetuals[p.id][trigger]);
          }
        }
      }
    });
  }
  if (testConfig.initialHQs) {
    players.forEach((p) => {
      if (testConfig.initialHQs[p.id] !== undefined) {
        p.hq = testConfig.initialHQs[p.id];
      }
    });
  }
  if (testConfig.initialBases) {
    players.forEach((p) => {
      if (testConfig.initialBases[p.id] !== undefined) {
        p.bases = testConfig.initialBases[p.id];
      }
    });
  }

  // 5. Set up zones
  const allZonesData = JSON.parse(JSON
      .stringify(baseZones.default || baseZones));
  if (alternateRealities) {
    const alternateZones =
      require("../data/alternate-zones.json");
    const altZonesData =
      JSON.parse(JSON.stringify(alternateZones.default || alternateZones));
    altZonesData.forEach((ageGroup, ageIndex) => {
      if (allZonesData[ageIndex]) {
        allZonesData[ageIndex]
            .push(...ageGroup);
      }
    });
  }
  const allZonesByAge = allZonesData;
  const allZonesFlat = allZonesByAge.flat();
  const zonePools = allZonesByAge.map((ageGroup) => [...ageGroup]);

  selectedZones.forEach((zoneName) => {
    if (zoneName) {
      const zoneObject = allZonesFlat.find((z) => z.name === zoneName);
      if (zoneObject) {
        const ageIndex = parseInt(zoneObject.age) - 1;
        const poolIndex = zonePools[ageIndex]
            .findIndex((z) => z.name === zoneName);
        if (poolIndex > -1) {
          zonePools[ageIndex].splice(poolIndex, 1);
        }
      }
    }
  });

  const isTest = Object.keys(testConfig).length > 0;
  const defaultTestZones = [
    "Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery",
    "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire",
    "Floating Cities", "Robot Uprising",
  ];

  const finalZones = [];
  let cursor = 0;
  [1, 2, 3, 4].forEach((count, ageIndex) => {
    for (let i = 0; i < count; i++) {
      let selectedName = selectedZones[cursor];

      // If it's a test and the zone is empty, use the default.
      if (isTest && !selectedName) {
        selectedName = defaultTestZones[cursor];
      }

      if (selectedName) {
        const preselectedZone = allZonesFlat.find((z) =>
          z.name === selectedName);
        finalZones.push(preselectedZone || {});
      } else {
        const pool = zonePools[ageIndex];
        const randomIndex = Math.floor(Math.random() * pool.length);
        finalZones.push(pool.splice(randomIndex, 1)[0] || {});
      }
      cursor++;
    }
  });

  // Conditionally create special card piles based on zones in play
  const gizmoPile = [];
  if (finalZones.some((z) => z.id === "scientist-enclave" ||
    z.id === "zombie-apocalypse")) {
    const gizmoCardTemplate = specialCardsData.find((c) => c.id === "gizmo");
    if (gizmoCardTemplate) {
      for (let i = 0; i < 8; i++) {
        gizmoPile.push({...gizmoCardTemplate, instanceId: `gizmo-${i}`});
      }
    }
  }

  const tradeGoodsPile = [];
  if (finalZones.some((z) => z.id === "ancient-carthage" ||
    z.id === "endless-city")) {
    const tradeGoodsCardTemplate = specialCardsData.find((c) =>
      c.id === "trade-goods");
    if (tradeGoodsCardTemplate) {
      for (let i = 0; i < 8; i++) {
        tradeGoodsPile.push({...tradeGoodsCardTemplate,
          instanceId: `trade-goods-${i}`});
      }
    }
  }

  if (finalZones[0].id === "primitive-paradise") {
    finalZones.forEach((zone) => zone.has_coin = true);
  }

  // Handle test-specific zone configurations
  if (testConfig.simulatedParadiseZoneId) {
    const spZone = finalZones.find((z) => z.id === "simulated-paradise");
    if (spZone) {
      const zoneToSimulate = allZonesFlat
          .find((z) => z.id === testConfig.simulatedParadiseZoneId);
      if (zoneToSimulate) {
        spZone.simulatedZoneId = zoneToSimulate.id;
      }
    }
  }

  // Set initial hourglass for specific zones at game start
  const hourglassZones = ["celtic-paradise", "neolithic-renaissance",
    "babylonian-bazaar", "y2k", "cultural-revolution", "three-kingdoms"];
  finalZones.filter((z) => hourglassZones.includes(z.id)).forEach((z) => {
    z.hourglass = players.length;
  });

  // Handle test-specific hourglass configurations
  if (testConfig.initialHourglass) {
    finalZones.forEach((zone) => {
      if (testConfig.initialHourglass[zone.id] !== undefined) {
        zone.hourglass = testConfig.initialHourglass[zone.id];
      }
    });
  }

  // 6. Finalize player colors
  const allColors = ["red", "green", "white", "pink", "yellow"];
  let availableColors = [...allColors];
  const usedColors = new Set(
      players.filter((p) => p.color !== "grey").map((p) => p.color),
  );
  availableColors = availableColors.filter((c) => !usedColors.has(c));

  players.forEach((player) => {
    if (player.color === "grey") {
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      player.color = availableColors.splice(randomIndex, 1)[0] || "red";
    }
  });

  return {
    deck,
    gizmoPile,
    tradeGoodsPile,
    players,
    zones: finalZones,
    arrows: [false, true, true, false, false, false],
    realZones: [0, 1, 4, 7],
    legalZones: [0, 1, 4, 7],
  };
}

module.exports = {
  initializeGame,
  shuffle,
  gainMoney,
  drawCard,
};
