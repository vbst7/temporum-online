/**
 * Executes the logic for a player to change their color.
 * A player can always change their own color.
 * The host can change an AI player's color.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user changing color.
 * @param {object} payload The data associated with the action, containing color
 * and an optional playerId.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {color, playerId} = payload;
  const players = lobbyData.players;

  // Default to changing the color of the user who initiated the action,
  // unless a specific playerId is provided.
  const targetPlayerId = playerId || uid;
  const playerIndex = players.findIndex((p) => p.id === targetPlayerId);

  // --- Validation ---
  if (playerIndex === -1) {
    throw new Error("Player not found in lobby.");
  }

  const playerToChange = players[playerIndex];

  // Authorization: Allow if changing self, OR if user is host and target is AI.
  if (targetPlayerId !== uid &&
    (lobbyData.ownerId !== uid || !playerToChange.isAI)) {
    throw new Error("Not authorized to change this player's color.");
  }

  if (lobbyData.status !== "waiting") {
    throw new Error("Cannot change color after the game has started.");
  }
  // Check if the color is already taken by another player.
  if (color !== "grey" &&
    players.some((p) => p.id !== targetPlayerId && p.color === color)) {
    console.log(`Color ${color} is already taken.`);
    return {}; // No-op, color is taken.
  }

  // --- Update Player Color ---
  const updatedPlayers = [...players];
  updatedPlayers[playerIndex] = {...updatedPlayers[playerIndex], color};

  return {
    players: updatedPlayers,
  };
};
