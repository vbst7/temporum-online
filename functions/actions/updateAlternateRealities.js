const allZonesData = require("../data/zones.json");
const alternateZonesData = require("../data/alternate-zones.json");

/**
 * Executes the logic for the host to toggle the Alternate Realities setting.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} uid The UID of the user initiating the action (must be host).
 * @param {object} payload The data associated with the action,
 * containing {enabled: boolean}.
 * @param {object} lobbyData The current state of the lobby document.
 */
exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const {enabled} = payload;

  // --- Validation ---
  if (lobbyData.ownerId !== uid) {
    throw new Error("Only the host can toggle Alternate Realities.");
  }
  if (lobbyData.status !== "waiting") {
    throw new Error("Cannot change this setting after the game has started.");
  }

  // --- Update Zone and Card Lists ---
  // When AR is toggled, we must update the list of
  // available zones for the lobby UI.
  const baseZones = allZonesData.reduce((acc, ageGroup, index) => {
    if (!acc[`age${index + 1}`]) acc[`age${index + 1}`] = [];
    acc[`age${index + 1}`] = ageGroup.map((z) => z.name);
    return acc;
  }, {});

  if (enabled) {
    alternateZonesData.forEach((ageGroup, index) => {
      baseZones[`age${index + 1}`].push(...ageGroup.map((z) => z.name));
    });
  }

  return {alternateRealities: !!enabled, allZoneNamesByAge: baseZones};
};
