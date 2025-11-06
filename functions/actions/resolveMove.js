const {getFirestore} = require("firebase-admin/firestore");
const {logMessage, peekStack} = require("../utils/logHelpers");
const {moveToZone} = require("../utils/resourceHelpers");
const {
  processPostVisitQueue,
  processStartOfTurnQueue,
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
  let source = player.promptContext?.source || null;
  const origin = player.promptContext?.origin || null;

  if (sourceAction?.type === "zone" && sourceAction?.id === "atomic-age") {
    source = {name: "Atomic Age", type: "brown"};
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

  // If the move originated from a start-of-turn effect, re-process that queue.
  if (origin === "start-of-turn") {
    await processStartOfTurnQueue(player, lobbyData, lobbyId);
  } else {
    // Otherwise, proceed to the normal post-visit queue.
    await processPostVisitQueue(lobbyId, lobbyData);
  }

  return {updatePayload: lobbyData, batch};
};
