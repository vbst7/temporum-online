// /home/valerie-brown/Documents/Temporum/temporum-online/src/tests/cardTests.js

// This file contains automated tests for individual cards.

export const cardTests = [
  // --- Anubis Statuette ---
  {
    testName: "AI plays Anubis, then visits Steampunk Empire",
    testId: "AnubisStatuette_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "visitZone", zoneIndex: 7 },
        { type: "discardAndContinue", cardIndex: 0 },
        ...Array(3).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [7, 3, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI plays Anubis, then triggers Investments",
    testId: "AnubisStatuette_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { turnEnd: [{ id: "investments", name: "Investments" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "visitZone", zoneIndex: 5 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveInvestments", choice: true },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 18 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Gizmo ---
  {
    testName: "Gizmo: P1 plays Gizmo then Artist twice",
    testId: "Gizmo_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Police State", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "gizmo", name: "Gizmo" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }, // Play Gizmo
        { type: "resolveGizmoChoice", cardIndex: 0 }, // Choose Artist
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 }, // 8 from first play, 8 from second
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // Drew 2 cards
        ]
      },
    },
  },
  {
    testName: "Gizmo: P1 plays Gizmo -> Trinket -> Artist (x2)",
    testId: "Gizmo_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Police State", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "gizmo", name: "Gizmo" }, { id: "trinket", name: "Trinket" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }, // Play Gizmo
        { type: "resolveGizmoChoice", cardIndex: 0 }, // Choose Trinket
        { type: "playCard", cardIndex: 0 }, // Trinket plays Artist
        { type: "playCard", cardIndex: 0 }, // Second Trinket plays second Artist
      ]},
      endCondition: { type: "playerCoins", playerId: "ai_1", operator: "===", value: 24 }, // 4(Trinket) + 8(Artist) + 4(Trinket) + 8(Artist)
    },
  },
  {
    testName: "Gizmo: P1 plays Gizmo -> Anubis Statuette (x2)",
    testId: "Gizmo_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "gizmo", name: "Gizmo" }, { id: "anubis-statuette", name: "Anubis Statuette" }] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }, // Play Gizmo
        { type: "resolveGizmoChoice", cardIndex: 0 }, // Choose Anubis
        { type: "post-visit-choice", choiceId: "anubis-ai_1-0" },
        { type: "visitZone", zoneIndex: 1 }, // Anubis visit 1
        { type: "visitZone", zoneIndex: 1 }, // Anubis visit 2
      ]},
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 }, // 2 from first Crusades, 2 from second
    },
  },
  // --- Artist ---
  {
    testName: "AI plays Artist",
    testId: "Artist_2", // Artist_1 is an existing test
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Bag of Loot ---
  {
    testName: "AI plays Bag of Loot",
    testId: "BagOfLoot_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "bag-of-loot", name: "Bag of Loot" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 7 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "bag-of-loot" },
        ]
      },
    },
  },
  // --- Barbarian Horde ---
  {
    testName: "AI plays Barbarian Horde (no discard)",
    testId: "BarbarianHorde_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "barbarian-horde", name: "Barbarian Horde" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [] }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 9 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Barbarian Horde (no discard, with other cards)",
    testId: "BarbarianHorde_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "barbarian-horde", name: "Barbarian Horde" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [] }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 9 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  {
    testName: "AI plays Barbarian Horde (discards 1)",
    testId: "BarbarianHorde_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "barbarian-horde", name: "Barbarian Horde" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [0] }, { type: "advanceCrown", ageIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 9 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
  // --- Black Market ---
  {
    testName: "AI plays Black Market",
    testId: "BlackMarket_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "black-market", name: "Black Market" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 7 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "black-market", exists: true },
        ]
      },
    },
  },
  // --- Conspiracy ---
  {
    testName: "AI plays Conspiracy",
    testId: "Conspiracy_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "conspiracy", exists: true },
        ]
      },
    },
  },
  // --- Crown Jewels ---
  {
    testName: "AI plays Crown Jewels (no discard)",
    testId: "CrownJewels_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "crown-jewels", name: "Crown Jewels" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [] }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 11 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Crown Jewels (no discard, with other cards)",
    testId: "CrownJewels_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "crown-jewels", name: "Crown Jewels" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [] }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 11 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  {
    testName: "AI plays Crown Jewels (discards 1)",
    testId: "CrownJewels_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "crown-jewels", name: "Crown Jewels" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [0] }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 15 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Engineer ---
  {
    testName: "AI plays Engineer (no other cards)",
    testId: "Engineer_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "engineer", name: "Engineer" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Engineer (with other cards)",
    testId: "Engineer_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "engineer", name: "Engineer" }, { id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "discardMany", discardArray: [0, 1] }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Explorer ---
  {
    testName: "AI plays Explorer",
    testId: "Explorer_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "explorer", name: "Explorer" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 6 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "explorer", exists: true },
        ]
      },
    },
  },
  // --- Friends in Old Places ---
  {
    testName: "AI plays Friends in Old Places",
    testId: "FriendsInOldPlaces_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "friends-in-old-places", name: "Friends in Old Places" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 6 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "friends-in-old-places", exists: true },
        ]
      },
    },
  },
  // --- Gang of Pickpockets ---
  {
    testName: "AI plays Gang of Pickpockets",
    testId: "GangOfPickpockets_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "gang-of-pickpockets", name: "Gang of Pickpockets" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "gang-of-pickpockets", exists: true },
        ]
      },
    },
  },
  // --- Gladiator's Gladius ---
  {
    testName: "AI plays Gladiator's Gladius",
    testId: "GladiatorsGladius_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "gladiators-gladius", name: "Gladiator's Gladius" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Golden Goose ---
  {
    testName: "AI plays Golden Goose",
    testId: "GoldenGoose_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 5 },
        ]
      },
    },
  },
  // --- Infected Rat ---
  {
    testName: "AI plays Infected Rat (P2 discards)",
    testId: "InfectedRat_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "infected-rat", name: "Infected Rat" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }], "ai_2": [{ type: "discardAndContinue", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Infected Rat (P1 has more cards)",
    testId: "InfectedRat_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "infected-rat", name: "Infected Rat" }, { id: "trinket", name: "Trinket" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 1 },
        ]
      },
    },
  },
  {
    testName: "AI plays Infected Rat (P2 in Utopia)",
    testId: "InfectedRat_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "infected-rat", name: "Infected Rat" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_2": 7 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Inventor ---
  {
    testName: "AI plays Inventor (chooses draw)",
    testId: "Inventor_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "inventor", name: "Inventor" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveInventor", choice: "draw" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI plays Inventor (chooses coins)",
    testId: "Inventor_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "inventor", name: "Inventor" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveInventor", choice: "gain" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Inventor (chooses advance)",
    testId: "Inventor_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "inventor", name: "Inventor" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveInventor", choice: "advance" }, { type: "advanceCrown", ageIndex: 0 }, { type: "advanceCrown", ageIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [8, 2, 0, 0] },
        ]
      },
    },
  },
  // --- Investments ---
  {
    testName: "AI plays Investments",
    testId: "Investments_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "investments", name: "Investments" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveInvestments", choice:false }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "investments", exists: true },
        ]
      },
    },
  },
  // --- Kill Your Grandfather ---
  {
    testName: "AI plays Kill Your Grandfather (1 card)",
    testId: "KillYourGrandfather_2", // KYG_1 exists
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "kill-your-grandfather", name: "Kill Your Grandfather" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 5 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI plays Kill Your Grandfather (2 cards)",
    testId: "KillYourGrandfather_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "kill-your-grandfather", name: "Kill Your Grandfather" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 5 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- King's Sword ---
  {
    testName: "AI plays King's Sword",
    testId: "KingsSword_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "kings-sword", name: "King's Sword" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "advanceCrown", ageIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Mayan Ritual Knife ---
  {
    testName: "AI plays Mayan Ritual Knife",
    testId: "MayanRitualKnife_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "mayan-ritual-knife", name: "Mayan Ritual Knife" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Papal Tiara ---
  {
    testName: "AI plays Papal Tiara (no scoreable cards)",
    testId: "PapalTiara_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "papal-tiara", name: "Papal Tiara" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Papal Tiara (scores Artist)",
    testId: "PapalTiara_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "papal-tiara", name: "Papal Tiara" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "scoreCard", cardIndex: 0 }, ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI plays Papal Tiara (cannot afford to score)",
    testId: "PapalTiara_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "papal-tiara", name: "Papal Tiara" }, { id: "tulip-stocks", name: "Tulip Stocks" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Predict the Future ---
  {
    testName: "AI plays Predict the Future",
    testId: "PredictTheFuture_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "predict-the-future", name: "Predict the Future" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: 'resolvePredictTheFuture',  choice:true}] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Prime Real Estate ---
  {
    testName: "AI plays Prime Real Estate",
    testId: "PrimeRealEstate_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "prime-real-estate", name: "Prime Real Estate" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 7 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "prime-real-estate", exists: true },
        ]
      },
    },
  },
  // --- Secret Society ---
  {
    testName: "AI plays Secret Society",
    testId: "SecretSociety_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "secret-society", name: "Secret Society" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "secret-society", exists: true },
        ]
      },
    },
  },
  // --- Settlers ---
  {
    testName: "AI plays Settlers",
    testId: "Settlers_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "settlers", name: "Settlers" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "advanceCrown", ageIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Shogun's Katana ---
  {
    testName: "AI plays Shogun's Katana (ruling 2 ages)",
    testId: "ShogunsKatana_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "shoguns-katana", name: "Shogun's Katana" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 14 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Step on a Butterfly ---
  {
    testName: "AI plays Step on a Butterfly",
    testId: "StepOnAButterfly_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Think Tank ---
  {
    testName: "AI plays Think Tank",
    testId: "ThinkTank_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "think-tank", name: "Think Tank" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 11 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "think-tank", exists: true },
        ]
      },
    },
  },
  // --- Treasure Map ---
  {
    testName: "AI plays Treasure Map",
    testId: "TreasureMap_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "treasure-map", name: "Treasure Map" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 6 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "treasure-map", exists: true },
        ]
      },
    },
  },
  // --- Trinket ---
  {
    testName: "AI plays Trinket then Artist",
    testId: "Trinket_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "trinket", name: "Trinket" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  {
    testName: "AI plays Trinket (no other cards)",
    testId: "Trinket_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "trinket", name: "Trinket" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Tulip Stocks ---
  {
    testName: "AI plays Tulip Stocks",
    testId: "TulipStocks_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "tulip-stocks", name: "Tulip Stocks" }] },
      initialCoins: { "ai_1": 0, "ai_2": 5 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 9 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI plays Tulip Stocks (P2 in Utopia)",
    testId: "TulipStocks_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "tulip-stocks", name: "Tulip Stocks" }] },
      initialCoins: { "ai_1": 0, "ai_2": 5 },
      initialZones: { "ai_2": 7 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 9 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 5 },
        ]
      },
    },
  },
  // --- Golden Apple ---
  {
    testName: "Golden Apple: P1 plays, P2 moves to P1's zone",
    testId: "GoldenApple_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-apple", name: "Golden Apple" }] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_2": 0 }, // P2 starts in a different zone
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 }, // P1 visits Cold War
        { type: "playCard", cardIndex: 0 },   // P1 plays Golden Apple
      ]
      }
    }
  },
  // --- Meet Younger Self ---
  {
    testName: "AI plays Meet Younger Self",
    testId: "MeetYoungerSelf_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "meet-younger-self", name: "Meet Younger Self" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
        ]
      },
    },
  },
  {
    testName: "AI scores Meet Younger Self",
    testId: "MeetYoungerSelf_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "meet-younger-self", name: "Meet Younger Self" }] },
      initialCoins: { "ai_1": 12 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(5).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
        ]
      },
    },
  },
  // --- Visionary ---
  {
    testName: "AI plays Visionary then Artist",
    testId: "Visionary_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "visionary", name: "Visionary" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "advanceCrown", ageIndex: 0 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI scores Visionary then Artist",
    testId: "Visionary_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "visionary", name: "Visionary" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 32 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 }, // Score Visionary
        ...Array(8).fill({ type: "advanceCrown", ageIndex: 0 }),
        { type: "scoreCard", cardIndex: 0 }, // Score Artist
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 1 }),
      ]},
      endCondition: {
        type: "playerScoreTrack", playerId: "ai_1", value: [2, 4, 4, 0]
      },
    },
  },
  {
    testName: "AI plays Visionary then Artist with Black Market",
    testId: "Visionary_BM",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "visionary", name: "Visionary" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialPerpetuals: { "ai_1": { play: [{ id: "black-market", name: "Black Market" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "advanceCrown", ageIndex: 0 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },  {
    testName: "AI plays Visionary then Artist with GoP",
    testId: "Visionary_GoP",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "visionary", name: "Visionary" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialPerpetuals: { "ai_1": { postPlay: [{ id: "gang-of-pickpockets", name: "Gang of Pickpockets" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "advanceCrown", ageIndex: 0 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI scores Meet Younger Self in Age of Cats",
    testId: "MeetYoungerSelf_AoC",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "meet-younger-self", name: "Meet Younger Self" }] },
      initialCoins: { "ai_1": 34 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "resolveOptionalZone", choice: true, zoneId: "cats" },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(10).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // Draws 2 cards (1 * 2)
          { type: "playerScoreTrack", playerId: "ai_1", value: [0, 10, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI scores Visionary in Age of Cats, then Artist twice",
    testId: "Visionary_AoC",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [
        { id: "visionary", name: "Visionary" },
        { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }
      ]},
      initialCoins: { "ai_1": 74 }, // 10 for Cats, 56 for Visionary, 4 for Artist, 4 for Artist
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "resolveOptionalZone", choice: true, zoneId: "cats" },
        { type: "scoreCard", cardIndex: 0 }, // Score Visionary
        ...Array(10).fill({ type: "advanceCrown", ageIndex: 0 }), // 16 crowns
        ...Array(6).fill({ type: "advanceCrown", ageIndex: 1 }), // 16 crowns
        { type: "scoreCard", cardIndex: 0 }, // Score first Artist
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 1 }),
        { type: "scoreCard", cardIndex: 0 }, // Score second Artist
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 2 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [0, 0, 6, 4] },
        ]
      },
    },
  },
  // --- Pilgrims ---
  {
    testName: "AI plays Pilgrims and scores Golden Goose",
    testId: "Pilgrims_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "pilgrims", name: "Pilgrims" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 8 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }, // Play Pilgrims
        { type: "scoreCard", cardIndex: 0 }, // Score Golden Goose
        ...Array(6).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [4, 6, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI plays Pilgrims and scores Artist",
    testId: "Pilgrims_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "pilgrims", name: "Pilgrims" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }, // Play Pilgrims
        { type: "scoreCard", cardIndex: 0 }, // Score Artist
        ...Array(2).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [8, 2, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI plays Pilgrims and scores Golden Goose with Conspiracy",
    testId: "Pilgrims_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "pilgrims", name: "Pilgrims" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 8 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialPerpetuals: { "ai_1": { score: [{ id: "conspiracy", name: "Conspiracy" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }, // Play Pilgrims
        { type: "scoreCard", cardIndex: 0 }, // Score Golden Goose
        ...Array(7).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [3, 7, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Secret Society: Scrapyard World",
    testId: "Perpetual_SecretSociety_Scrapyard",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Scrapyard World", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "conspiracy", name: "Conspiracy" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 }, // Score Artist
        { type: "discardMany", discardArray: [0] }, // Discard Conspiracy
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 }, // 1 from Secret Society
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Secret Society: Floating Cities",
    testId: "Perpetual_SecretSociety_FloatingCities",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Floating Cities", "Steampunk Empire", "Robot Uprising"],
      initialHands: { "ai_1": [
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }
      ]},
      initialCoins: { "ai_1": 4 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 6 }, // 5 left, -1 played, +1 drawn, +1 SS
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Secret Society: Alien Contact",
    testId: "Perpetual_SecretSociety_AlienContact",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Alien Contact", "Floating Cities", "Robot Uprising"],
      deck: ["Artist"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 4 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 }, // 1 from Secret Society
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Secret Society: Space Age",
    testId: "Perpetual_SecretSociety_SpaceAge",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Space Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 8 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // 1 from each score
          { type: "playerScoreTrack", playerId: "ai_1", value: [2, 8, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Secret Society: Imperial China",
    testId: "Perpetual_SecretSociety_ImperialChina",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Imperial China", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "choose", choice: "score" },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(8).fill({ type: "advanceCrown", ageIndex: 0 }),
        { type: "resolveDiscardForMoney", cardIndex: null , sourceZoneId: "imperial-china"},
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 }, //  1 from SS
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
]

export const perpetualTests = [
  {
    testName: "AI visits Age of Cybernetics and replays FioP",
    testId: "AgeOfCybernetics_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Cybernetics", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { score: [{ id: "friends-in-old-places", name: "Friends in Old Places" }] } },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "selectCyberneticsPerpetual", perpetualCardId: "friends-in-old-places" }, { type: "selectCyberneticsHandCard", handCardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "friends-in-old-places", count: 2 },
        ]
      },
    },
  },
  // --- Black Market ---
  {
    testName: "Perpetual - Black Market: P1 plays Artist in Cold War, ends with $10",
    testId: "Perpetual_BlackMarket_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { play: [{ id: "black-market", name: "Black Market" }] } },
      initialZones: { "ai_1": 7 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 }, // 8 from Artist, 2 from Black Market
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 }, // Drew 1 from Artist
        ]
      },
    },
  },
  // --- Conspiracy ---
  {
    testName: "Perpetual - Conspiracy: P1 scores Artist in Ice Age, advances 5 crowns",
    testId: "Perpetual_Conspiracy_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialPerpetuals: { "ai_1": { score: [{ id: "conspiracy", name: "Conspiracy" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(5).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] }, // 4 from Artist, 1 from Conspiracy
        ]
      },
    },
  },
  // --- Explorer ---
  {
    testName: "Perpetual - Explorer: P1 visits Crusades (alone), gains $2",
    testId: "Perpetual_Explorer_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialCoins: { "ai_1": 0 },
      initialHands: { "ai_1": [] },
      initialPerpetuals: { "ai_1": { draw: [{ id: "explorer", name: "Explorer" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 }, // 2 from Explorer
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // 2 from Crusades
        ]
      },
    },
  },
  // --- Friends in Old Places ---
  {
    testName: "Perpetual - Friends in Old Places: P1 has $2 and scores Artist in Ice Age",
    testId: "Perpetual_FioP_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 2 },
      initialPerpetuals: { "ai_1": { score: [{ id: "friends-in-old-places", name: "Friends in Old Places" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Age of Cats with FioP",
    testId: "Perpetual_FioP_Cats",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 18 },
      initialPerpetuals: { "ai_1": { score: [{ id: "friends-in-old-places", name: "Friends in Old Places" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "resolveOptionalZone", choice: true, zoneId: "cats" },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(8).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [2, 8, 0, 0] },
        ]
      },
    },
  },
  // --- Gang of Pickpockets ---
  {
    testName: "Perpetual - Gang of Pickpockets: P1 plays Artist in Cold War, ends with 2 cards",
    testId: "Perpetual_GoP_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { postPlay: [{ id: "gang-of-pickpockets", name: "Gang of Pickpockets" }] } },
      initialZones: { "ai_1": 7 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // 1 from Artist, 1 from GoP
        ]
      },
    },
  },
  // --- Investments ---
  {
    testName: "Perpetual - Investments: P1 plays Artist in Cold War, discards Investments, ends with $12",
    testId: "Perpetual_Investments_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { turnEnd: [{ id: "investments", name: "Investments" }] } },
      initialZones: { "ai_1": 7 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveInvestments", choice: true },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 }, // 8 from Artist, 4 from Investments
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "investments", exists: false },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Investments: P1 plays Artist in Cold War, declines to discard, ends with $8",
    testId: "Perpetual_Investments_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { turnEnd: [{ id: "investments", name: "Investments" }] } },
      initialZones: { "ai_1": 7 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveInvestments", choice: false },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "investments", exists: true },
        ]
      },
    },
  },
  // --- Prime Real Estate ---
  {
    testName: "Perpetual - Prime Real Estate: P1 scores Artist in Ancient Egypt, gains $4",
    testId: "Perpetual_PRE_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialPerpetuals: { "ai_1": { advance: [{ id: "prime-real-estate", name: "Prime Real Estate" }] } },
      initialScoreTrack: { "ai_1": [0, 0, 10, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 2 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 }, // 4 start - 4 cost + 4 from PRE
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [0, 0, 6, 4] },
        ]
      },
    },
  },
  // --- Secret Society ---
  {
    testName: "Perpetual - Secret Society: P1 scores Artist in Ancient Egypt, ends with 1 card",
    testId: "Perpetual_SecretSociety_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 }, // 1 from Secret Society
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Perpetual - Secret Society: P1 scores Artist in Ancient Egypt, ends with 2 cards",
    testId: "Perpetual_SecretSociety_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" },{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Age of Cats with Secret Society",
    testId: "Perpetual_SecretSociety_Cats",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 18 },
      initialPerpetuals: { "ai_1": { postScore: [{ id: "secret-society", name: "Secret Society" }] } },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "resolveOptionalZone", choice: true, zoneId: "cats" },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(8).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [2, 8, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Maneuver + Treasure Map",
    testId: "Maneuver_TreasureMap",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Communist Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "maneuver", name: "Maneuver" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 0, 0, 10] },
      initialPerpetuals: { "ai_1": { postVisit: [{ id: "treasure-map", name: "Treasure Map" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit Communist Utopia
        { type: "playCard", cardIndex: 0 },   // Play Maneuver
        { type: "post-visit-choice", choiceId: "maneuver-ai_1-0" }, // Choose Maneuver first
        { type: "move", zoneIndex: 0 },   // Move to Ancient Egypt
        { type: "resolveTreasureMap", choice: true }, // Resolve Treasure Map
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 }, // 8 from Maneuver + 4 from TMap
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // 2 from TMap
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "treasure-map", exists: false }, // TMap is gone
          { type: "playerZone", playerId: "ai_1", operator: "===", value: 0 }, // Moved to Ancient Egypt
        ]
      },
    },
  },
  {
    testName: "Perpetual - University: P1 visits Info Age, discards, scores",
    testId: "Perpetual_University_InfoAge",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Information Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }, { id: "conspiracy", name: "Conspiracy" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [4, 4, 0, 2] },
      initialPerpetuals: { "ai_1": { postVisit: [{ id: "university", name: "University" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit Info Age
        { type: "visitZone", zoneIndex: 1 }, // Visit Crusades (from Info Age)
        { type: "discardAndContinue", cardIndex: 2 }, // Discard Conspiracy for University
        { type: "scoreCard", cardIndex: 0 }, // Score Artist
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "discardPileContains", cardId: "conspiracy"
      },
    },
  }
]
