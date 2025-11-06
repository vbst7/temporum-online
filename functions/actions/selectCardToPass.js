const {logMessage, peekStack} = require("../utils/logHelpers");
const {executeZoneFollowUp} = require("../utils/followUpHelpers");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

/**
 * Handles the 'selectCardToPass' action for Age of Cults.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g.,
 * { cardIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId).collection("private").doc(playerId); // eslint-disable-line max-len
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {cardIndex} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {
    type: "pass-card",
    uid: playerId,
    context: {cardIndex: cardIndex},
  };
  if (player.prompt !== "pass-card") {
    logMessage(lobbyData, "Player not in 'pass-card' state.", "error");
    return lobbyData;
  }

  if (!lobbyData.cultPlayerIndices) {
    logMessage(lobbyData, "selectCardToPass called, but promptContext for Age of Cults is missing. Clearing prompt to prevent hang.", "error"); // eslint-disable-line max-len
    player.prompt = "";
    return lobbyData;
  }

  if (cardIndex === -1) {
    logMessage(lobbyData, `${player.name} has no card to pass.`);
    player.prompt = "";
  } else {
    const cardToPass = hand.splice(cardIndex, 1)[0];
    player.handCount = hand.length;

    if (cardToPass.id === "gizmo") {
      player.gizmoCount = (player.gizmoCount || 0) - 1;
    } else if (cardToPass.id === "trade-goods") {
      player.tradeGoodsCount = (player.tradeGoodsCount || 0) - 1;
    }

    logMessage(lobbyData, `${player.name} chose a card to pass.`);

    const cultPlayerIndices = lobbyData.cultPlayerIndices;
    const playerPassIndex = cultPlayerIndices.findIndex((idx) =>
      lobbyData.players[idx].id === playerId);

    if (playerPassIndex !== -1) {
      lobbyData.passedCards[playerPassIndex] = cardToPass;
    } else {
      logMessage(lobbyData,
          "Error: Player was not in the cult pass list.", "error");
      hand.push(cardToPass); // Put card back to avoid losing it
    }
    player.prompt = "";
  }

  // Check if all cult players have acted
  const anyPlayerHasPrompt = lobbyData.players
      .some((p) => p.prompt === "pass-card");
  if (!anyPlayerHasPrompt) {
    logMessage(lobbyData, `All players have passed cards. Distributing...`);
    const cultPlayerIndices = lobbyData.cultPlayerIndices;
    const passedCards = lobbyData.passedCards;
    const numCultPlayers = cultPlayerIndices.length;

    for (let i = 0; i < numCultPlayers; i++) {
      const cardToGive = passedCards[i];
      if (cardToGive) {
        const receivingPlayerIndexInCult = (i + 1) % numCultPlayers;
        const receivingPlayerOriginalIndex =
          cultPlayerIndices[receivingPlayerIndexInCult];
        const receivingPlayer =
          lobbyData.players[receivingPlayerOriginalIndex];

        if (receivingPlayer.id === playerId) {
          // If the receiving player is the current player,
          // add to their local hand.
          if (cardToGive.id === "gizmo") {
            receivingPlayer.gizmoCount = (receivingPlayer.gizmoCount || 0) + 1;
          } else if (cardToGive.id === "trade-goods") {
            receivingPlayer.tradeGoodsCount =
            (receivingPlayer.tradeGoodsCount || 0) + 1;
          }
          hand.push(cardToGive);
          receivingPlayer.handCount = hand.length;
        } else {
          // Otherwise, fetch the other player's hand to update it.
          const receivingPlayerRef = db.collection("lobbies")
              .doc(lobbyId).collection("private")
              .doc(receivingPlayer.id);
          const receivingPlayerSnap = await receivingPlayerRef.get();
          const receivingPlayerHand = receivingPlayerSnap.exists ?
            receivingPlayerSnap.data().hand : [];
          receivingPlayerHand.push(cardToGive);
          receivingPlayer.handCount = receivingPlayerHand.length;
          batch.update(receivingPlayerRef, {hand: receivingPlayerHand});
        }
        if (cardToGive.id === "gizmo") {
          receivingPlayer.gizmoCount = (receivingPlayer.gizmoCount || 0) + 1;
        } else if (cardToGive.id === "trade-goods") {
          receivingPlayer.tradeGoodsCount =
          (receivingPlayer.tradeGoodsCount || 0) + 1;
        }
        logMessage(lobbyData, `${receivingPlayer.name} received a card.`);
      }
    }

    lobbyData.passedCards = FieldValue.delete();
    lobbyData.cultPlayerIndices = FieldValue.delete();
    const turnPlayer = lobbyData.players.find((p) => p.turn);
    // After all players have passed cards, continue with the zone follow-up.
    const action = peekStack(lobbyData);
    await executeZoneFollowUp(turnPlayer, action.id, lobbyData,
        lobbyId, action.instruction);
    // The game loop will handle the next step if a
    // prompt was set or turn ended.
  }

  batch.update(privateRef, {hand});
  return {updatePayload: lobbyData, batch};
};
