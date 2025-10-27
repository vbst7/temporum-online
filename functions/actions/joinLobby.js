const {FieldValue, getFirestore} = require("firebase-admin/firestore");
const {chooseNickname} = require("../utils/nicknames.js");

/**
 * Executes the logic for a player to join a lobby.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user joining.
 * @param {object} payload The data associated with the action,
 * containing nickName.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const playerExists = lobbyData.players.some((p) => p.id === uid);
  const spectatorExists = lobbyData.spectators?.some((s) => s.id === uid);
  if (playerExists || spectatorExists) {
    // User is already in the lobby, no action needed.
    return lobbyData;
  }

  const db = getFirestore();
  const batch = db.batch();
  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const sessionRef = db.collection("user_sessions").doc(uid);

  // If game is in progress or finished, join as a spectator.
  if (lobbyData.status !== "waiting") {
    const newSpectator = {
      id: uid,
      name: (payload.nickName && payload.nickName.trim()) ?
        payload.nickName.trim() :
        chooseNickname(),
      color: "grey",
    };

    batch.update(lobbyRef, {
      spectators: FieldValue.arrayUnion(newSpectator),
      log: FieldValue.arrayUnion({text:
        `${newSpectator.name} is now spectating.`, type: "system"}),
    });
    batch.set(sessionRef, {lobbyId: lobbyId});
    return {batch};
  }

  // --- Logic for joining a "waiting" lobby as a player ---
  if (lobbyData.players.length >= 5 && lobbyData.status === "waiting") {
    throw new Error("Lobby is full.");
  }

  // --- Create New Player Object ---
  const newPlayer = {
    id: uid,
    name: (payload.nickName && payload.nickName.trim()) ?
      payload.nickName.trim() :
      chooseNickname(),
    isAI: false,
    color: "grey",
    hand: [],
    coins: 0,
    crowns: 0,
    resolutionStack: [],
  };

  // --- Prepare Update Payload ---
  // Use FieldValue.arrayUnion to atomically add the new player.
  batch.update(lobbyRef, {players: FieldValue.arrayUnion(newPlayer)});
  batch.set(sessionRef, {lobbyId: lobbyId});

  return {batch};
};
