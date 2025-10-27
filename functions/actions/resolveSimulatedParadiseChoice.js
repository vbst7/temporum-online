const {logMessage, peekStack} = require("../utils/logHelpers");
const {executeZoneFollowUp} = require("../utils/followUpHelpers");

/**
 * Handles the 'resolveSimulatedParadiseChoice' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { zoneIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const {zoneIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, `Player ${playerId} not found.`, "error");
    return lobbyData;
  }

  if (player.prompt !== "simulatedChoice") {
    logMessage(lobbyData, `Player ${player.name} is not being 
      prompted to choose a zone for Simulated Paradise.`, "error");
    return lobbyData;
  }

  if (!lobbyData.legalZones.includes(zoneIndex)) {
    logMessage(lobbyData, `Invalid zone choice for Simulated 
      Paradise: ${zoneIndex}.`, "error");
    return lobbyData;
  }

  const simulatedParadiseZone = lobbyData
      .zones.find((z) => z.id === "simulated-paradise");
  const chosenZone = lobbyData.zones[zoneIndex];

  if (!simulatedParadiseZone || !chosenZone) {
    logMessage(lobbyData, "Could not find Simulated Paradise or chosen zone.", "error");// eslint-disable-line max-len
    player.prompt = ""; // Clear prompt to avoid hang
    return lobbyData;
  }

  simulatedParadiseZone.simulatedZoneId = chosenZone.id;

  logMessage(lobbyData, [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: " chose to simulate "},
    {type: "zone", value: chosenZone.name, color: chosenZone.color},
    {type: "text", value: " with "},
    {type: "zone", value: "Simulated Paradise", color: "silver"},
    {type: "text", value: "."},
  ]);

  player.prompt = "";
  lobbyData.legalZones = [];

  // The choice is made. Now, continue with the zone's follow-up.
  const action = peekStack(lobbyData);
  if (action && action.type === "zone") {
    await executeZoneFollowUp(player, action.id, lobbyData,
        lobbyId, action.instruction);
  }

  return lobbyData;
};
