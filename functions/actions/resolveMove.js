const {getFirestore} = require("firebase-admin/firestore");
const {logMessage, peekStack} = require("../utils/logHelpers");
const {moveToZone} = require("../utils/resourceHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");

exports.execute = async (lobbyId, uid, payload, lobbyData) => {
  const db = getFirestore();
  const batch = db.batch();

  const player = lobbyData.players.find((p) => p.id === uid);
  if (!player || player.prompt !== "move") {
    logMessage(lobbyData,
        "Player attempted to resolve move without a valid prompt.",
        "error");
    return lobbyData;
  }

  const {zoneIndex} = payload;
  if (!lobbyData.legalZones.includes(zoneIndex)) {
    logMessage(lobbyData,
        `Player chose an illegal zone for move: ${zoneIndex}`,
        "error");
    return lobbyData;
  }

  const sourceAction = peekStack(lobbyData);
  let source = {name: "Maneuver", type: "M"};

  if (sourceAction?.type === "zone" && sourceAction?.id === "atomic-age") {
    source = {name: "Atomic Age", type: "brown"};
  } else {
    // Check for end-of-turn effects like Maneuver
    const maneuverEffect = lobbyData.endOfTurnQueue?.find((effect) => effect
        .cardId === "maneuver");
    if (maneuverEffect) {
      source = {name: "Maneuver", type: "M"};
    }
  }

  // Move the player without visiting
  moveToZone(player, zoneIndex, lobbyData, source);

  // Clear the prompt
  player.prompt = "";
  delete lobbyData.activePrompts[player.id];
  if (player.promptContext) delete player.promptContext;
  lobbyData.legalZones = [];

  // The zone action is now fully resolved.
  if (sourceAction?.type === "zone") {
    lobbyData.resolutionStack.pop();
  }

  const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
  if (result?.winnerDeclared) {
    const winnerPayload = await declareWinner(lobbyId, lobbyData,
        result.winnerPlayer, result.reason);
    return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
  }

  return {updatePayload: lobbyData, batch};
};
