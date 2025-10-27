const {FieldValue} = require("firebase-admin/firestore");

/**
 * Generates a random alphanumeric string for unique AI IDs.
 * @param {number} length The desired length of the ID.
 * @return {string} The generated random string.
 */
const generateRandomId = (length = 16) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // eslint-disable-line max-len
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Executes the logic for the host to add an AI player.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can add an AI player.");
  }
  if (lobbyData.players.length >= 5) {
    throw new Error("Lobby is full.");
  }

  // --- Create AI Player ---
  const aiCount = lobbyData.players.filter((p) => p.isAI).length;
  const newAIPlayer = {
    id: `ai_${generateRandomId()}`, // More robust unique ID for the AI
    name: `Robot ${aiCount + 1}`,
    isAI: true,
    color: "grey",
    hand: [],
    coins: 0,
    crowns: 0,
    resolutionStack: [],
  };

  return {
    players: FieldValue.arrayUnion(newAIPlayer),
  };
};
