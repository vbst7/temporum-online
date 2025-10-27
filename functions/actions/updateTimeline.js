exports.execute = (lobbyId, uid, payload, lobbyData) => {
  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can update the timeline.");
  }
  if (lobbyData.status !== "waiting") {
    throw new Error("Timeline can only be changed in a waiting lobby.");
  }
  if (!Array.isArray(payload.zones) || payload.zones.length !== 10) {
    throw new Error("Invalid payload: zones must be an array of 10 strings.");
  }

  // Get all available zone names from the lobby data itself.
  const allZoneNames = Object.values(lobbyData.allZoneNamesByAge).flat();

  // Validate that all provided zone names are valid (or empty strings).
  const validZones = payload.zones
      .every((zoneName) => zoneName === "" || allZoneNames.includes(zoneName));
  if (!validZones) {
    throw new Error("Invalid zone name provided in the timeline.");
  }

  return {
    selectedZones: payload.zones,
  };
};
