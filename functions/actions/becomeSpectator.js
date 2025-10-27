const {FieldValue} = require("firebase-admin/firestore");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Executes the logic for a player to move themselves to the spectator list.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user becoming a spectator.
 * @param {object} payload The data associated with the action.
 * @param {object} lobbyData The current state of the lobby document.
 * @return {object} The update payload.
 */
exports.execute = (lobbyId, uid, payload, lobbyData) => {
  const playerToMove = lobbyData.players.find((p) => p.id === uid);

  // --- Validation ---
  if (!playerToMove) {
    console.log(`Player ${uid} not in lobby, cannot become a spectator.`);
    return {}; // No-op, player not found.
  }

  if (playerToMove.isAI) {
    console.log(`AI Player ${uid} cannot become a spectator.`);
    return {}; // No-op, AI cannot do this.
  }

  // --- Handle In-Progress Game ---
  if (lobbyData.status === "in-progress") {
    const batch = getFirestore().batch();

    // Create the new spectator object.
    const newSpectator = {
      id: playerToMove.id,
      name: playerToMove.name,
      color: "grey",
    };

    // Replace the player with an AI.
    const newAIName = `Robot (Replaced ${playerToMove.name})`;
    const newAIPlayer = {
      ...playerToMove,
      id: `ai_replaced_${Date.now()}`,
      name: newAIName,
      isAI: true,
      prompt: "", // Always clear prompt when replacing.
    };

    const playerIndex = lobbyData.players.findIndex((p) => p.id === uid);
    const updatedPlayers = [...lobbyData.players];
    updatedPlayers[playerIndex] = newAIPlayer;

    const updatePayload = {
      players: updatedPlayers,
      spectators: FieldValue.arrayUnion(newSpectator),
      log: FieldValue.arrayUnion({
        text: `${playerToMove.name} has become a spectator 
          and is now controlled by an AI.`,
        type: "system",
      }),
    };

    // If the player becoming a spectator was the host,
    // we need to assign a new host.
    if (lobbyData.ownerId === uid) {
      // Find another human player to be the new host.
      const newOwnerPlayer = updatedPlayers.find((p) => !p.isAI);
      if (newOwnerPlayer) {
        updatePayload.ownerId = newOwnerPlayer.id;
        updatePayload.log = FieldValue.arrayUnion({
          text: `${newOwnerPlayer.name} is the new host.`,
          type: "system",
        });
      }
    }

    return {updatePayload, batch};
  }

  // Rebuild the players array without the player who is moving.
  const remainingPlayers = lobbyData.players.filter((p) => p.id !== uid);

  // Create the new spectator object.
  const newSpectator = {
    id: playerToMove.id,
    name: playerToMove.name,
    color: "grey", // Reset color to spectator default
  };

  const updatePayload = {
    players: remainingPlayers,
    spectators: FieldValue.arrayUnion(newSpectator),
    log: FieldValue.arrayUnion({
      text: `${playerToMove.name} is now spectating.`,
      type: "system",
    }),
  };

  // Note: Host transfer logic is not needed here. If the host becomes a
  // spectator, they remain the lobby owner.

  return {updatePayload};
};
