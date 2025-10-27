const {logMessage, peekStack} = require("../utils/logHelpers");
const {
  executeZoneFollowUp,
  executeCardFollowUp,
} = require("../utils/followUpHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");

/**
 * Handles the 'retreatCrown' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { ageIndex: 1 }).
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const {ageIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  lobbyData.lastAction = {type: player.prompt, uid: playerId};
  if (player.prompt !== "retreat") {
    logMessage(lobbyData, "Player cannot retreat crowns right now.", "warn");
    return lobbyData;
  }

  // Age index is where the crown is *currently*.
  if (ageIndex < 1 || ageIndex > 3 || player.scoreTrack[ageIndex] <= 0) {
    logMessage(lobbyData, `Cannot retreat from Age ${ageIndex + 1}.`, "warn");
    return lobbyData;
  }

  player.scoreTrack[ageIndex] -= 1;
  player.scoreTrack[ageIndex - 1] += 1;
  const source = player.promptContext?.source;
  const messageParts = [
    {type: "player", value: player.name, color: player.color},
    {type: "text", value: " retreated a crown "},
  ];
  if (source) {
    messageParts.push({type: "text", value: " ("});
    if (source.type && source.name) {
      const sourceType = (source.type === "M" || source.type === "P") ?
        "card" : "zone";
      const color = sourceType === "zone" ? source.type : undefined;
      messageParts.push({type: sourceType, value: source.name,
        cardType: source.type, color: color});
    } else {
      messageParts.push({type: "text", value: source});
    }
    messageParts.push({type: "text", value: ")"});
  }
  messageParts.push({type: "text", value: "."});
  logMessage(lobbyData, messageParts);
  player.prompt = "";

  // Check if any other players still need to act
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
  if (!anyPlayerHasPrompt) {
    const turnPlayer = lobbyData.players.find((p) => p.turn);
    const action = peekStack(lobbyData);
    if (action && action.type === "zone") {
      const turnEnded = await executeZoneFollowUp(turnPlayer, action.id,
          lobbyData, lobbyId, action.instruction);
      if (turnEnded) return lobbyData;
    } else if (action && action.type === "card") {
      const turnEnded = await executeCardFollowUp(turnPlayer, action.id,
          lobbyData, lobbyId, action.instruction);
      if (turnEnded) return lobbyData;
    } else {
      const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
      if (result && result.winnerDeclared) {
        const winnerPayload = await declareWinner(lobbyId, lobbyData,
            result.winnerPlayer, result.reason);
        return {...lobbyData, ...winnerPayload};
      }
      return lobbyData;
    }
  }

  return lobbyData;
};
