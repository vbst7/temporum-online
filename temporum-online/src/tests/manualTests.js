// /home/valerie-brown/Documents/Temporum/temporum-online/src/tests/manualTests.js

export const manualTests = [
  {
    testId: "MANUAL_INVESTMENTS_BUTTERFLY",
    buttonLabel: "Investments + Butterfly",
    config: {
      selectedZones: [
        "Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery",
        "Cold War", "Prohibition Era", "Age of Cats", "Communist Utopia",
        "Floating Cities", "Robot Uprising"
      ],
      initialHands: {
        "player_1": [{ id: "step-on-a-butterfly", name: "Step on a Butterfly" }]
      },
      initialPerpetuals: {
        "player_1": { turnEnd: [{ id: "investments", name: "Investments", instanceId: "invest-player_1-0" }] }
      },
    }
  },
  {
    testId: "MANUAL_MANEUVER_TMAP",
    buttonLabel: "Maneuver + T-Map",
    config: {
      selectedZones: [
        "Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery",
        "Cold War", "Prohibition Era", "Age of Cats", "Communist Utopia",
        "Floating Cities", "Robot Uprising"
      ],
      initialHands: {
        "player_1": [{ id: "maneuver", name: "Maneuver" }] // player_1 is a placeholder for the human player
      },
      initialPerpetuals: {
        "player_1": { postVisit: [{ id: "treasure-map", name: "Treasure Map", instanceId: "tmap-player_1-0" }] } // player_1 is a placeholder
      },
    },
  },
  {
    testId: "MANUAL_SUNBOAT",
    buttonLabel: "2 Sunboats of Ra",
    config: {
      selectedZones: [
        "Ancient Egypt", "Roman Empire", "Bright Ages", "Age of Discovery",
        "Cold War", "Prohibition Era", "Age of Cats", "Communist Utopia",
        "Floating Cities", "Robot Uprising"
      ],
      initialHands: {
        "player_1": [{ id: "maneuver", name: "Maneuver" }] // player_1 is a placeholder for the human player
      },
      initialPerpetuals: {
        "player_1": { turnEnd: [{ id: "sunboat-of-ra", name: "Sunboat of Ra", instanceId: "sor-player_1-0" },{ id: "sunboat-of-ra", name: "Sunboat of Ra", instanceId: "sor-player_1-1" }] } // player_1 is a placeholder
      },
    },
  },
  {
    testId: "MANUAL_SECRET",
    buttonLabel: "Secret Mission and Cold War",
    config: {
      selectedZones: [
        "Ancient Egypt", "Dark Ages", "Bright Ages", "Age of Discovery",
        "Cold War", "Prohibition Era", "Age of Cats", "Communist Utopia",
        "Floating Cities", "Robot Uprising"
      ],
      initialHands: {
        "player_1": [{ id: "secret-mission", name: "Secret Mission" }] // player_1 is a placeholder for the human player
      },
      initialZones: { "player_1": 4 },
    },
  },
  {
    testId: "MANUAL_SECRET_STASH",
    buttonLabel: "Secret Stash",
    config: {
      selectedZones: [
        "Ancient Egypt", "Dark Ages", "Bright Ages", "Age of Discovery",
        "Cold War", "Prohibition Era", "Age of Cats", "Communist Utopia",
        "Floating Cities", "Robot Uprising"
      ],
      initialHands: {
        "player_1": [{ id: "secret-stash", name: "Secret Stash" }] // player_1 is a placeholder for the human player
      },
      initialZones: { "player_1": 4 },
    }
  },
  {
    testId: "MANUAL_UNIVERSITY_INFO_AGE",
    buttonLabel: "University + Info Age",
    config: {
      selectedZones: [
        "Ancient Egypt", "Crusades", "Bright Ages", "Age of Discovery",
        "Cold War", "Prohibition Era", "Age of Cats", "Information Age",
        "Floating Cities", "Robot Uprising"
      ],
      initialHands: {
        "player_1": [{ id: "artist", name: "Artist" }, { id: "trinket", name: "Trinket" }, { id: "conspiracy", name: "Conspiracy" }]
      },
      initialCoins: { "player_1": 4 },
      initialScoreTrack: { "player_1": [4, 4, 0, 2] },
      initialPerpetuals: {
        "player_1": { postVisit: [{ id: "university", name: "University" }] }
      },
    }
  }
];
