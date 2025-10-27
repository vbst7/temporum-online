const {logMessage, peekStack} = require("../utils/logHelpers");
const {gainMoney, drawCards, discardCard,
  retreatSpecificCrown} = require("../utils/resourceHelpers");
const {promptScore, setPlayerPrompt} = require("../utils/promptingHelpers");
const {
  checkAnubisAndEndTurn,
  declareWinner,
} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");

/**
 * Handles various optional zone effects after a player makes a choice.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload.
 * @param {object} afterData The current state of the lobby document.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const db = getFirestore();
  const batch = db.batch();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();

  const lobbyData = afterData;
  const {choice, zoneId} = payload;

  const player = lobbyData.players.find((p) => p.id === playerId);
  if (!player) {
    logMessage(lobbyData, "Player not found.", "error");
    return lobbyData;
  }

  const hand = privateSnap.exists ? privateSnap.data().hand : [];
  lobbyData.lastAction = {type: player.prompt, uid: playerId,
    context: {choice, zoneId}};
  let newPromptSet = false;

  switch (zoneId) {
    case "ancient-greece": {
      if (choice && player.coins >= 4) {
        gainMoney(player, -4, lobbyData,
            {name: "Ancient Greece", type: "white"});
        drawCards(player, hand, 1, lobbyData,
            {name: "Ancient Greece", type: "white"});
      }
      break;
    }
    case "feudal-japan": {
      if (choice) {
        const handLength = hand.length;
        if (handLength > 0) {
          for (let i = hand.length - 1; i >= 0; i--) {
            discardCard(player, hand, i, lobbyData,
                {name: "Feudal Japan", type: "green"});
          }
          drawCards(player, hand, handLength, lobbyData,
              {name: "Feudal Japan", type: "green"});
        }
      }
      break;
    }
    case "industrial-revolution": {
      if (!player.promptContext || !player.promptContext.cardId) {
        logMessage(lobbyData, "Industrial Revolution prompt resolved, " +
          "but no card context was found.", "error");
        break;
      }
      const cardId = player.promptContext.cardId;
      const cardInPlayIndex = player.cardsInPlay
          .findIndex((c) => c.id === cardId);

      if (cardInPlayIndex === -1) {
        logMessage(lobbyData, `Industrial Revolution prompt resolved, but card ${cardId} not found in cardsInPlay.`, "error"); // eslint-disable-line max-len
        break;
      }

      const [cardInPlay] = player.cardsInPlay.splice(cardInPlayIndex, 1);
      if (choice) {
        hand.push(cardInPlay);
        logMessage(lobbyData, [
          {type: "player", value: player.name, color: player.color},
          {type: "text", value: " chose to return "},
          {type: "card", value: cardInPlay.name,
            cardType: cardInPlay.type},
          {type: "text", value: " to their hand ("},
          {type: "zone", value: "Industrial Revolution",
            color: "brown"},
          {type: "text", value: ")."},
        ]);
        // If returned card was a perpetual, remove its effect
        if (cardInPlay.type === "P") {
          if (player.perpetuals) {
            for (const key in player.perpetuals) {
              if (Object.prototype
                  .hasOwnProperty.call(player.perpetuals, key)) {
                const perpetualsArray = player.perpetuals[key];
                const cardIndexToRemove = perpetualsArray
                    .findIndex((p) => p.id === cardInPlay.id);
                if (cardIndexToRemove > -1) {
                  perpetualsArray.splice(cardIndexToRemove, 1);
                  break;
                }
              }
            }
          }
        }
      } else {
        if (!lobbyData.discardPile) lobbyData.discardPile = [];
        lobbyData.discardPile.push(cardInPlay);
        logMessage(lobbyData, [
          {type: "player", value: player.name, color: player.color},
          {type: "text", value: " declined to return "},
          {type: "card", value: cardInPlay.name,
            cardType: cardInPlay.type},
          {type: "text", value: " to their hand ("},
          {type: "zone", value: "Industrial Revolution",
            color: "brown"},
          {type: "text", value: ")."},
        ]);
      }
      delete player.promptContext;
      break;
    }
    case "cats": { // From Age of Cats
      if (choice && player.coins >= 10) {
        gainMoney(player, -10, lobbyData, {name: "Age of Cats", type: "yellow"}); // eslint-disable-line max-len
        await promptScore(player, hand, "age-of-cats", lobbyData);
        if (player.prompt) newPromptSet = true;
      }
      break;
    }
    case "greek-america-base-choice": {
      const zone = lobbyData.zones[player.zone];
      if (choice) {
        if (!player.bases) player.bases = [];
        player.bases.push(player.zone);
        logMessage(lobbyData, [
          {type: "player", value: player.name, color: player.color},
          {type: "text", value: " placed a Base in "},
          {type: "zone", value: zone.name, color: zone.color},
          {type: "text", value: " (Greek America)."},
        ]);
        // set prompt
        if (player.handCount > 0) {
          setPlayerPrompt(player, lobbyData, "greek-america-discard-choice");
          newPromptSet = true;
        }
      }
      break;
    }
    case "scientist-enclave": {
      if (choice && player.scoreTrack[1] > 0) {
        // Player chose to retreat a crown for a Gizmo.
        const gizmoCard = lobbyData.gizmoPile.pop();
        if (gizmoCard) {
          hand.push(gizmoCard);
          retreatSpecificCrown(player, 1, lobbyData, {name:
            "Scientist Enclave", type: "green"});
          logMessage(lobbyData, [
            {type: "player", value: player.name, color: player.color},
            {type: "text", value: " retreats a crown to take a "},
            {type: "card", value: "Gizmo", cardType: "M"},
            {type: "text", value: " ("},
            {type: "zone", value: "Scientist Enclave", color: "green"},
            {type: "text", value: ")."},
          ]);
        }
      } else {
        drawCards(player, hand, 2, lobbyData,
            {name: "Scientist Enclave", type: "green"});
      }
      break;
    }
    case "singularity": {
      if (choice && player.coins >= 10) {
        gainMoney(player, -10, lobbyData, {name: "Singularity",
          type: "silver"});
        player.extraTurns = 2;
        logMessage(lobbyData, [
          {type: "player", value: player.name, color: player.color},
          {type: "text", value: " pays "},
          {type: "coin", value: 10},
          {type: "text", value: " to take 2 extra turns ("},
          {type: "zone", value: "Singularity", color: "silver"},
          {type: "text", value: ")."},
        ]);
      }
      break;
    }
    case "toys": { // From Age of Toys
      if (choice && player.coins >= 4) {
        gainMoney(player, -4, lobbyData, {name: "Age of Toys", type: "silver"});
        drawCards(player, hand, 2, lobbyData,
            {name: "Age of Toys", type: "silver"});
        setPlayerPrompt(player, lobbyData, "toys-choice");
        newPromptSet = true;
      }
      break;
    }
    case "age-of-plastic": {
      if (choice === "gain") {
        gainMoney(player, 4, lobbyData, {name:
          "Age of Plastic", type: "brown"});
      } else if (choice === "draw") {
        drawCards(player, hand, 1, lobbyData, {name:
          "Age of Plastic", type: "brown"});
      }
      break;
    }
  }

  player.handCount = hand.length;
  batch.update(privateRef, {hand});

  if (newPromptSet) {
    return {updatePayload: lobbyData, batch};
  }

  player.prompt = "";
  const action = peekStack(lobbyData);
  if (action && action.type === "zone") {
    lobbyData.resolutionStack.pop();
  }

  const result = await checkAnubisAndEndTurn(lobbyId, lobbyData);
  if (result && result.winnerDeclared) {
    const winnerPayload = await declareWinner(lobbyId, lobbyData,
        result.winnerPlayer, result.reason);
    return {updatePayload: {...lobbyData, ...winnerPayload}, batch};
  }

  return {updatePayload: lobbyData, batch};
};
