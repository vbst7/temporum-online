const {getFirestore} = require("firebase-admin/firestore");
const {logMessage} = require("./logHelpers");
const {setPlayerPrompt, promptDiscard,
  promptVisit} = require("./promptingHelpers");
const {stealMoney, drawCards,
  crowdedness, gainMoney, discardCard} = require("./resourceHelpers");
const {executeChangeHistoryHelper} = require("./gameLogicHelpers");

/**
 * Executes a single end-of-turn effect based on its ID.
 * This function centralizes the logic for all end-of-turn effects.
 * @param {object} effect The effect object from the queue.
 * @param {object} player The player whose turn is ending.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 */
async function executeEndOfTurnEffect(effect, player, lobbyData, lobbyId) {
  switch (effect.cardId) {
    case "step-on-a-butterfly": {
      logMessage(lobbyData, [
        {type: "card", value: "Step on a Butterfly", cardType: "M"},
        {type: "text", value: " effect activated."},
      ]);
      let db = null;
      // Only get a db instance if a zone that needs it (like Endless City)
      // is present in the timeline.
      const timeIVZones = lobbyData.zones.slice(6, 10);
      if (timeIVZones.some((z) => z.id === "endless-city")) {
        db = getFirestore();
      }
      await executeChangeHistoryHelper(lobbyData, 0, db, lobbyId);
      await executeChangeHistoryHelper(lobbyData,
          lobbyData.realZones[1], db, lobbyId);
      await executeChangeHistoryHelper(lobbyData,
          lobbyData.realZones[2], db, lobbyId);
      break;
    }
    case "predict-the-future": {
      const playerToPrompt = lobbyData.players
          .find((p) => p.id === effect.playerId);
      if (playerToPrompt) {
        setPlayerPrompt(playerToPrompt, lobbyData, "predict-the-future",
            {zoneIndex: player.zone});
      }
      break;
    }
    case "investments":
      setPlayerPrompt(player, lobbyData, "investments-choice",
          {id: effect.id});
      break;
    case "hideout":
      player.crowns = 1;
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 1, source: {name: "Hideout", type: "P"}});
      break;
    case "sunboat-of-ra":
      if (!player.extraTurns || player.extraTurns === 0) {
        setPlayerPrompt(player, lobbyData, "sunboat-choice",
            {id: effect.id});
      }
      break;
    case "poison-token": {
      const poisonIndex = player.poison.findIndex((item) =>
        effect.id === `poison-${item.turn}`);
      if (poisonIndex > -1) {
        const poison = player.poison[poisonIndex];
        if (poison.value === 1) {
          player.poison[poisonIndex] = 0; // Mark as inert for one turn
        } else { // poison is 0 or undefined
          stealMoney(player, 4, lobbyData, {name: "Poison", type: "purple"});
          promptDiscard(player, lobbyData, {name: "Poison", type: "purple"});
          player.poison.splice(poisonIndex, 1);
        }
      }
      break;
    }
  }
}

/**
 * Executes a single post-visit effect based on its ID.
 * This function centralizes the logic for all post-visit effects.
 * @param {object} effect The effect object from the queue.
 * @param {object} lobbyData The current lobby data.
 */
async function executePostVisitEffect(effect, lobbyData) {
  switch (effect.cardId) {
    case "anubis-statuette": {
      logMessage(lobbyData, "Anubis Statuette effect triggered.");
      const anubisPlayer = lobbyData.players
          .find((p) => p.id === effect.playerId);
      if (!anubisPlayer.visitedZones) anubisPlayer.visitedZones = [];
      const allZoneIndices = lobbyData.zones.map((_, index) => index);
      lobbyData.legalZones = allZoneIndices.filter((index) =>
        !anubisPlayer.visitedZones.includes(index));
      logMessage(lobbyData, [
        {type: "player", value: anubisPlayer.name, color: anubisPlayer.color},
        {type: "text", value: " can visit any unvisited zone."},
      ]);
      anubisPlayer.active = true;
      await promptVisit(anubisPlayer, lobbyData, "anubisVisit");
      break;
    }
    case "treasure-map": {
      const playerToPrompt = lobbyData.players
          .find((p) => p.id === effect.playerId);
      if (playerToPrompt) {
        const perpetual = playerToPrompt.perpetuals.postVisit
            .find((p) => p.id === effect.cardId);
        setPlayerPrompt(playerToPrompt, lobbyData, "treasure-map-choice",
            {id: perpetual?.instanceId || effect.cardId});
      }
      break;
    }
    case "university": {
      // get the player's hand
      const db = getFirestore();
      const playerToPrompt = lobbyData.players
          .find((p) => p.id === effect.playerId);
      if (playerToPrompt) {
        const privateRef = db.collection("lobbies").doc(lobbyData.lobbyId)
            .collection("private").doc(playerToPrompt.id);
        const privateSnap = await privateRef.get();
        const hand = privateSnap.exists ? privateSnap.data().hand : [];

        drawCards(playerToPrompt, hand, 1, lobbyData,
            {name: "University", type: "P"});
        if (hand.length > 0) {
          promptDiscard(playerToPrompt, lobbyData,
              {name: "University", type: "P"});
        }
        await privateRef.update({hand});
      }
      break;
    }
    case "maneuver": {
      const playerToPrompt = lobbyData.players
          .find((p) => p.id === effect.playerId);
      if (playerToPrompt) {
        const legalMoveZones = lobbyData.realZones
            .filter((zoneIdx) => zoneIdx !== playerToPrompt.zone);
        if (legalMoveZones.length > 0) {
          lobbyData.legalZones = legalMoveZones;
          setPlayerPrompt(playerToPrompt, lobbyData, "move",
              {source: {name: "Maneuver", type: "M"}});
        }
      }
      break;
    }
  }
}

/**
 * Executes a single start-of-turn effect based on its ID.
 * This function centralizes the logic for all end-of-turn effects.
 * @param {object} effect The effect object from the queue.
 * @param {object} player The player whose turn is ending.
 * @param {object} lobbyData The current lobby data.
 */
async function executeStartOfTurnEffect(effect, player, lobbyData) {
  switch (effect.cardId) {
    case "cold-war": {
      if (crowdedness(player, lobbyData.players) === 0) {
        gainMoney(player, 4, lobbyData, {name:
          "Cold War", type: "brown"});
      }
      lobbyData.zones[player.zone].applied = true;
      break;
    }
    case "dark-ages": {
      promptDiscard(player, lobbyData, {name: "Dark Ages", type: "green",
        origin: "start-of-turn"});
      lobbyData.zones[player.zone].applied = true;
      break;
    }
    case "secret-decline": {
      player.secretDeclined = true;
    }
  }
}

/**
 * Handles the effect of a Secret Card
 * @param {object} player The player who discarded the Secret Card.
 * @param {int} secretIndex The index of the secret card in hand
 * @param {object} lobbyData The current lobby data.
 * @param {object} lobbyId The current lobby id.
 */
async function handleSecretCard(player, secretIndex, lobbyData, lobbyId) {
  // Fetch player hand
  const db = getFirestore();
  const batch = db.batch();
  const playerId = player.id;
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(playerId);
  const privateSnap = await privateRef.get();
  const hand = privateSnap.exists ? privateSnap.data().hand : [];

  // Discard the secret card
  const card = hand[secretIndex];
  discardCard(player, hand, secretIndex, lobbyData);

  switch (card.id) {
    case "secret-mission": {
      // move to a real Time
      const legalMoveZones = lobbyData.realZones.filter((zoneIdx) =>
        zoneIdx !== player.zone);
      if (legalMoveZones.length > 0) {
        lobbyData.legalZones = legalMoveZones;
        setPlayerPrompt(player, lobbyData, "move",
            {source: {name: "Secret Mission", type: "M"},
              origin: "start-of-turn"});
      }
      break;
    }
    case "secret-plot": {
      // advance one of your ♛
      setPlayerPrompt(player, lobbyData, "advance",
          {crownCount: 1, source: {name: "Secret Plot", type: "M"},
            origin: "start-of-turn"});
      break;
    }
    case "secret-stash": {
      // gain $4.
      gainMoney(player, 4, lobbyData, {name: "Secret Stash", type: "M"});
      break;
    }
    case "secret-weapon": {
      logMessage(lobbyData, `${player.name} will rule a Time this 
        turn from Secret Weapon.`);
      player.secretWeapon = true;
      // pick a Time and rule it this turn
      break;
    }
  }

  // Update the player's hand in the database
  player.handCount = hand.length;
  batch.update(privateRef, {hand: hand});
  return batch;
}

module.exports = {
  executeEndOfTurnEffect,
  executePostVisitEffect,
  executeStartOfTurnEffect,
  handleSecretCard,
};
