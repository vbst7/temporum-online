const {logMessage, peekStack} = require("./logHelpers");
const {drawCards, gainMoney, doesPlayerRuleAge, timesRuled,
  crowdedness, advanceSpecificCrown,
  getAgeIndexFromPlayerZone, stealMoney} = require("./resourceHelpers");
const {setPlayerPrompt} = require("./promptingHelpers");
const {executeChangeHistoryHelper,
  playSpecificCard, removeHourglass} = require("./gameLogicHelpers");
const {getFirestore} = require("firebase-admin/firestore");
const {visitChoiceZone, visitAgeI, visitAgeII,
  visitAgeIV} = require("./promptingHelpers");

// Forward declarations for functions that have circular dependencies.
// These will be set via `initializeHelpers` in initHelpers.js.
let executeCardFollowUp;
let executeZoneFollowUp;
let processPostVisitQueue;
let promptDiscard; // eslint-disable-line no-unused-vars
let promptScore;
let promptPlay;
let promptVisit; // eslint-disable-line no-unused-vars
let visitSpecificZone;

/**
 * Executes the second part of a card's instructions after an intermediate
 * action.
 * @param {object} player The active player.
 * @param {string} cardId The ID of the card to resolve.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} [specialInstruction=null] Any special followup instruction.
 * @param {object} [options={}] Optional parameters.
 * @return {boolean} True if the turn flow was handled false otherwise.
 */
const _executeCardFollowUp = async function(player, cardId, lobbyData, lobbyId,
    specialInstruction = null, options = {}) {
  let hand;
  if (options.updatedHand) {
    hand = options.updatedHand;
  } else {
    const db = getFirestore();
    const privateRef = db.collection("lobbies").doc(lobbyId)
        .collection("private").doc(player.id);
    const privateSnap = await privateRef.get();
    hand = privateSnap.exists ? privateSnap.data().hand : [];
  }

  // If a new prompt was set for ANY player by the card's effect
  // (e.g., Infected Rat), the action is not yet complete.
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
  if (anyPlayerHasPrompt) {
    return {turnEnded: false, hand: hand};
  }
  // The card's immediate effects are done. Pop its action from the stack.
  lobbyData.resolutionStack.pop();

  const cardInPlayIndex = player.cardsInPlay.findIndex((c) => c.id === cardId);
  const underlyingAction = peekStack(lobbyData);

  if (cardInPlayIndex === -1) {
    logMessage(lobbyData, `Card follow-up mismatch: card ${cardId} not found ` +
      `in cardsInPlay.`, "error");
    // Card not found, but we popped the action. Continue to avoid a hang.
  } else {
    const [cardInPlay] = player.cardsInPlay.splice(cardInPlayIndex, 1);

    // --- Generic Replay Logic (e.g., for Gizmo) ---
    if (underlyingAction?.type === "play-twice" &&
      underlyingAction.instruction === "first-play") {
      logMessage(lobbyData, [
        {type: "card", value: cardInPlay.name, cardType: cardInPlay.type},
        {type: "text", value: " is played a second time ("},
        {type: "card", value: underlyingAction.sourceCard.name,
          cardType: underlyingAction.sourceCard.type},
        {type: "text", value: ")."},
      ]);
      lobbyData.resolutionStack.pop(); // Pop 'first-play' marker.
      // Immediately play the card again and return to prevent normal discard.
      return await playSpecificCard(player, hand,
          cardInPlay, lobbyData, lobbyId);
    }

    // Draw a card per Gang of Pickpockets in play,
    // minus one if it was just played
    let newGoP = 0;
    if (player.GOP === true) {
      player.GOP = false;
      newGoP = 1;
    }
    if (player.perpetuals && player.perpetuals.postPlay) {
      const GoPCount = player.perpetuals.postPlay
          .filter((c) => c.id === "gang-of-pickpockets").length;
      drawCards(player, hand, GoPCount - newGoP, lobbyData,
          {name: "Gang of Pickpockets", type: "P"});
    }

    // Advance a crown per Revolutionaries in play,
    // minus one if it was just played
    let newRevs = 0;
    if (player.newRevolutionaries === true) {
      player.newRevolutionaries = false;
      newRevs = 1;
    }
    if (player.perpetuals && player.perpetuals.postPlay) {
      const revsCount = player.perpetuals.postPlay
          .filter((c) => c.id === "revolutionaries").length;
      if (player.scoreTrack[1] > 0 && (revsCount - newRevs) > 0) {
        advanceSpecificCrown(player, 1, lobbyData,
            {name: "Revolutionaries", type: "P"});
      }
    }

    let shouldDiscard = cardInPlay.type === "M";
    let shouldReturnToHand = false;
    let shouldReturnToPile = false;

    // Exception 1: Bag of Loot is never discarded. It stays in hand.
    if (cardId === "bag-of-loot") {
      shouldDiscard = false;
      shouldReturnToHand = true;
    }

    // Exception 2: Industrial Revolution when ruling
    if (underlyingAction?.id === "industrial-revolution") {
      const ageIndex = getAgeIndexFromPlayerZone(player.zone);
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        // Player rules, so they get a choice. Don't discard yet.
        shouldDiscard = false;
        const promptContext = {cardId: cardInPlay.id,
          cardName: cardInPlay.name};
        setPlayerPrompt(player, lobbyData, "industrial-revolution", promptContext); // eslint-disable-line max-len
        // The card is temporarily put back into cardsInPlay.
        player.cardsInPlay.push(cardInPlay);
        return {turnEnded: false, hand: hand};
      }
    }

    // Exception 3: Gizmo & Trade Goods
    if (cardInPlay.id === "gizmo" || cardInPlay.id === "trade-goods") {
      shouldDiscard = false;
      shouldReturnToPile = true;
    }

    if (shouldReturnToHand) {
      hand.push(cardInPlay);

      logMessage(lobbyData, [
        {type: "card", value: cardInPlay.name,
          cardType: cardInPlay.type},
        {type: "text", value: " returns to "},
        {type: "player", value: player.name, color: player.color},
        {type: "text", value: "'s hand."},
      ]);
    } else if (shouldReturnToPile) {
      switch (cardInPlay.id) {
        case "gizmo":
          if (!lobbyData.gizmoPile) lobbyData.gizmoPile = [];
          lobbyData.gizmoPile.push(cardInPlay);
          break;
        case "trade-goods":
          if (!lobbyData.tradeGoodsPile) lobbyData.tradeGoodsPile = [];
          lobbyData.tradeGoodsPile.push(cardInPlay);
          break;
      }

      logMessage(lobbyData, [
        {type: "card", value: cardInPlay.name,
          cardType: cardInPlay.type},
        {type: "text", value: " returns to its pile."},
      ]);
    } else if (shouldDiscard) {
      if (!lobbyData.discardPile) lobbyData.discardPile = [];
      lobbyData.discardPile.push(cardInPlay);
    }
    // If not discarded/returned, it's a perpetual. It's removed from
    // cardsInPlay and will be handled separately.
  }
  if (cardId === "visionary" && specialInstruction === "score-again") {
    await promptScore(player, hand, "", lobbyData);
    // The prompt was set, so we can return.
    return {turnEnded: false, hand: hand};
  }

  // Now, check if this card was played as part of a zone action.
  if (underlyingAction?.type === "zone") { // eslint-disable-line no-unused-vars
    return executeZoneFollowUp(player, underlyingAction.id, lobbyData, lobbyId,
        underlyingAction.instruction, {playedCardId: cardId,
          updatedHand: hand});
  }
  if (underlyingAction?.type === "card") { // eslint-disable-line no-unused-vars
    return executeCardFollowUp(player, underlyingAction.id, lobbyData,
        lobbyId, underlyingAction.instruction, {updatedHand: hand});
  }
  // After all card follow-ups, re-process the post-visit queue.
  await processPostVisitQueue(lobbyId, lobbyData);
  // The game loop will handle the next step if a prompt was set or turn ended.
  return {turnEnded: false, hand: hand};
};

/**
 * Executes the second part of a zone's instructions after an intermediate
 * action (like scoring) is complete.
 * @param {object} player The active player.
 * @param {string} zoneId The ID of the zone to resolve.
 * @param {object} lobbyData The current lobby data.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} [specialInstruction=null] Any special instruction for the
 * follow-up.
 * @param {object} [options={}] Object containing hand
 * @return {boolean} True if the turn flow was handled (e.g., ended)
 */
const _executeZoneFollowUp = async function(player,
    zoneId, lobbyData, lobbyId, // eslint-disable-line no-unused-vars
    specialInstruction = null, options = {}) {
  const zone = lobbyData.zones.find((z) => z.id === zoneId);
  if (!zone) {
    logMessage(lobbyData, `Zone not found for follow-up: ${zoneId}`,
        "error");
    return false;
  }

  const db = getFirestore();
  const privateRef = db.collection("lobbies").doc(lobbyId)
      .collection("private").doc(player.id);
  let hand; // eslint-disable-line no-unused-vars
  if (options.updatedHand) {
    hand = options.updatedHand;
  } else {
    // Fetch the active player's hand, as many follow-ups need it.
    const privateSnap = await privateRef.get();
    hand = privateSnap.exists ? privateSnap.data().hand : [];
  }


  const ageIndex = getAgeIndexFromPlayerZone(player.zone);

  switch (zoneId) {
    case "ancient-egypt": {
      if (doesPlayerRuleAge(player, ageIndex,
          lobbyData.players) && ageIndex === 0) {
        if (player.scoreTrack[0] > 0) {
          advanceSpecificCrown(player, 0,
              lobbyData, {name: "Ancient Egypt", type: "yellow"});
        }
      }
      break;
    }
    case "stone-age": {
      let coins = 0;
      if (player.scoreTrack[0] === 0) coins += 2;
      if (player.scoreTrack[1] === 0) coins += 2;
      if (player.scoreTrack[2] === 0) coins += 2;
      if (player.scoreTrack[3] === 0) coins += 2;
      gainMoney(player, coins, lobbyData, {name: "Stone Age", type: "yellow"});
      break;
    }
    case "late-jurassic": {
      executeChangeHistoryHelper(lobbyData, 0);
      break;
    }
    case "ice-age": {
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id && lobbyData.zones[otherPlayer.zone]) {
          const otherPlayerAgeIndex = getAgeIndexFromPlayerZone(otherPlayer.zone); // eslint-disable-line max-len
          if (doesPlayerRuleAge(player, otherPlayerAgeIndex, lobbyData.players)) { // eslint-disable-line max-len
            stealMoney(otherPlayer, 3, lobbyData,
                {name: "Ice Age", type: "yellow"});
          }
        }
      }
      break;
    }
    case "ancient-greece": {
      if (player.coins >= 4) {
        setPlayerPrompt(player, lobbyData, "ancient-greece");
      }
      break;
    }
    // Alternate Age I
    case "trojan-war": {
      stealMoney(player, player.coins, lobbyData,
          {name: "Trojan War", type: "yellow"});
      drawCards(player, hand, 1, lobbyData,
          {name: "Trojan War", type: "yellow"});
      break;
    }
    case "age-of-atlantis": {
      // Score a card. Move your HQ to any Zone. When you visit the
      // Zone with your HQ, gain $2 first.
      const allZoneIndices = lobbyData.zones.map((_, index) => index);
      lobbyData.legalZones = allZoneIndices;
      setPlayerPrompt(player, lobbyData, "set-hq");
      break;
    }
    case "alien-egypt": {
      // If you have $100 or more, you win. Otherwise, either gain $8
      // or score a card.
      break;
    }
    case "babylonian-bazaar": {
      // Score a card. ⧖: Each player may pay $10 to draw 2 cards
      // and advance 2 of their ♛.
      if (specialInstruction === "choice") {
        // this is the final play
        lobbyData.resolutionStack.pop();
        break;
      }
      // A player must be prompted
      if (specialInstruction !== "") {
        lobbyData.resolutionStack.pop();
        const playerToPrompt = lobbyData.players[parseInt(specialInstruction)];
        setPlayerPrompt(playerToPrompt, lobbyData, "babylonian-choice");
        // A prompt was set for another player
        return {turnEnded: false, hand: hand};
      }
      if (removeHourglass(player, lobbyData)) {
        const playerIndex = lobbyData.players
            .findIndex((p) => p.id === player.id);
        const numPlayers = lobbyData.players.length;
        const playersToPrompt = [];
        for (let i = 0; i < numPlayers; i++) {
          const nextPlayerIndex = (playerIndex + i) % numPlayers;
          if (lobbyData.players[nextPlayerIndex].coins >= 10) {
            playersToPrompt.push(nextPlayerIndex);
          }
        }
        console.log(playersToPrompt);
        if (playersToPrompt.length > 0) {
          // set this up for the last follow-up
          lobbyData.resolutionStack.push({type: "zone",
            id: "babylonian-bazaar", instruction: "choice"});

          for (let i = playersToPrompt.length - 1; i >= 1; i--) {
            console.log("Pushing a player prompt");
            lobbyData.resolutionStack.push({
              type: "zone", id: "babylonian-bazaar",
              instruction: playersToPrompt[i],
            });
          }
          // prompt the first player
          const playerToPrompt =
            lobbyData.players[parseInt(playersToPrompt[0])];
          setPlayerPrompt(playerToPrompt, lobbyData, "babylonian-choice");
        }
      }
      break;
    }
    case "bronze-age": {
      // Score a card. If you did, gain $1 per ♛ you have here.
      break;
    }
    case "dawn-of-man": {
      // Score a card. Each player (including you) advances a ♛
      // of theirs from Time I.
      for (const allPlayer of lobbyData.players) {
        if (allPlayer.scoreTrack[0] > 0) {
          advanceSpecificCrown(allPlayer, 0, lobbyData,
              {name: "Dawn of Man", type: "yellow"},
          );
        }
      }
      break;
    }
    case "kingdom-of-trilobites": {
      // Score a card. After you may change history here, you may
      // in Time II, then may in Time III.
      break;
    }
    case "neolithic-renaissance": {
      // Score a card. ⧖: Each player draws until they have 3 cards
      // in hand.
      break;
    }
    // --- Age II
    case "imperial-china": {
      if (player.handCount > 0) {
        setPlayerPrompt(player, lobbyData, "imperial-china");
      }
      break;
    }
    case "pax-buddha": {
      // This effect targets all players,
      // so we must fetch each other player's hand.
      const batch = db.batch();
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id) {
          const playerRef = db.collection("lobbies").doc(lobbyId)
              .collection("private").doc(otherPlayer.id);
          const playerSnap = await playerRef.get();
          const playerHand = playerSnap.exists ? playerSnap.data().hand : [];

          // Use the centralized drawCards helper to handle logging,
          // reshuffling, and perpetuals like Explorer.
          drawCards(otherPlayer, playerHand, 1, lobbyData,
              {name: "Pax Buddha", type: "white"});
          batch.update(playerRef, {hand: playerHand});
        }
      }
      await batch.commit();
      // the current player draws a card as well
      drawCards(player, hand, 1, lobbyData,
          {name: "Pax Buddha", type: "white"});
      break;
    }
    // --- Age III
    case "age-of-discovery": {
      gainMoney(player, player.scoreTrack[ageIndex], lobbyData,
          {name: "Age of Discovery", type: "brown"});
      break;
    }
    case "balloon-revolution": {
      const balloonCoins = (2 * crowdedness(player, lobbyData.players));
      gainMoney(player, balloonCoins, lobbyData,
          {name: "Balloon Revolution", type: "brown"});
      break;
    }
    case "american-civil-war": {
      gainMoney(player, timesRuled(player, lobbyData.players) * 2, lobbyData, // eslint-disable-line max-len
          {name: "American Civil War", type: "brown"});
      break;
    } // eslint-disable-line no-unused-labels
    case "plutocracy": {
      if (specialInstruction === "advance") {
        lobbyData.resolutionStack.pop();
        break;
      }
      let maxCoins = 0;
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id) {
          if (otherPlayer.coins > maxCoins) maxCoins = otherPlayer.coins;
        }
      }
      if (player.coins > maxCoins) {
        lobbyData.resolutionStack.push({type: "zone", id: "plutocracy",
          instruction: "advance"});
        player.crowns = 1;
        setPlayerPrompt(player, lobbyData, "advance", {crownCount: 1,
          source: {name: "Plutocracy", type: zone.color}});
      }
      break;
    }
    case "prohibition-era": {
      gainMoney(player, 2, lobbyData, {name: "Prohibition Era", type: "brown"});
      for (const allPlayer of lobbyData.players) {
        if (doesPlayerRuleAge(allPlayer, ageIndex, lobbyData.players)) {
          gainMoney(allPlayer, 1, lobbyData,
              {name: "Prohibition Era", type: "brown"});
        }
      }
      break;
    }
    case "great-depression": {
      for (const allPlayer of lobbyData.players) {
        if (allPlayer.zone < 6) {
          stealMoney(allPlayer, 2, lobbyData,
              {name: "Great Depression", type: "white"});
        }
      }
      break;
    }
    case "bureaucracy": {
      if (specialInstruction === "retreat") {
        lobbyData.resolutionStack.pop();
        break;
      }
      let retreating = false;
      for (const otherPlayer of lobbyData.players) {
        if (otherPlayer.id !== player.id && otherPlayer.coins >= 12) {
          const canRetreat = otherPlayer.scoreTrack.slice(1)
              .some((c) => c > 0);
          if (canRetreat) {
            setPlayerPrompt(otherPlayer, lobbyData, "retreat",
                {name: "Retreat", type: "brown"});
            retreating = true;
          }
        }
      }
      if (retreating) {
        lobbyData.resolutionStack.push({type: "zone", id: "bureaucracy",
          instruction: "retreat"});
      }
      break;
    }
    case "summer-of-love": {
      for (const allPlayer of lobbyData.players) {
        gainMoney(allPlayer, 2, lobbyData,
            {name: "Summer of Love", type: "white"});
      }
      break;
    }
    case "french-revolution": {
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        drawCards(player, hand, 1, lobbyData,
            {name: "French Revolution", type: "brown"});
      }
      break;
    }
    // Alternate Realities III
    case "age-of-piracy": {
      // Play a card. Players in Time I and II lose $2. If you rule
      // here, gain the lost $.
      let stolen = 0;
      for (const allPlayer of lobbyData.players) {
        if (allPlayer.zone < 4) {
          stolen += stealMoney(allPlayer, 2, lobbyData,
              {name: "Age of Piracy", type: "brown"});
        }
      }
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        gainMoney(player, stolen, lobbyData,
            {name: "Age of Piracy", type: "brown"});
      }
      break;
    }
    case "age-of-plastic": {
      // Play a card. Choose one: Gain $4 if you rule here; or draw a
      // card if you rule Time II.
      const rulesHere = doesPlayerRuleAge(player, ageIndex, lobbyData.players);
      const rulesTimeII = doesPlayerRuleAge(player, 1, lobbyData.players);

      if (rulesHere || rulesTimeII) {
        setPlayerPrompt(player, lobbyData, "age-of-plastic", {
          canGainMoney: rulesHere,
          canDrawCard: rulesTimeII,
        });
      }
      break;
    }
    case "atomic-age": {
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        const legalMoveZones = lobbyData.realZones
            .filter((zoneIdx) => zoneIdx !== player.zone);
        if (legalMoveZones.length > 0) {
          lobbyData.legalZones = legalMoveZones;
          setPlayerPrompt(player, lobbyData, "move");
        }
      }
      break;
    }
    case "cultural-revolution": {
      // Play a card. ⧖: Each player with no ♛ here advances a ♛ of
      //  theirs from Time I to here.
      break;
    }
    case "dutch-golden-age": {
      // Play a card. If you rule here, gain half as much $ as you've
      // gained this turn (round down).
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        const moneyToGain = Math.floor(player.moneyGainedThisTurn / 2);
        gainMoney(player, moneyToGain, lobbyData,
            {name: "Dutch Golden Age", type: "brown"});
      }
      break;
    }
    case "gold-rush": {
      // Play a card. If you're alone here, put $1 from the supply here.
      //  Either way, gain $ equal to the $ here.
      break;
    }
    case "meritocracy": {
      // Play a card. Gain $2 per card you've drawn this turn. When you
      //  advance a ♛, it comes from here if it can.
      break;
    }
    case "new-france": {
      // Play a card. If you rule here, you may put a Base here. Either
      //  way, if you have a Base here, advance one of your ♛.
      break;
    }
    case "pax-britannica": {
      // Play a card. If you have at least 1 ♛ in each Time, gain 4; if
      //  at least 2 ♛, gain 8 instead.
      let minTime = 2;
      for (let i = 0; i<3; i++) {
        if (player.scoreTrack[i] < minTime) {
          minTime = player.scoreTrack[i];
        }
      }
      if (minTime === 2) {
        gainMoney(player, 8, lobbyData,
            {name: "Pax Britannica", type: "brown"},
        );
      } else if (minTime === 1) {
        gainMoney(player, 4, lobbyData,
            {name: "Pax Britannica", type: "brown"},
        );
      }
      break;
    }
    case "rome-eternal": {
      // Play a card. If you rule here, take the
      // Golden Laurels from the supply or the player that has it.
      break;
    }
    case "russian-revolution": {
      // Play a card. If you rule here, each
      // other player retreats a ♛ of theirs from here or later.
      break;
    }
    case "y2k":
      // Play a card. ⧖: Each player may
      // discard a Perpetual card to gain $12.
      if (specialInstruction === "discard") {
        lobbyData.resolutionStack.pop();
        break;
      }
      if (removeHourglass(player, lobbyData)) {
        let discarding = false;
        for (const p of lobbyData.players) {
          // The client will auto-decline if no perpetuals are in hand.
          if (p.handCount > 0) {
            setPlayerPrompt(p, lobbyData, "y2k-discard");
            discarding = true;
          }
        }
        if (discarding) {
          lobbyData.resolutionStack.push({type: "zone", id: "y2k",
            instruction: "discard"});
        }
      }
      break;

    // Age IV
    case "space-age": {
      if (specialInstruction === "score-again") {
        lobbyData.resolutionStack.pop();
        if (timesRuled(player, lobbyData.players) >= 2) {
          await promptScore(player, hand, "space-age", lobbyData);
        }
      }
      break;
    }
    // --- Age IV
    case "steampunk-empire": {
      if (specialInstruction === "advance") {
        lobbyData.resolutionStack.pop();
        player.crowns = 3; // eslint-disable-line no-magic-numbers
        setPlayerPrompt(player, lobbyData, "advance", {crownCount: 3,
          source: {name: "Steampunk Empire", type: zone.color}});
      }
      break;
    }
    case "icy-wasteland": {
      if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
        for (const otherPlayer of lobbyData.players) {
          if (otherPlayer.id !== player.id) {
            stealMoney(otherPlayer, 2, lobbyData,
                {name: "Icy Wasteland", type: "white"});
          }
        }
      }
      break;
    }
    case "communist-utopia":
      if (specialInstruction === "") break; // First play is done.
      lobbyData.resolutionStack.pop();
      if (player.coins < 12) {
        promptPlay(player, hand, lobbyData, lobbyId);
        return {turnEnded: false, hand: hand};
      }
      break;
    case "robot-uprising": {
      drawCards(player, hand, timesRuled(player, lobbyData.players), lobbyData,
          {name: "Robot Uprising", type: "green"});
      break;
    }
    case "information-age": {
      if (specialInstruction === "") break;
      const infoZone = parseInt(specialInstruction);
      if (player.scoreTrack[infoZone] < 4) break;
      const zoneIndex = lobbyData.realZones[infoZone];
      // if player has already visited that zone
      if (player.visitedZones.includes(zoneIndex)) break;

      visitSpecificZone(player, hand, zoneIndex, lobbyData, lobbyId);
      break;
    }
    case "warm-globe": {
      if (specialInstruction === "") {
        // This is the final play of the Warm Globe sequence.
        // The sequence is over, so we pop the original zone visit from the
        // stack and proceed to end the turn.
        lobbyData.resolutionStack.pop();
        break;
      }
      lobbyData.resolutionStack.pop();
      const playerToPrompt = lobbyData.players[parseInt(specialInstruction)];
      // make sure player's hand wasn't updated (eg. Infected Rat)
      if (playerToPrompt.handCount !== 0) {
        await promptPlay(playerToPrompt, null, lobbyData, lobbyId);
        // A prompt was set for another player
        return {turnEnded: false, hand: hand};
      }
      break;
    }
    // Alternate Realities
    case "floating-cities": {
      if (specialInstruction === "play") {
        lobbyData.resolutionStack.pop();
        promptPlay(player, hand, lobbyData, lobbyId);
        return {turnEnded: false, hand: hand};
      }
      break;
    }
    case "simulated-paradise": {
      const simulatedZoneId = zone?.simulatedZoneId;

      if (simulatedZoneId) {
        const simulatedZone = lobbyData
            .zones.find((z) => z.id === simulatedZoneId);
        if (simulatedZone) {
          lobbyData.resolutionStack.pop();
          lobbyData.resolutionStack.push({type: "zone", id: simulatedZoneId, instruction: ""}); // eslint-disable-line max-len
          logMessage(lobbyData, [
            {type: "zone", value: "Simulated Paradise", color: "silver"},
            {type: "text", value: " is simulating "},
            {type: "zone", value: simulatedZone.name,
              color: simulatedZone.color},
            {type: "text", value: "."},
          ]);
          if (simulatedZone.color === "white") {
            visitChoiceZone(player, lobbyData);
          } else {
            switch (simulatedZone.age) {
              case "1": // Score a card
                await visitAgeI(player, hand,
                    simulatedZone, lobbyData, true);
                break;
              case "2":
                hand = await visitAgeII(player,
                    hand, simulatedZone, lobbyData, true);
                break;
              case "3":
                hand = await promptPlay(player,
                    hand, lobbyData, lobbyId);
                break;
              case "4":
                hand = await visitAgeIV(player,
                    hand, simulatedZone, lobbyData, lobbyId);
                break;
            }
          }
        }
      }
      break;
    }
    case "greek-america": {
      // "Draw 2 cards. If you rule here, you may put a Base here. Either way,
      // if you have a Base here, you may discard a card to gain $6."
      const hasBase = player.bases?.includes(player.zone);
      if (hasBase && player.handCount > 0) {
        setPlayerPrompt(player, lobbyData, "greek-america-discard-choice");
      }
      break;
    }
    case "underground-haven": {
      // "You may discard a card. If you do, gain $12
      // and if you rule here, take the Sage from the
      // supply or the player that has it."
      if (specialInstruction === "sage") {
        lobbyData.resolutionStack.pop();
        gainMoney(player, 12, lobbyData, {name: "Underground Haven",
          type: "silver"});
        if (doesPlayerRuleAge(player, ageIndex, lobbyData.players)) {
          // remove the Sage from other player
          for (const p of lobbyData.players) {
            if (p.perpetuals?.visit) {
              const sageIndex = p.perpetuals.visit
                  .findIndex((c) => c.id === "sage");
              if (sageIndex > -1) {
                p.perpetuals.visit.splice(sageIndex, 1);
                logMessage(lobbyData, [
                  {type: "player", value: player.name, color: player.color},
                  {type: "text", value: " takes the "},
                  {type: "token", value: "Sage", color: "#d2b48c"},
                  {type: "text", value: " from "},
                  {type: "player", value: p.name, color: p.color},
                  {type: "text", value: "."},
                ]);
                break; // Sage is unique, so we can stop looking.
              }
            }
          }
          player.perpetuals.visit.push({id: "sage", name: "Sage"});
        }
      }
      break;
    }
    default:
      // This zone has no follow-up actions.
      break;
  }

  // After potential modifications,
  // update the player's hand count and save the hand.
  player.handCount = hand.length;
  await privateRef.update({hand});

  // Add Treasure Map and University to post-visit queue if applicable
  const zoneAge = parseInt(zone.age);
  if (zoneAge === 4) {
    const tmapCount = player.perpetuals?.postVisit?.filter((c) =>
      c.id === "treasure-map").length || 0;
    if (tmapCount > 0) {
      if (!lobbyData.postVisitQueue) lobbyData.postVisitQueue = [];
      for (let i = 0; i < tmapCount; i++) {
        const tmapQueueCount = lobbyData.postVisitQueue.filter((item) =>
          item.cardId === "treasure-map" && item.playerId === player.id).length;
        lobbyData.postVisitQueue.push({
          id: `tmap-${player.id}-${tmapQueueCount}`,
          label: "Treasure Map",
          cardId: "treasure-map",
          playerId: player.id,
        });
      }
    }
  } else if (zoneAge === 2) {
    const uniCount = player.perpetuals?.postVisit?.filter((c) =>
      c.id === "university").length || 0;
    if (uniCount > 0) {
      if (!lobbyData.postVisitQueue) lobbyData.postVisitQueue = [];
      for (let i = 0; i < uniCount; i++) {
        const uniQueueCount = lobbyData.postVisitQueue.filter((item) =>
          item.cardId === "university" && item.playerId === player.id).length;
        lobbyData.postVisitQueue.push({
          id: `university-${player.id}-${uniQueueCount}`,
          label: "University",
          cardId: "university",
          playerId: player.id,
        });
      }
    }
  }

  // If no new prompt was set for ANY player, the zone is fully resolved.
  const anyPlayerHasPrompt = lobbyData.players.some((p) => p.prompt);
  if (!anyPlayerHasPrompt) {
    // move player back to real zone (in Anubis case)
    // (recalculates ageIndex because player can change zone due to Info Age
    // & Nuclear Wasteland) This should only run when moving from an unreal
    // zone back to the timeline.
    if (player.zone !== undefined && !lobbyData.realZones.includes(player.zone)) { // eslint-disable-line max-len
      player.zone = lobbyData.realZones[parseInt(lobbyData.zones[player.zone]
          .age)-1];
    }

    lobbyData.resolutionStack.pop();
    const underlyingAction = peekStack(lobbyData);

    await processPostVisitQueue(lobbyId, lobbyData);

    // if this zone visit was the primary action of the turn
    if (lobbyData.resolutionStack.length === 0) {
      // All actions are done, let the calling function know.
    }
    // if this zone visit was part of another zone visit
    if (underlyingAction?.type === "zone") {
      const result = await executeZoneFollowUp(player,
          underlyingAction.id, lobbyData, lobbyId,
          underlyingAction.instruction, {updatedHand: hand});
      hand = result.hand; // Capture the updated hand from the recursive call
      if (result.turnEnded) return {turnEnded: true, hand: hand};
    } else if (underlyingAction && underlyingAction.type === "card") {
      const turnEnded = await executeCardFollowUp(player, underlyingAction.id,
          lobbyData, lobbyId, underlyingAction.instruction);
      if (turnEnded) return {turnEnded: true, hand: hand};
    }
  }
  return {turnEnded: false, hand: hand};
};

// Setters for circular dependencies
exports.setExecuteCardFollowUp = (func) => {
  executeCardFollowUp = func;
};
exports.setExecuteZoneFollowUp = (func) => {
  executeZoneFollowUp = func;
};
exports.setProcessPostVisitQueue = (func) => {
  processPostVisitQueue = func;
};
exports.setPromptDiscard = (func) => {
  promptDiscard = func;
};
exports.setPromptScore = (func) => {
  promptScore = func;
};
exports.setPromptPlay = (func) => {
  promptPlay = func;
};
exports.setPromptVisit = (func) => {
  promptVisit = func;
};
exports.setVisitSpecificZone = (func) => {
  visitSpecificZone = func;
};

// Export the functions
exports.executeCardFollowUp = _executeCardFollowUp;
exports.executeZoneFollowUp = _executeZoneFollowUp;
