/**
 * Executes the logic for the host to update a selected zone.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action, containing index
 * and zoneName.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {index, zoneName} = payload;

  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can update zones.");
  }
  if (lobbyData.status !== "waiting") {
    throw new Error("Cannot update zones after the game has started.");
  }
  if (index < 0 || index >= 10) {
    throw new Error("Invalid zone index.");
  }

  // --- Update Zone ---
  const updatedZones = [...(lobbyData.selectedZones || Array(10).fill(""))];
  updatedZones[index] = zoneName;

  return {
    selectedZones: updatedZones,
  };
};
