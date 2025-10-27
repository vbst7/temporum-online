// /home/valerie-brown/Documents/Temporum/temporum-online/src/tests/testDefinitions.js

// This file contains all available automated tests.
import { cardTests, perpetualTests } from './cardTests.js';
// The testSuite.js file selects which of these tests to run.

export const allTests = [];

// --- Age III Zone Tests ---
const age3Tests = [
  {
    testName: "AI plays Artist in Cold War",
    testId: "Artist_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  {
    testName: "AI plays KYG in Cold War",
    testId: "KillYourGrandfather_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "kill-your-grandfather", name: "Kill Your Grandfather" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 5 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Age of Discovery ---
  {
    testName: "AI plays Artist in Age of Discovery",
    testId: "AgeOfDiscovery_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [7, 0, 3, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 3 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 11 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Balloon Revolution ---
  {
    testName: "AI plays Artist in Balloon Revolution",
    testId: "BalloonRevolution_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Balloon Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_2": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- American Civil War ---
  {
    testName: "AI plays Artist in American Civil War",
    testId: "AmericanCivilWar_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "American Civil War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Rules 2 times
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Plutocracy ---
  {
    testName: "AI plays Artist in Plutocracy (has more money)",
    testId: "Plutocracy_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Plutocracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 5 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 },
          { type: "advanceCrown", ageIndex: 0 }] },
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
    testName: "AI plays Artist in Plutocracy (has less money)",
    testId: "Plutocracy_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Plutocracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 10 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  // --- Prohibition Era ---
  {
    testName: "AI plays Artist in Prohibition Era (ruling)",
    testId: "ProhibitionEra_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Prohibition Era", "Age of Plastic", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 , "ai_2": 0},
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] }, // Rules Age III
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
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
    testName: "AI plays Artist in Prohibition Era (P2 rules)",
    testId: "ProhibitionEra_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Prohibition Era", "Age of Plastic", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0},
      initialScoreTrack: { "ai_2": [9, 0, 1, 0] }, // P2 Rules Age III
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 1 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Bureaucracy ---
  {
    testName: "AI plays Artist in Bureaucracy (P2 retreats)",
    testId: "Bureaucracy_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Bureaucracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 12 },
      initialScoreTrack: { "ai_2": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }]
        , "ai_2": [{ type: "retreatCrown", ageIndex: 2 }]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_2", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI plays Artist in Bureaucracy (P2 not enough money)",
    testId: "Bureaucracy_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Bureaucracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 11 },
      initialScoreTrack: { "ai_2": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] 
        , "ai_2": [{ type: "retreatCrown", ageIndex: 2 }]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_2", value: [9, 0, 1, 0] },
        ]
      },
    },
  },
  {
    testName: "AI plays Artist in Bureaucracy (P2 cannot retreat)",
    testId: "Bureaucracy_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Bureaucracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 12 },
      initialScoreTrack: { "ai_2": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }]
        , "ai_2": [{ type: "retreatCrown", ageIndex: 2 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_2", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  // --- French Revolution ---
  {
    testName: "AI plays Artist in French Revolution (ruling)",
    testId: "FrenchRevolution_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "French Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },

  {
    testName: "AI plays nothing in French Revolution (ruling)",
    testId: "FrenchRevolution_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "French Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Atomic Age ---
  {
    testName: "AI plays Artist in Atomic Age (ruling)",
    testId: "AtomicAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Atomic Age", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] }, // Rules Age III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "move", zoneIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          {type: "playerZone", playerId: "ai_1", operator: "===", value: 0}
        ]
      },
    },
  },
  // --- Industrial Revolution ---
  {
    testName: "AI plays Artist in Industrial Revolution (ruling, accepts)",
    testId: "IndustrialRevolution_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Industrial Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveOptionalZone", choice: true, zoneId: "industrial-revolution" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI plays Artist in Industrial Revolution (ruling, rejects)",
    testId: "IndustrialRevolution_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Industrial Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveOptionalZone", choice: false, zoneId: "industrial-revolution" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  {
    testName: "AI plays Black Market in Industrial Revolution (ruling, accepts)",
    testId: "IndustrialRevolution_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Industrial Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "black-market", name: "Black Market" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveOptionalZone", choice: true, zoneId: "industrial-revolution" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 7 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "black-market", exists: false },
        ]
      },
    },
  },
  {
    testName: "AI plays Black Market in Industrial Revolution (ruling, rejects)",
    testId: "IndustrialRevolution_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Industrial Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "black-market", name: "Black Market" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }, { type: "resolveOptionalZone", choice: false, zoneId: "industrial-revolution" }] },
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
  // --- Dutch Golden Age ---
  {
    testName: "Dutch Golden Age: P1 plays card (ruling)",
    testId: "DutchGoldenAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Dutch Golden Age", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 18 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Dutch Golden Age: P1 plays card (ruling, Primitive Paradise)",
    testId: "DutchGoldenAge_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Primitive Paradise", "Roman Empire", "Bright Ages", "Age of Discovery", "Dutch Golden Age", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 21 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Pax Britannica ---
  {
    testName: "Pax Britannica: P1 plays card (0 crowns in IV)",
    testId: "PaxBritannica_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Pax Britannica", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 }
      ]},
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
    testName: "Pax Britannica: P1 plays card (1 crown in IV)",
    testId: "PaxBritannica_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Pax Britannica", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [7, 2, 1, 1] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Pax Britannica: P1 plays card (2 crowns in IV)",
    testId: "PaxBritannica_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Pax Britannica", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [2, 2, 4, 2] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: { type: "playerCoins", playerId: "ai_1", operator: "===", value: 20 },
    },
  },
  // --- Age of Piracy ---
  {
    testName: "Age of Piracy: P1 rules, steals $2 from P2",
    testId: "AgeOfPiracy_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Piracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialCoins: { "ai_1": 0, "ai_2": 2 },
      initialZones: { "ai_2": 1 }, // P2 in Time II
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] }, // P1 rules Age III
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 },{ type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Age of Piracy: P1 rules, P2 has no money",
    testId: "AgeOfPiracy_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Piracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      initialZones: { "ai_2": 1 }, // P2 in Time II
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] }, // P1 rules Age III
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 },{ type: "playCard", cardIndex: 0 }] },
      endCondition: { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
    },
  },
  {
    testName: "Age of Piracy: P1 does not rule, steals nothing",
    testId: "AgeOfPiracy_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Piracy", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialCoins: { "ai_1": 0, "ai_2": 2 },
      initialZones: { "ai_2": 1 }, // P2 in Time II
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 },{ type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  //Age of Plastic
  {
    testName: "Age of Plastic: Rules both, chooses gain",
    testId: "AgeOfPlastic_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 1, 9, 0] }, // Rules Age II and III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveOptionalZone", choice: "gain", zoneId: "age-of-plastic" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Age of Plastic: Rules both, chooses draw",
    testId: "AgeOfPlastic_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 1, 9, 0] }, // Rules Age II and III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveOptionalZone", choice: "draw", zoneId: "age-of-plastic" },
      ]},
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
    testName: "Age of Plastic: Rules only Time II, chooses draw",
    testId: "AgeOfPlastic_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 10, 0, 0] }, // Rules only Age II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveOptionalZone", choice: "draw", zoneId: "age-of-plastic" },
      ]},
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
    testName: "Age of Plastic: Rules only Time II, chooses decline",
    testId: "AgeOfPlastic_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 10, 0, 0] }, // Rules only Age II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveOptionalZone", choice: "decline", zoneId: "age-of-plastic" },
      ]},
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
    testName: "Age of Plastic: Rules only Time III, chooses gain",
    testId: "AgeOfPlastic_5",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 0, 10, 0] }, // Rules only Age III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveOptionalZone", choice: "gain", zoneId: "age-of-plastic" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Age of Plastic: Rules only Time III, chooses decline",
    testId: "AgeOfPlastic_6",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 0, 10, 0] }, // Rules only Age III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveOptionalZone", choice: "decline", zoneId: "age-of-plastic" },
      ]},
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
    testName: "Age of Plastic: Rules neither",
    testId: "AgeOfPlastic_7",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Plastic", "Age of Discovery", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] }, // Rules neither II nor III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 3 },
        { type: "playCard", cardIndex: 0 },
        // No choice prompt, so no script action
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Y2K ---
  {
    testName: "Y2K: P1 discards, P2 declines",
    testId: "Y2K_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Y2K", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "y2k": 1 },
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "black-market", name: "Black Market" }], "ai_2": [{ id: "black-market", name: "Black Market" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 4 },
          { type: "playCard", cardIndex: 0 },
          { type: "resolveY2KDiscard", cardIndex: 0 },
        ],
        "ai_2": [{ type: "resolveY2KDiscard", cardIndex: null }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 20 }, // 8 from Artist + 12 from Y2K
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 }, // Drew 1 from Artist, discarded 1
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 1 },
          { type: "zoneHourglass", zoneId: "y2k", value: 2 },
        ]
      },
    },
  },
  {
    testName: "Y2K: P1 has no cards, P2 discards",
    testId: "Y2K_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Y2K", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "y2k": 1 },
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }], "ai_2": [{ id: "black-market", name: "Black Market" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }],
        "ai_2": [{ type: "resolveY2KDiscard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "zoneHourglass", zoneId: "y2k", value: 2 },
        ]
      },
    },
  },
  {
    testName: "Y2K: P1 has no perpetuals, P2 discards",
    testId: "Y2K_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Y2K", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "y2k": 1 },
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" },{ id: "artist", name: "Artist" }], "ai_2": [{ id: "black-market", name: "Black Market" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }],
        "ai_2": [{ type: "resolveY2KDiscard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "zoneHourglass", zoneId: "y2k", value: 2 },
        ]
      },
    },
  },
];

// --- Age II Zone Tests ---
const age2Tests = [

  {
    testName: "Scientist Enclave: P1 has no crowns in Age II, draws 2 cards",
    testId: "ScientistEnclave_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Scientist Enclave", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] }, // No crowns in Age II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
      ]},
      endCondition: {
        type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2
      },
    },
  },
  {
    testName: "Scientist Enclave: P1 has crown, chooses to take Gizmo",
    testId: "ScientistEnclave_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Scientist Enclave", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Has a crown in Age II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "resolveOptionalZone", choice: true, zoneId: "scientist-enclave" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "gizmo" },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] }, // Crown retreated
        ]
      },
    },
  },
  {
    testName: "Scientist Enclave: P1 has crown, chooses to draw 2 cards",
    testId: "ScientistEnclave_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Scientist Enclave", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Has a crown in Age II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "resolveOptionalZone", choice: false, zoneId: "scientist-enclave" },
      ]},
      endCondition: {
        type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2
      },
    },
  },
  {
    testName: "AI draws in Roman Empire and loses coins (not ruling)",
    testId: "RomanEmpire_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 2 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI draws in Roman Empire and gains coins (ruling)",
    testId: "RomanEmpire_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 2 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Give 1 crown in Age II to rule
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          // Starts with 2, rules and gains 2 -> ends with 4
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          // Draws 2 cards
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Ancient Carthage ---
  {
    testName: "Ancient Carthage: P1 visits, gets Trade Goods",
    testId: "AncientCarthage_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Ancient Carthage", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "trade-goods" },
        ]
      },
    },
  },
  // --- Dark Ages ---
  {
    testName: "Dark Ages: P1 draws",
    testId: "DarkAges_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Dark Ages", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_1": 1 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  {
    testName: "Dark Ages: P1 discards then draws",
    testId: "DarkAges_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Dark Ages", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "discardAndContinue", cardIndex: 0 },
        { type: "visitZone", zoneIndex: 1 }
      ]},
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  // --- Amazons ---
  {
    testName: "Amazons: P1 visits (ruling)",
    testId: "Amazons_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Empire of the Amazons", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  // --- Mongolian Empire ---
  {
    testName: "Mongolian Empire: P2 discards",
    testId: "MongolianEmpire_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Mongolian Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 1 }],
        "ai_2": [{ type: "discardAndContinue", cardIndex: 0 }],
      },
      endCondition: { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 2 },
    },
  },
  {
    testName: "Mongolian Empire: P2 has too few cards to discard",
    testId: "MongolianEmpire_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Mongolian Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 2 },
    },
  },
  {
    testName: "Mongolian Empire: P2 is safe in Utopia",
    testId: "MongolianEmpire_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Mongolian Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      initialZones: { "ai_2": 7 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 3 },
    },
  },
  // --- Pax Buddha ---
  {
    testName: "AI visits Pax Buddha and chooses to score",
    testId: "PaxBuddha_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Pax Buddha", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 1 },
          { type: "choose", choice: "score" },
          { type: "scoreCard", cardIndex: 0 },
          ...Array(8).fill({ type: "advanceCrown", ageIndex: 0 })
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 3 },
        ]
      },
    },
  },
  {
    testName: "AI visits Pax Buddha and chooses to play",
    testId: "PaxBuddha_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Pax Buddha", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "choose", choice: "play" },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 36 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 3 },
        ]
      },
    },
  },
  {
    testName: "AI visits Pax Buddha and chooses to draw",
    testId: "PaxBuddha_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Pax Buddha", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", "name": "Trinket" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "choose", choice: "draw" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 3 },
        ]
      },
    },
  },
  // --- Renaissance ---
  {
    testName: "AI visits Renaissance (not ruling)",
    testId: "Renaissance_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  {
    testName: "AI visits Renaissance (ruling)",
    testId: "Renaissance_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Renaissance", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 },
    },
  },
  // --- Feudal Japan ---
  {
    testName: "AI visits Feudal Japan (not ruling)",
    testId: "FeudalJapan_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Feudal Japan", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  {
    testName: "AI visits Feudal Japan (ruling, declines discard)",
    testId: "FeudalJapan_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Feudal Japan", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "resolveOptionalZone", choice: false, zoneId: "feudal-japan" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "golden-goose" },
        ]
      },
    },
  },
  {
    testName: "AI visits Feudal Japan (ruling, accepts discard)",
    testId: "FeudalJapan_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Feudal Japan", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "resolveOptionalZone", choice: true, zoneId: "feudal-japan" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "discardPileCount", operator: "===", value: 3 },
        ]
      },
    },
  },
  // --- Celtic Paradise ---
  {
    testName: "Celtic Paradise: P1 visits, hourglass decrements",
    testId: "CelticParadise_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Celtic Paradise", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "zoneHourglass", zoneId: "celtic-paradise", value: 1 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Celtic Paradise: P1 visits, hourglass resets, players gain money",
    testId: "CelticParadise_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Celtic Paradise", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "celtic-paradise": 1 },
      initialCoins: { "ai_1": 0, "ai_2": 8 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "zoneHourglass", zoneId: "celtic-paradise", value: 2 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 8 },
        ]
      },
    },
  },
  // --- Byzantine Empire ---
  {
    testName: "Byzantine Empire: P1 visits with 2 cards",
    testId: "ByzantineEmpire_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Byzantine Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 },
        ]
      },
    },
  },
  {
    testName: "Byzantine Empire: P1 moves there from Atomic Age",
    testId: "ByzantineEmpire_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Byzantine Empire", "Bright Ages", "Atomic Age", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] }, // Rules Age III
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 3 }, { type: "playCard", cardIndex: 0 }, { type: "move", zoneIndex: 1 }] },
      endCondition: {
        type: "playerCoins", playerId: "ai_1", operator: "===", value: 9 // 8 from Artist, 1 from moving to Byzantine
      },
    },
  },
  // --- Imperial China ---
  {
    testName: "AI visits Imperial China and chooses to score",
    testId: "ImperialChina_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Imperial China", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 1 },
          { type: "choose", choice: "score" },
          { type: "scoreCard", cardIndex: 0 },
          ...Array(8).fill({ type: "advanceCrown", ageIndex: 0 })
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Imperial China and chooses to play",
    testId: "ImperialChina_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Imperial China", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "choose", choice: "play" },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 36 },
        ]
      },
    },
  },
  {
    testName: "AI visits Imperial China, draws, and declines discard",
    testId: "ImperialChina_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Imperial China", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "choose", choice: "draw" },
        { type: "resolveDiscardForMoney", cardIndex: null , sourceZoneId: "imperial-china"},
      ]},
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  {
    testName: "AI visits Imperial China, draws, and discards",
    testId: "ImperialChina_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Imperial China", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 1 },
        { type: "choose", choice: "draw" },
        { type: "resolveDiscardForMoney", cardIndex: 0 , sourceZoneId: "imperial-china"},
      ]},
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
    },
  },
  // --- Age of Cults ---
  {
    testName: "AI visits Age of Cults, cards are passed",
    testId: "AgeOfCults_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Age of Cults", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 1 },
          { type: "passCard", cardIndex: 0 },
        ],
        "ai_2": [{ type: "passCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "artist" },
          { type: "playerHandContains", playerId: "ai_2", cardId: "golden-goose" },
        ]
      },
    },
  },

  {
    testName: "AI visits Age of Cults, P2 has no cards, so no cards are passed",
    testId: "AgeOfCults_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Age of Cults", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 1 },
          { type: "passCard", cardIndex: 0 },
        ],
        "ai_2": [{ type: "passCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "golden-goose" },
        ]
      },
    },
  },
  // --- Crusades ---
  {
    testName: "AI visits Crusades, no players in Time I",
    testId: "Crusades_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialZones: { "ai_1": 7 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 20 },
        ]
      },
    },
  },
  {
    testName: "AI visits Crusades, P1 is in Time I",
    testId: "Crusades_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialZones: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "declineChangeHistory" },
        { type: "visitZone", zoneIndex: 1 }
      ] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 20 },
        ]
      },
    },
  },
  {
    testName: "AI visits Crusades, P2 is in Time I",
    testId: "Crusades_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialZones: { "ai_2": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 22 },
        ]
      },
    },
  },
  // --- Plague ---
  {
    testName: "AI visits Plague, P2 in Time III discards",
    testId: "Plague_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Plague", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialZones: { "ai_2": 4 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 1 }],
        "ai_2": [{ type: "discardAndContinue", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "discardPileContains", cardId: "artist" },
        ]
      },
    },
  },
  {
    testName: "AI visits Plague, P2 in Time I discards",
    testId: "Plague_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Plague", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialZones: { "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 1 }],
        "ai_2": [{ type: "discardAndContinue", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "discardPileContains", cardId: "artist" },
        ]
      },
    },
  },
  {
    testName: "AI visits Plague, P2 in Time III has no cards",
    testId: "Plague_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Plague", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialZones: { "ai_2": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
    },
  },
  {
    testName: "AI visits Plague, P2 in Time IV is safe",
    testId: "Plague_4",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Plague", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialZones: { "ai_2": 7 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 1 },
    },
  },
  // --- Holy Norse Empire ---
  {
    testName: "AI visits Holy Norse Empire (ruling)",
    testId: "HolyNorseEmpire_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Holy Norse Empire", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 23 },
        ]
      },
    },
  },
  {
    testName: "AI visits Holy Norse Empire (not ruling)",
    testId: "HolyNorseEmpire_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Holy Norse Empire", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 20 },
        ]
      },
    },
  },
  // --- Inquisition ---
  {
    testName: "AI visits Inquisition (not ruling)",
    testId: "Inquisition_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Inquisition", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "discardPileCount", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Inquisition (ruling, P2 discards)",
    testId: "Inquisition_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Inquisition", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 1 }],
        "ai_2": [{ type: "resolveInquisition", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 10 },
        ]
      },
    },
  },
  {
    testName: "AI visits Inquisition (ruling, P2 loses coins)",
    testId: "Inquisition_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Inquisition", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 1 }],
        "ai_2": [{ type: "resolveInquisition", cardIndex: null }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 1 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 8 },
        ]
      },
    },
  },
  {
    testName: "AI visits Inquisition (ruling, P2 has no cards, chooses discard)",
    testId: "Inquisition_4",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Inquisition", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }], "ai_2": [] },
      initialCoins: { "ai_1": 20, "ai_2": 10 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 1 }],
        "ai_2": [{ type: "resolveInquisition", cardIndex: -1 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 10 },
        ]
      },
    },
  },
  // --- Aztec Invasion ---
  {
    testName: "AI visits Aztec Invasion (no crowns in Age II)",
    testId: "AztecInvasion_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Aztec Invasion", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
    {
    testName: "AI visits Aztec Invasion (has crown in Age II)",
    testId: "AztecInvasion_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Aztec Invasion", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
  // --- Egyptian America ---
  {
    testName: "AI visits Egyptian America (ruling Age II)",
    testId: "EgyptianAmerica_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Egyptian America", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 0, 1, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Egyptian America (not ruling Age II)",
    testId: "EgyptianAmerica_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Egyptian America", "Bright Ages", "Age of Discovery", "Steampunk Empire", "Prohibition Era", "Age of Cats", "Age of Plastic", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 20 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  // --- Greek America ---
  {
    testName: "Greek America: P1 rules, places base, discards for $6",
    testId: "GreekAmerica_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Greek America", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Rules Age II
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 1 },
          { type: "resolveOptionalZone", choice: true, zoneId: "greek-america-base-choice" },
          { type: "resolveDiscardForMoney", cardIndex: 0, sourceZoneId: "greek-america" },
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 6 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "Greek America: P1 doesn't rule, has preset base, discards for $6",
    testId: "GreekAmerica_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Greek America", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] }, // Does not rule Age II
      initialBases: { "ai_1": [1] }, // Base is pre-set
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 1 },
          // No prompt to place base
          { type: "resolveDiscardForMoney", cardIndex: 0, sourceZoneId: "greek-america" },
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 6 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Trade Goods ---
  {
    testName: "Trade Goods: P1 plays, chooses to gain $8",
    testId: "TradeGoods_Gain_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Police State", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "trade-goods", name: "Trade Goods" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveTradeGoods", choice: "gain" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Trade Goods: P1 plays, chooses to draw 2 cards",
    testId: "TradeGoods_Draw_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Police State", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "trade-goods", name: "Trade Goods" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveTradeGoods", choice: "draw" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "Trade Goods: P1 plays, chooses to draw 1 card & gain $4",
    testId: "TradeGoods_DrawGain_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Police State", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "trade-goods", name: "Trade Goods" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "resolveTradeGoods", choice: "draw-gain" },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Viking America ---
  {
    testName: "Viking America: P1 moves to ruling zone",
    testId: "VikingAmerica_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Viking America", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_1": 1 }, // Start in Viking America
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] }, // Rules Age III
      aiScripts: { "ai_1": [{ type: "declineChangeHistory" }, { type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "conspiracy", exists: true },
        ]
      },
    },
  },
  {
    testName: "Viking America: P1 moves to non-ruling zone",
    testId: "VikingAmerica_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Viking America", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "conspiracy", name: "Conspiracy" }] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_1": 1 }, // Start in Viking America
      aiScripts: { "ai_1": [{ type: "declineChangeHistory" }, { type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "conspiracy", exists: true },
        ]
      },
    },
  },
  {
    testName: "Viking America: P1 moves to same zone",
    testId: "VikingAmerica_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Viking America", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialZones: { "ai_1": 1 }, // Start in Viking America
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Rules Age II
      aiScripts: { "ai_1": [{ type: "declineChangeHistory" }, { type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 // No bonus for moving to same zone
      },
    },
  },
];

// --- Age I Zone Tests ---

const age1Tests = [
  // --- Stone Age ---
  {
    testName: "AI scores in Stone Age",
    testId: "StoneAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Stone Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
        ]
      },
    },
  },
  // --- Ancient Egypt ---
  {
    testName: "AI scores in Ancient Egypt (ruling)",
    testId: "AncientEgypt_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Ancient Egypt with no cards",
    testId: "AncientEgypt_scoreNoCards",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 10 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Ice Age ---
  {
    testName: "AI scores in Ice Age, affecting P2",
    testId: "IceAge_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ice Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4, "ai_2": 6 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialZones: { "ai_2": 1 }, // P2 in Time II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 3 },
        ]
      },
    },
  },
  // --- Time of Legends ---
  {
    testName: "AI scores in Time of Legends",
    testId: "TimeOfLegends_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Time of Legends", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(5).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Iron Age ---
  {
    testName: "AI scores in Iron Age",
    testId: "IronAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Iron Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 2 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Trojan War ---
  {
    testName: "AI scores in Trojan War",
    testId: "TrojanWar_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Trojan War", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 6 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },{
    testName: "AI tries to score in Trojan War",
    testId: "TrojanWar_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Trojan War", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 3 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 0 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Dawn of Man: P1 scores, P2 crown moves", // From alternate-zones
    testId: "DawnOfMan_1", // From alternate-zones
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Dawn of Man", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0], "ai_2": [9, 1, 0, 0] },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 0 },
          { type: "scoreCard", cardIndex: 0 },
          ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
          { type: "playerScoreTrack", playerId: "ai_2", value: [8, 2, 0, 0] },
        ]
      },
    },
  },
  // --- Age of Atlantis (HQ Tests) ---
  {
    testName: "Age of Atlantis: P1 visits HQ in French Revolution (ruling)",
    testId: "AgeOfAtlantis_HQ_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "French Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      initialHQs: { "ai_1": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 }, // 8 from Artist + 2 from HQ
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // 1 from Artist + 1 from zone
        ]
      },
    },
  },
  {
    testName: "Age of Atlantis: P1 visits French Revolution, P2 has HQ there",
    testId: "AgeOfAtlantis_HQ_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "French Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      initialHQs: { "ai_2": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 }, // 8 from Artist, no HQ bonus
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "Age of Atlantis: HQ visuals",
    testId: "AgeOfAtlantis_HQ_3",
    aiPlayerCount: 5,
    testConfig: {
      selectedZones: ["Age of Atlantis", "Roman Empire", "Bright Ages", "Age of Discovery", "French Revolution", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      initialHQs: { "ai_1": 7, "ai_2": 7, "ai_3": 7, "ai_4": 7, "ai_5": 7 },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 }, 
        ]
      },
    },
  },
  {
    testName: "Age of Atlantis: HQ + Base visuals",
    testId: "HQ_Base",
    aiPlayerCount: 5,
    testConfig: {
      selectedZones: ["Age of Atlantis", "Greek America", "", "", "French Revolution", "", "", "", "", ""],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 1, 0] },
      initialHQs: { "ai_1": 4, "ai_2": 1, "ai_3": 1, "ai_4": 1, "ai_5": 1 },
      initialBases: { "ai_1": [1], "ai_2": [1], "ai_3": [1], "ai_4": [1], "ai_5": [1] },
      initialZones: { "ai_1": 4, "ai_2": 1, "ai_3": 1, "ai_4": 1, "ai_5": 1 },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 }, 
        ]
      },
    },
  },
  // --- Babylonian Bazaar ---
  {
    testName: "Babylonian Bazaar: P1 no money, P2 pays",
    testId: "BabylonianBazaar_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Babylonian Bazaar", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "babylonian-bazaar": 1 },
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [] },
      initialCoins: { "ai_1": 4, "ai_2": 10 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0], "ai_2": [10, 0, 0, 0] },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 0 },
          { type: "scoreCard", cardIndex: 0 },
          ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
        ],
        "ai_2": [
          { type: "resolveBabylonianChoice", choice: true },
          { type: "advanceCrown", ageIndex: 0 },
          { type: "advanceCrown", ageIndex: 0 }
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_2", value: [8, 2, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Babylonian Bazaar: P1 no money, P2 declines",
    testId: "BabylonianBazaar_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Babylonian Bazaar", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "babylonian-bazaar": 1 },
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [] },
      initialCoins: { "ai_1": 4, "ai_2": 10 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0], "ai_2": [10, 0, 0, 0] },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 0 },
          { type: "scoreCard", cardIndex: 0 },
          ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
        ],
        "ai_2": [{ type: "resolveBabylonianChoice", choice: false }]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 10 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_2", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Babylonian Bazaar: Both players pay",
    testId: "BabylonianBazaar_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Babylonian Bazaar", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "babylonian-bazaar": 1 },
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [] },
      initialCoins: { "ai_1": 14, "ai_2": 10 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0], "ai_2": [10, 0, 0, 0] },
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 0 },
          { type: "scoreCard", cardIndex: 0 },
          ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
          { type: "resolveBabylonianChoice", choice: true },
          { type: "advanceCrown", ageIndex: 0 },
          { type: "advanceCrown", ageIndex: 0 }
        ],
        "ai_2": [
          { type: "resolveBabylonianChoice", choice: true },
          { type: "advanceCrown", ageIndex: 0 },
          { type: "advanceCrown", ageIndex: 0 }
        ]
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [4, 6, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_2", value: [8, 2, 0, 0] },
        ]
      },
    },
  },
];

// Age IV Tests
const age4Tests = [
  // --- Endless City ---
  {
    testName: "Endless City: P1 visits, gains $8 and a Trade Goods",
    testId: "EndlessCity_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Endless City", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "trade-goods" },
        ]
      },
    },
  },
  {
    testName: "Endless City: Becomes real, all draw, P1 visits",
    testId: "EndlessCity_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "", "Endless City", "Robot Uprising"],
      initialHands: { "ai_1": [], "ai_2": [] },
      initialCoins: { "ai_1": 0 },
      arrows: [false, true, true, false, false, false], // Will make zone 7 real
      initialZones: { "ai_1": 4},
      aiScripts: { "ai_1": [{ type: "changeHistory", zoneIndex: 4 }, { type: "visitZone", zoneIndex: 8 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 }, // 1 from history, 1 from visit
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 1 }, // 1 from history
        ]
      },
    },
  },
  // --- Mafia City-States ---
  {
    testName: "Mafia City-States: P1 visits, steals, scores",
    testId: "MafiaCityStates_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Mafia City-States", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4, "ai_2": 1 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "scoreCard", cardIndex: 0 }, ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Mafia City-States: Becomes real, all gain $2, P1 visits",
    testId: "MafiaCityStates_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "", "Utopia", "Mafia City-States", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4, "ai_2": 0 },
      initialZones: { "ai_1": 4},
      aiScripts: { "ai_1": [{ type: "changeHistory", zoneIndex: 4 }, { type: "visitZone", zoneIndex: 8 }, { type: "scoreCard", cardIndex: 0 }, ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Nanotech Wonderland ---
  {
    testName: "AI visits Nanotech Wonderland",
    testId: "NanotechWonderland_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Nanotech Wonderland", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 },
        ]
      },
    },
  },
  // --- Robot Uprising ---
  {
    testName: "AI visits Robot Uprising",
    testId: "RobotUprising_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Robot Uprising", "Floating Cities", "Steampunk Empire"],
      initialHands: { "ai_1": [] },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Rules 2 ages
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "advanceCrown", ageIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [8, 2, 0, 0] },
        ]
      },
    },
  },
  // --- Space Age ---
  {
    testName: "AI visits Space Age and scores twice",
    testId: "SpaceAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Space Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 8 },
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
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [2, 8, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Space Age, but cannot score twice",
    testId: "SpaceAge_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Space Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 8 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0], "ai_2": [0, 5, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Space Age, cannot afford second score",
    testId: "SpaceAge_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Space Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 6 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  // --- Utopia ---
  {
    testName: "AI visits Utopia",
    testId: "Utopia_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Age of Cats ---
  {
    testName: "AI visits Age of Cats, accepts, no coins",
    testId: "AgeOfCats_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 10 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "resolveOptionalZone", choice: true, zoneId: "cats" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Age of Cats, accepts, scores",
    testId: "AgeOfCats_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 18 },
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
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [2, 8, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "AI visits Age of Cats, accepts, cannot afford score",
    testId: "AgeOfCats_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Steampunk Empire", "Age of Cats", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 16 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "resolveOptionalZone", choice: true, zoneId: "cats" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 6 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  // --- Age of Toys ---
  {
    testName: "AI visits Age of Toys, cannot afford",
    testId: "AgeOfToys_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Toys", "Floating Cities", "Robot Uprising"],
      deck: ["Kill Your Grandfather", "Golden Goose"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Age of Toys, declines",
    testId: "AgeOfToys_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Toys", "Floating Cities", "Robot Uprising"],
      deck: ["Kill Your Grandfather", "Golden Goose"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "resolveOptionalZone", choice: false, zoneId: "toys" }] },
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
    testName: "AI visits Age of Toys, accepts, plays first card (GG)",
    testId: "AgeOfToys_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Toys", "Floating Cities", "Robot Uprising"],
      deck: ["Mayan Ritual Knife", "Golden Goose"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "resolveOptionalZone", choice: true, zoneId: "toys" }, { type: "resolveToysChoice", chosenCardIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Age of Toys, accepts, plays second card (MRK)",
    testId: "AgeOfToys_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Toys", "Floating Cities", "Robot Uprising"],
      deck: ["Mayan Ritual Knife", "Golden Goose"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "resolveOptionalZone", choice: true, zoneId: "toys" }, { type: "resolveToysChoice", chosenCardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 },
        ]
      },
    },
  },
  // --- Communist Utopia ---
  {
    testName: "AI visits Communist Utopia, plays two cards",
    testId: "CommunistUtopia_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Communist Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "tulip-stocks", name: "Tulip Stocks" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }, { type: "playCard", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 25 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Communist Utopia, plays one card",
    testId: "CommunistUtopia_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Communist Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "tulip-stocks", name: "Tulip Stocks" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 3 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }] },
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
    testName: "AI visits Communist Utopia, plays no cards",
    testId: "CommunistUtopia_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Communist Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "tulip-stocks", name: "Tulip Stocks" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 12 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI visits Communist Utopia, paradise bonus",
    testId: "CommunistUtopia_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Primitive Paradise", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Communist Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "tulip-stocks", name: "Tulip Stocks" }, { id: "golden-goose", name: "Golden Goose" }] },
      initialCoins: { "ai_1": 10 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI visits Communist Utopia, plays two Anubis, visits Crusades twice",
    testId: "CommunistUtopia_5",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Communist Utopia", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "anubis-statuette", name: "Anubis Statuette" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit Communist Utopia
        { type: "playCard", cardIndex: 0 },   // Play first Anubis
        { type: "playCard", cardIndex: 0 },   // Play second Anubis
        { type: "visitZone", zoneIndex: 1 },   // Anubis visit 1 to Crusades
        { type: "visitZone", zoneIndex: 1 },   // Anubis visit 2 to Crusades
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 }, // 2 from each Anubis
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 }, // 2 from each Crusades visit
        ]
      },
    },
  },
  // --- Nuclear Wasteland ---
  {
    testName: "AI visits Nuclear Wasteland",
    testId: "NuclearWasteland_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Nuclear Wasteland", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 0, 0, 10] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "visitZone", zoneIndex: 1 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Savagery ---
  {
    testName: "AI visits Savagery (0 cards)",
    testId: "Savagery_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Savagery", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  {
    testName: "AI visits Savagery (2 cards)",
    testId: "Savagery_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Savagery", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
    },
  },
  // --- Steampunk Empire ---
  {
    testName: "AI visits Steampunk Empire (no cards)",
    testId: "SteampunkEmpire_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
    },
  },
  {
    testName: "AI visits Steampunk Empire (discards)",
    testId: "SteampunkEmpire_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "discardAndContinue", cardIndex: 0 }, ...Array(3).fill({ type: "advanceCrown", ageIndex: 0 })] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [7, 3, 0, 0] },
        ]
      },
    },
  },
  // --- Alien Contact ---
  {
    testName: "AI visits Alien Contact, scores",
    testId: "AlienContact_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Alien Contact", "Floating Cities", "Robot Uprising"],
      deck: ["Artist"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "scoreCard", cardIndex: 0 }, ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })] },
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
    testName: "AI visits Alien Contact, cannot afford",
    testId: "AlienContact_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Alien Contact", "Floating Cities", "Robot Uprising"],
      deck: ["Artist"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 2 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "artist" },
        ]
      },
    },
  },
  {
    testName: "AI visits Alien Contact, declines",
    testId: "AlienContact_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Alien Contact", "Floating Cities", "Robot Uprising"],
      deck: ["Artist"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "resolveOptionalZone", choice: false, zoneId: "alien-contact" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "artist" },
        ]
      },
    },
  },
  // --- Age of Cybernetics ---
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
  {
    testName: "AI visits Age of Cybernetics (no hand)",
    testId: "AgeOfCybernetics_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Cybernetics", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialPerpetuals: { "ai_1": { score: [{ id: "friends-in-old-places", name: "Friends in Old Places" }] } },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
    },
  },
  {
    testName: "AI visits Age of Cybernetics (no perpetuals)",
    testId: "AgeOfCybernetics_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Cybernetics", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
        ]
      },
    },
  },
  // --- Icy Wasteland ---
  {
    testName: "AI visits Icy Wasteland, draws (ruling)",
    testId: "IcyWasteland_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Icy Wasteland", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0, "ai_2": 4 },
      initialScoreTrack: { "ai_1": [0, 0, 0, 10] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "choose", choice: "draw" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  {
    testName: "AI visits Icy Wasteland, scores (ruling)",
    testId: "IcyWasteland_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Icy Wasteland", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4, "ai_2": 4 },
      initialScoreTrack: { "ai_1": [9, 0, 0, 1] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "choose", choice: "score" }, 
        { type: "scoreCard", cardIndex: 0 }, ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Icy Wasteland, scores (ruling only after scoring)",
    testId: "IcyWasteland_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Icy Wasteland", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4, "ai_2": 4 },
      initialScoreTrack: { "ai_1": [0, 0, 10, 0]},
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "choose", choice: "score" }, 
        { type: "scoreCard", cardIndex: 0 }, ...Array(4).fill({ type: "advanceCrown", ageIndex: 2 })] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 2 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Icy Wasteland, draws (not ruling)",
    testId: "IcyWasteland_4",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Icy Wasteland", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0, "ai_2": 4 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "choose", choice: "draw" }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Underground Haven ---
  {
    testName: "Underground Haven: P1 does not rule, discards",
    testId: "UndergroundHaven_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Underground Haven", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] }, // Does not rule Age IV
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "discardAndContinue", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "sage", exists: false },
        ]
      },
    },
  },
  {
    testName: "Underground Haven: P1 rules, discards, takes Sage",
    testId: "UndergroundHaven_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Underground Haven", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 0, 0, 10] }, // Rules Age IV
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "discardAndContinue", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "sage", exists: true },
        ]
      },
    },
  },
  {
    testName: "Underground Haven: P1 rules, takes Sage from P2",
    testId: "UndergroundHaven_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Underground Haven", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 0, 0, 10] }, // P1 rules Age IV
      initialPerpetuals: { "ai_2": { visit: [{ id: "sage", name: "Sage" }] } },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "discardAndContinue", cardIndex: 0 }] },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 12 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "sage", exists: true },
          { type: "playerPerpetualsContain", playerId: "ai_2", cardId: "sage", exists: false },
        ]
      },
    },
  },
  // --- Warm Globe ---
  {
    testName: "AI visits Warm Globe, all play Artist",
    testId: "WarmGlobe_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }],
        "ai_2": [{ type: "playCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 8 },
        ]
      },
    },
  },
  {
    testName: "AI visits Warm Globe, P2 plays Anubis",
    testId: "WarmGlobe_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }],
        "ai_2": [{ type: "playCard", cardIndex: 0 }, { type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 10 },
        ]
      },
    },
  },
  {
    testName: "AI visits Warm Globe, P1 plays Infected Rat",
    testId: "WarmGlobe_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "infected-rat", name: "Infected Rat" }], "ai_2": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }],
        "ai_2": [{ type: "discardAndContinue", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Warm Globe, P2 plays Infected Rat",
    testId: "WarmGlobe_4",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [{ id: "infected-rat", name: "Infected Rat" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }, { type: "discardAndContinue", cardIndex: 0 }],
        "ai_2": [{ type: "playCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "AI visits Warm Globe, both play Anubis",
    testId: "WarmGlobe_5",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }], "ai_2": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }, { type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }],
        "ai_2": [{ type: "playCard", cardIndex: 0 }, { type: "visitZone", zoneIndex: 4 }, { type: "playCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 18 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 10 },
        ]
      },
    },
  },
  {
    testName: "AI visits Warm Globe, P2 has no cards",
    testId: "WarmGlobe_6",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 16 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Information Age ---
  {
    testName: "AI visits Information Age and scores",
    testId: "InformationAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Crusades", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Information Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [4, 4, 0, 2] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 1 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [0, 8, 0, 2] },
        ]
      },
    },
  },
  {
    testName: "AI visits Information Age after Anubis",
    testId: "InformationAge_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Information Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 4, 4, 2] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 },
        { type: "visitZone", zoneIndex: 7 },
        { type: "playCard", cardIndex: 0 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerHandContains", playerId: "ai_1", cardId: "artist" },
        ]
      },
    },
  },
  {
    testName: "AI visits Information Age and plays Settlers",
    testId: "InformationAge_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ice Age", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Information Age", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "settlers", name: "Settlers" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [0, 4, 4, 2] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "playCard", cardIndex: 0 },
        { type: "advanceCrown", ageIndex: 1 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [0, 3, 5, 2] },
        ]
      },
    },
  },
  {
    testName: "AI visits Information Age during Warm Globe",
    testId: "InformationAge_4",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ice Age", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Information Age", "Warm Globe", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }], "ai_2": [{ id: "anubis-statuette", name: "Anubis Statuette" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 0 },
      initialScoreTrack: { "ai_2": [0, 4, 4, 2] },
      aiScripts: {
        "ai_1": [{ type: "visitZone", zoneIndex: 7 }, { type: "playCard", cardIndex: 0 }], // P1 visits Warm Globe (not in test)
        "ai_2": [
          { type: "playCard", cardIndex: 0 }, // Play Anubis
          { type: "visitZone", zoneIndex: 6 }, // Anubis visit to Info Age
          { type: "playCard", cardIndex: 0 }, // Play Artist in Cold War
        ],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_2", operator: "===", value: 3 },
        ]
      },
    },
  },
  // --- Age of Superheroes ---
  {
    testName: "Age of Superheroes: P1 visits alone with 0 cards",
    testId: "AgeOfSuperheroes_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Superheroes", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 5 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerScoreTrack", playerId: "ai_1", value: [9, 0, 0, 1] },
    },
  },
  {
    testName: "Age of Superheroes: P1 visits alone with 0 coins",
    testId: "AgeOfSuperheroes_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Superheroes", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerScoreTrack", playerId: "ai_1", value: [9, 0, 0, 1] },
    },
  },
  {
    testName: "Age of Superheroes: P1 visits with P2 present",
    testId: "AgeOfSuperheroes_3",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Superheroes", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 5 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialZones: { "ai_2": 7 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
    },
  },
  {
    testName: "Age of Superheroes: P1 visits with cards and coins",
    testId: "AgeOfSuperheroes_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Age of Superheroes", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 5 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
    },
  },
  // --- Floating Cities ---
  {
    testName: "Floating Cities: P1 scores and plays",
    testId: "FloatingCities_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Floating Cities", "Steampunk Empire", "Robot Uprising"],
      initialHands: { "ai_1": [
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }
      ]},
      initialCoins: { "ai_1": 4 },
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
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 5 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Floating Cities: P1 cannot score, just plays",
    testId: "FloatingCities_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Floating Cities", "Steampunk Empire", "Robot Uprising"],
      initialHands: { "ai_1": [
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" },
        { id: "artist", name: "Artist" }, { id: "artist", name: "Artist" }
      ]},
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "playCard", cardIndex: 1 },
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 6 },
        ]
      },
    },
  },
  // --- Simulated Paradise ---
  {
    testName: "Simulated Paradise: P1 rules, chooses Aztec Invasion",
    testId: "SimulatedParadise_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Aztec Invasion", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 0, 1] }, // Rules Time IV
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "simulatedChoice", zoneIndex: 1 }, // Choose Aztec Invasion
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 0, 0, 1] },
        ]
      },
    },
  },
  {
    testName: "Simulated Paradise: P1 does not rule, but zone is pre-set",
    testId: "SimulatedParadise_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Aztec Invasion", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "aztec-invasion", // New config to pre-set the zone
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] }, // Does not rule Time IV
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        // No choice prompt is given, the effect happens automatically
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [9, 1, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Simulated Paradise (preset): Plutocracy (has more money)",
    testId: "SimulatedParadise_Plutocracy_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Plutocracy", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "plutocracy",
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 5 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit SP
        { type: "playCard", cardIndex: 0 },
        { type: "advanceCrown", ageIndex: 0 }
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
    testName: "Simulated Paradise (preset): Plutocracy (has less money)",
    testId: "SimulatedParadise_Plutocracy_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Plutocracy", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "plutocracy",
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0, "ai_2": 10 },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit SP
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 8 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Simulated Paradise (preset): Ice Age",
    testId: "SimulatedParadise_IceAge_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ice Age", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "ice-age",
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4, "ai_2": 6 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialZones: { "ai_2": 1 }, // P2 in Time II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit SP
        { type: "scoreCard", cardIndex: 0 },
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_2", operator: "===", value: 3 },
        ]
      },
    },
  },
  {
    testName: "Simulated Paradise (preset): Time of Legends",
    testId: "SimulatedParadise_TimeOfLegends_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Time of Legends", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "time-of-legends",
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 4 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 }, // Visit SP
        { type: "scoreCard", cardIndex: 0 },
        ...Array(5).fill({ type: "advanceCrown", ageIndex: 0 })
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerScoreTrack", playerId: "ai_1", value: [5, 5, 0, 0] },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  {
    testName: "Simulated Paradise: P1 rules IV, not II, chooses Roman Empire",
    testId: "SimulatedParadise_RomanEmpire_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 2 },
      initialScoreTrack: { "ai_1": [9, 0, 0, 1] }, // Rules Time IV, not Time II
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "simulatedChoice", zoneIndex: 1 }, // Choose Roman Empire
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 }, // Gains 2 coins
        ]
      },
    },
  },
  {
    testName: "Simulated Paradise: Dutch Golden Age (rules IV, not III)",
    testId: "SimulatedParadise_DutchGoldenAge_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Dutch Golden Age", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "dutch-golden-age",
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 0, 1] }, // Rules Time IV, NOT Time III
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "simulatedChoice", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          // 12 from card + 6 from zone effect (rules "here" in Time IV)
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 18 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Simulated Paradise (HQ Test) ---
  {
    testName: "Simulated Paradise: Dutch Golden Age with HQ",
    testId: "SimulatedParadise_HQ",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Dutch Golden Age", "Prohibition Era", "Age of Cats", "Simulated Paradise", "Floating Cities", "Robot Uprising"],
      simulatedParadiseZoneId: "dutch-golden-age",
      initialHands: { "ai_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [9, 0, 0, 1] }, // Rules Time IV
      initialHQs: { "ai_1": 4 }, // HQ is on the real Dutch Golden Age zone
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "simulatedChoice", zoneIndex: 4 },
        { type: "playCard", cardIndex: 0 }
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          // 12 from card + 6 from zone effect = 18
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 18 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
        ]
      },
    },
  },
  // --- Singularity ---
  {
    testName: "Singularity: P1 pays, takes 2 extra turns (Crusades, Crusades)",
    testId: "Singularity_1",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Singularity", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 10 },
      initialZones: { "ai_2": 0 }, // P2 in Time I for Crusades effect
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 7 }, // Visit Singularity
          { type: "resolveOptionalZone", choice: true, zoneId: "singularity" }, // Pay for extra turns
          { type: "visitZone", zoneIndex: 1 }, // Extra turn 1: Visit Crusades
          { type: "declineChangeHistory" },
          { type: "visitZone", zoneIndex: 1 }, // Extra turn 2: Visit Crusades again
          { type: "declineChangeHistory" },
        ],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 4 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 4 },
        ]
      },
    },
  },
  {
    testName: "Singularity: P1 pays, takes 2 extra turns (Crusades, Singularity)",
    testId: "Singularity_2",
    aiPlayerCount: 2,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Singularity", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialCoins: { "ai_1": 18 }, // Adjusted to match expected final $10
      initialZones: { "ai_2": 0 }, // P2 in Time I for Crusades effect
      aiScripts: {
        "ai_1": [
          { type: "visitZone", zoneIndex: 7 }, // Visit Singularity
          { type: "resolveOptionalZone", choice: true, zoneId: "singularity" }, // Pay for extra turns
          { type: "visitZone", zoneIndex: 1 }, // Extra turn 1: Visit Crusades
          { type: "declineChangeHistory" },
          { type: "visitZone", zoneIndex: 7 }, // Extra turn 2: Visit Singularity again (should not prompt)
        ],
      },
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerCoins", playerId: "ai_1", operator: "===", value: 10 },
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 2 },
        ]
      },
    },
  },
  // --- Scrapyard World ---
  {
    testName: "Scrapyard World: P1 scores Artist, discards Conspiracy",
    testId: "ScrapyardWorld_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Scrapyard World", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }, { id: "conspiracy", name: "Conspiracy" }] },
      initialCoins: { "ai_1": 0 },
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
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Scrapyard World: P1 scores Trade Goods, discards none",
    testId: "ScrapyardWorld_2",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Scrapyard World", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "trade-goods", name: "Trade Goods" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 }, // Score Trade Goods
        // No discard prompt, no advance prompt
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Scrapyard World: P1 cannot afford to score Artist",
    testId: "ScrapyardWorld_3",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Scrapyard World", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        // No score prompt should happen
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 1 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0] },
        ]
      },
    },
  },
  {
    testName: "Scrapyard World: P1 scores with FioP discount, discards none",
    testId: "ScrapyardWorld_4",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Scrapyard World", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [{ id: "artist", name: "Artist" }] },
      initialCoins: { "ai_1": 0 },
      initialScoreTrack: { "ai_1": [10, 0, 0, 0] },
      initialPerpetuals: { "ai_1": { score: [{ id: "friends-in-old-places", name: "Friends in Old Places" }] } },
      aiScripts: { "ai_1": [
        { type: "visitZone", zoneIndex: 7 },
        { type: "scoreCard", cardIndex: 0 }, // Score Artist
        // No discard prompt
        ...Array(4).fill({ type: "advanceCrown", ageIndex: 0 }),
      ]},
      endCondition: {
        type: "AND",
        conditions: [
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 0 },
          { type: "playerScoreTrack", playerId: "ai_1", value: [6, 4, 0, 0] },
        ]
      },
    },
  },
  // --- Hourglass Visual Test ---
  {
    testName: "Hourglass: Visual Test",
    testId: "Hourglass_Visual_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery", "Age of Plastic", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHourglass: { "steampunk-empire": 5 },
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 7 }] },
      endCondition: {
        type: "playerScoreTrack", playerId: "ai_1", value: [10, 0, 0, 0]
      },
    },
  },
  // --- Sage ---
  {
    testName: "Sage: P1 rules and visits, draws a card",
    testId: "Sage_1",
    aiPlayerCount: 1,
    testConfig: {
      selectedZones: ["Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery", "Cold War", "Prohibition Era", "Age of Cats", "Steampunk Empire", "Floating Cities", "Robot Uprising"],
      initialHands: { "ai_1": [] },
      initialPerpetuals: { "ai_1": { visit: [{ id: "sage", name: "Sage" }] } },
      initialScoreTrack: { "ai_1": [9, 1, 0, 0] }, // Rules Age II
      aiScripts: { "ai_1": [{ type: "visitZone", zoneIndex: 1 }] }, // Visit Crusades
      endCondition: {
        type: "AND",
        conditions: [
          // Crusades gives 2 cards, Sage gives 1
          { type: "playerHandCount", playerId: "ai_1", operator: "===", value: 3 },
          { type: "playerPerpetualsContain", playerId: "ai_1", cardId: "sage", exists: true },
        ]
      },
    },
  },
];

allTests.push(...age1Tests);
allTests.push(...age2Tests);
allTests.push(...age3Tests);
allTests.push(...age4Tests);
allTests.push(...cardTests);
allTests.push(...perpetualTests);
