const {FieldValue} = require("firebase-admin/firestore");
const {chooseNickname} = require("../utils/nicknames.js");
const {initializeGame} = require("../utils/game.js");
const {startTurn} = require("../utils/turnManagementHelpers.js");

// --- Performance: Load static data once when the module is loaded ---
const allZonesData = require("../data/zones.json");
const allCardsData = require("../data/cards.json");
const allAlternateCardsData = require("../data/alternate-cards.json");
const allAlternateZonesData = require("../data/alternate-zones.json");
const allSpecialCardsData = require("../data/special-cards.json");

/**
 * Generates a random alphanumeric string of a given length.
 * @param {number} length The desired length of the ID.
 * @return {string} The generated random string.
 */
const generateShortId = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Creates a new game lobby document.
 * @param {FirebaseFirestore.Firestore} db The Firestore database instance.
 * @param {object} data Data from the client, e.g., { nickName: "Player1" }.
 * @param {object} context The context of the function call,
 * containing auth info.
 * @return {object} The ID of the newly created lobby.
 */
exports.execute = async (db, data, context) => {
  if (!context.auth) {
    throw new Error("User must be authenticated to create a lobby.");
  }

  const uid = context.auth.uid;
  const nickName = (data.nickName && data.nickName.trim()) ?
    data.nickName.trim() :
    chooseNickname();

  const lobbiesCol = db.collection("lobbies");
  let lobbyId;
  let lobbyRef;
  let lobbyExists = true;

  // Find a unique 6-character ID.
  while (lobbyExists) {
    lobbyId = generateShortId(6);
    lobbyRef = lobbiesCol.doc(lobbyId);
    const doc = await lobbyRef.get();
    if (!doc.exists) {
      lobbyExists = false;
    }
  }

  const players = [];
  const spectators = [];

  if (data.spectate) {
    // If creating a spectator lobby, add the host to the spectators list.
    spectators.push({
      id: uid,
      name: nickName,
      color: "grey", // Spectators can have a color for UI representation
    });
  } else {
    // Otherwise, add the host as the first player.
    players.push({
      id: uid,
      name: nickName,
      color: "grey",
    });
  }

  // If aiPlayerCount is specified, create that many AI players.
  if (data.aiPlayerCount && data.aiPlayerCount > 0) {
    for (let i = 0; i < data.aiPlayerCount; i++) {
      if (players.length >= 5) break; // Don't exceed max players
      const aiId = `ai_${i + 1}`; // Use a predictable ID like 'ai_1', 'ai_2'
      players.push({
        id: aiId,
        name: `Robot ${i + 1}`,
        isAI: true,
        color: "grey",
        // script: data.testConfig?.aiScripts?.[aiId] || [], // Store AI script
        hand: [],
        coins: 0,
        crowns: 0,
        resolutionStack: [],
      });
    }
  }

  const newLobby = {
    lobbyId: lobbyId,
    ownerId: uid,
    status: "waiting",
    createdAt: FieldValue.serverTimestamp(),
    players,
    isTest: data.isTest || false, // Ensure the isTest flag is saved.
    spectators,
    // --- Add static data for lobby setup ---
    // Firestore does not support arrays of arrays. Convert to a map.
    allZoneNamesByAge: {},
    allCardNames: [...allCardsData, ...allSpecialCardsData].map((c) => c.name),
    allCards: [...allCardsData, ...allSpecialCardsData],
    allZones: allZonesData.flat(),
    allAlternateCards: allAlternateCardsData,
    allAlternateZones: allAlternateZonesData.flat(),
    // --- Default and Test setup fields ---
    // Merge the incoming testConfig with defaults,
    // and ensure testName is included.
    // Use nullish coalescing to avoid undefined values.
    testConfig: data.testConfig || {},
    selectedZones: data.testConfig?.selectedZones || Array(10).fill(""),
    initialCards: data.testConfig?.initialCards || {},
    alternateRealities: data.alternateRealities ?? (data.isTest || false),
  };

  // Populate allZoneNamesByAge based on the alternateRealities flag
  const baseZones = allZonesData.reduce((acc, ageGroup, index) => {
    if (!acc[`age${index + 1}`]) acc[`age${index + 1}`] = [];
    acc[`age${index + 1}`] = ageGroup.map((z) => z.name);
    return acc;
  }, {});

  if (newLobby.alternateRealities) {
    allAlternateZonesData.forEach((ageGroup, index) => {
      baseZones[`age${index + 1}`].push(...ageGroup.map((z) => z.name));
    });
  }
  newLobby.allZoneNamesByAge = baseZones;


  // If a testName is provided add it to the testConfig.
  if (data.testName) {
    newLobby.testConfig.testName = data.testName;
  }

  // --- Auto-Start for Tests ---
  if (newLobby.testConfig?.autoStart) {
    // If the test config provides specific zones, use them.
    // This is now handled during newLobby creation, but we keep this
    // as a fallback for any other paths.
    if (data.testConfig?.selectedZones) {
      newLobby.selectedZones = data.testConfig.selectedZones;
    }

    // If the test config provides specific initial cards, use them.
    if (newLobby.testConfig.initialCards) {
      newLobby.initialCards = newLobby.testConfig.initialCards;
    }

    const {deck, gizmoPile, tradeGoodsPile, players, zones, arrows,
      realZones, legalZones} = initializeGame(
        newLobby.players,
        newLobby.selectedZones,
        newLobby.testConfig,
        newLobby.initialCards,
        newLobby.alternateRealities,
    );

    // Overwrite the lobby data with initialized game state
    newLobby.status = "in-progress";
    newLobby.deck = deck;
    if (gizmoPile.length > 0) newLobby.gizmoPile = gizmoPile;
    if (tradeGoodsPile.length > 0) newLobby.tradeGoodsPile = tradeGoodsPile;
    newLobby.players = players;
    newLobby.zones = zones;
    newLobby.arrows = arrows;
    newLobby.realZones = realZones;
    newLobby.legalZones = legalZones;
    newLobby.log = [{text: "Game started (auto-start).", type: "system"}];
    newLobby.turn = 1;
    newLobby.activePrompts = {};
    newLobby.resolutionStack = [];

    // Set up the first turn
    await startTurn(newLobby.players[0], newLobby, lobbyId);
  }

  // Use a batch to write to lobby and user session atomically
  const batch = db.batch();

  // If auto-starting, we need to create private docs for hands
  if (newLobby.testConfig?.autoStart) {
    newLobby.players.forEach((p) => {
      if (p.hand) {
        p.handCount = p.hand.length;
        const privateDataRef = db.collection("lobbies")
            .doc(lobbyId).collection("private").doc(p.id);
        batch.set(privateDataRef, {hand: p.hand});
        delete p.hand; // Remove hand from public player object
      }
    });
  }

  batch.set(lobbyRef, newLobby);
  const sessionRef = db.collection("user_sessions").doc(uid);
  batch.set(sessionRef, {lobbyId: lobbyId});
  await batch.commit();

  return {lobbyId: lobbyId};
};
