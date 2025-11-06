const {logMessage, peekStack} = require("../utils/logHelpers");
const {drawCards, gainMoney} = require("../utils/resourceHelpers");
const {executeCardFollowUp} = require("../utils/followUpHelpers");
const {setPlayerPrompt} = require("../utils/promptingHelpers.js");
const {getFirestore} = require("firebase-admin/firestore");
/**
 * Handles the 'resolveInventor' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., {choice: 'draw'}).
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {choice} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: "inventor", uid: playerId,
    context: {choice: choice}};

  // The 'inventor' card action should be on top of the stack.
  const cardAction = peekStack(lobbyData);
  if (!cardAction || cardAction.id !== "inventor") {
    // Clear prompt to avoid getting stuck
    player.prompt = "";
    return lobbyData;
  }

  player.prompt = ""; // Clear inventor prompt

  switch (choice) {
    case "draw":
      drawCards(player, hand, 2, lobbyData, {name: "Inventor", type: "M"});
      break;
    case "gain":
      gainMoney(player, 8, lobbyData, {name: "Inventor", type: "M"});
      break;
    case "advance":
      player.crowns = 2;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 2, source: {name: "Inventor", type: "M"}});
      break;
  }

  // If a new prompt was set for any player (i.e., 'advance'),
  // the action is not yet complete.
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
  if (anyPlayerHasPrompt) {
    player.handCount = hand.length;
    batch.update(privateRef, {hand});
    return {updatePayload: lobbyData, batch};
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  // If no new prompt, the card action is complete.
  // The follow-up function will pop the stack and continue the chain.
  await executeCardFollowUp(player, "inventor", lobbyData, lobbyId, null);
  // If executeCardFollowUp set a new prompt or ended the turn,
  // the game loop will pick it up.
  // In either case, we return the current lobbyData.
  return {updatePayload: lobbyData, batch};
};
