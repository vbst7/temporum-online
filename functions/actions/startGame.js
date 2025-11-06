const {initializeGame} = require("../utils/game.js");
const {startTurn} = require("../utils/turnManagementHelpers.js");
const {FieldValue, getFirestore} = require("firebase-admin/firestore");

/**
 * Executes the logic to start a game.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action.
 * @param {object} payload The data associated with the action.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the lobby owner can start the game.");
  }
  if (lobbyData.status !== "waiting") {
    throw new Error("Game has already started.");
  }
  if (lobbyData.players.length < 2) {
    // throw new Error("Cannot start a game with fewer than 2 players.");
  }
  if (lobbyData.players.length > 5) {
    throw new Error("Cannot start a game with more than 5 players.");
  }

  // --- Game Initialization ---
  const db = getFirestore();
  const {
    deck,
    gizmoPile,
    tradeGoodsPile,
    players,
    zones, // This is the initialized zones from initializeGame
    arrows, // This is the initialized arrows
    realZones, // This is the initialized realZones
    legalZones, // This is the initialized legalZones
  } = initializeGame(
      lobbyData.players, // This is the players array from the lobby
      lobbyData.selectedZones,
      lobbyData.testConfig,
      lobbyData.initialCards,
      lobbyData.alternateRealities,
  );

  const batch = db.batch();

  // Create private documents for each player's hand
  players.forEach((p) => {
    // For manual tests, the hand is already assigned.
    // For regular games, it's assigned by initializeGame.
    if (p.hand) {
      // Set the public handCount before deleting the private hand data
      p.handCount = p.hand.length;
      const privateDataRef = db.collection("lobbies").doc(lobbyId)
          .collection("private").doc(p.id);
      batch.set(privateDataRef, {hand: p.hand});
      // Remove hand from the public player object before saving
      delete p.hand;
    }
  });

  // Commit the batch to create private hands before starting the first turn.
  // This ensures that when startTurn tries to read the hand, it exists.
  await batch.commit();

  // --- First Turn Setup ---
  // Create a fresh object for the first turn to avoid using stale lobbyData.
  const mutableLobbyData = {
    deck,
    players,
    allCards: lobbyData.allCards,
    allAlternateCards: lobbyData.allAlternateCards,
    zones,
    arrows,
    realZones, // Use the initialized value
    legalZones,
    log: [],
    turn: 1,
    activePrompts: {},
    resolutionStack: [],
  };

  // Now, start the first turn with the fully initialized data.
  await startTurn(mutableLobbyData.players[0], mutableLobbyData, lobbyId);

  // --- Prepare Update Payload ---
  // We only return the fields that are changing.
  return {
    updatePayload: {
      status: "in-progress",
      deck: deck,
      gizmoPile: gizmoPile.length > 0 ? gizmoPile : FieldValue.delete(),
      tradeGoodsPile: tradeGoodsPile.length > 0 ?
        tradeGoodsPile : FieldValue.delete(),
      players: mutableLobbyData.players,
      zones: mutableLobbyData.zones,
      arrows: mutableLobbyData.arrows,
      realZones: mutableLobbyData.realZones,
      legalZones: mutableLobbyData.legalZones,
      turn: mutableLobbyData.turn,
      activePrompts: mutableLobbyData.activePrompts || {},
      log: mutableLobbyData.log,
      resolutionStack: [],
      // Clear setup fields that are no longer needed
      selectedZones: FieldValue.delete(),
      initialCards: FieldValue.delete(),
    },
  };
};
