import {
  changeHistory,
  declineChangeHistory,
  visitZone,
  scoreCard,
  playCard,
  advanceCrown,
  executeChoice,
  resolveOptionalZone,
  discardAndContinue,
  resolveDiscardForMoney,
  resolveInquisition,
  discardMany, 
  resolveInventor,
  resolveBabylonianChoice,
  resolveGizmoChoice,
  retreatCrown,
  resolvePredictTheFuture,
  selectCyberneticsPerpetual,
  selectCyberneticsHandCard,
  resolveInvestments,
  resolveTreasureMap,
  resolveSunboat,
  resolveTradeGoods,
  resolveToysChoice,
  selectCardToPass,
  returnCard,
  resolveSimulatedParadiseChoice,
  resolveMove,
  resolveSetHQ,
  resolveY2KDiscard,
  choosePostVisit,
  chooseEndOfTurn,
  chooseStartOfTurn,
} from "./firebaseService.js"; // Note: firebaseService.js re-exports prompt.js functions
import { db } from "../firebaseConfig.js"; // Import db directly for fetching private data
import { doc, getDoc } from "firebase/firestore"; // Import doc and getDoc

export const processedPrompts = new Map();

// Store AI's strategic decision for the turn
const aiTurnStrategy = new Map();

/**
 * Delays execution for a given number of milliseconds.
 * @param {number} ms The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clears the processed prompt memory for a specific player.
 * @param {string} playerId The ID of the player to clear.
 */
export function clearAIPromptMemory(playerId) {
  aiTurnStrategy.delete(playerId);
  processedPrompts.delete(playerId);
}

/**
 * Main AI action router. It is called when an AI player has a prompt.
 * @param {object} aiPlayer The AI player object from gameData.
 * @param {object} gameData The full game data object.
 */
export async function runAIAction(aiPlayer, gameData) {
  // Simple debounce: if we've just processed this exact prompt for this AI, skip.
  let promptIdentifier = `${aiPlayer.id}-${aiPlayer.prompt}-${JSON.stringify(aiPlayer.promptContext)}`;
  // For multi-step prompts like 'advance', the context doesn't change, but the player state does.
  // We need to include the changing state in the identifier to avoid getting stuck.
  if (aiPlayer.prompt === 'advance') {
    promptIdentifier += `-crowns:${aiPlayer.crowns}`;
  }
  // For 'play' prompts, especially after playing Trinket, the hand count changes.
  // Including it in the identifier allows the AI to play a second card.
  if (aiPlayer.prompt === 'play') {
    promptIdentifier += `-hand:${aiPlayer.handCount}`;
  }
  // Score prompts (for Visionary)
  if (aiPlayer.prompt === 'score' || aiPlayer.prompt === 'alien-contact') {
    promptIdentifier += `-hand:${aiPlayer.handCount}`;
  }

  if (processedPrompts.get(aiPlayer.id) === promptIdentifier) {
    return;
  }
  processedPrompts.set(aiPlayer.id, promptIdentifier);

  // Add a small delay to make the AI feel less instant.
  await sleep(0);

  const lobbyId = gameData.lobbyId;
  const playerId = aiPlayer.id;

  console.log(`AI [${aiPlayer.name}] is processing prompt: ${aiPlayer.prompt}`);

  // --- Fetch AI's hand ---
  // The AI needs to see its actual hand to make informed decisions.
  // This data is stored in a private subcollection.
  let aiHand = [];
  try {
    const privateHandRef = doc(db, `lobbies/${lobbyId}/private/${playerId}`);
    const handSnap = await getDoc(privateHandRef);
    if (handSnap.exists()) {
      aiHand = handSnap.data().hand || [];
    }
  } catch (error) {
    console.error(`Error fetching AI hand for ${aiPlayer.name}:`, error);
  }
  // Augment aiPlayer with its actual hand for decision making
  aiPlayer.hand = aiHand;
  aiPlayer.handCount = aiHand.length; // Ensure handCount is accurate

  // The big switch for all AI decisions.
  switch (aiPlayer.prompt) {
    case 'anubisVisit':
    case 'visitZone':
      {
        let strategy;
        const canAffordToScore = aiPlayer.scoreableCards && aiPlayer.scoreableCards.length > 0;

        // 1. If the AI has a card it can afford to score, visit the first real zone (scoring zone).
        if (canAffordToScore && gameData.realZones.length > 0) {
          console.log("AI ACTION: visitZone - Can afford to score, visiting first real zone.");
          strategy = 'score';
          await visitZone(lobbyId, playerId, gameData.realZones[0]);
        // 2. If the AI has cards in hand and less than $12, visit the third real zone (playing zone).
        } else if (aiPlayer.hand.length > 0 && aiPlayer.coins < 12 && gameData.realZones.length > 2) {
          console.log("AI ACTION: visitZone - Has cards but low coins, visiting third real zone.");
          strategy = 'play';
          await visitZone(lobbyId, playerId, gameData.realZones[2]);
        // 3. Otherwise (no affordable score, or enough money to play), visit the second real zone (drawing zone).
        } else if (gameData.realZones.length > 1) { // Ensure there's a second real zone
          console.log("AI ACTION: visitZone - Defaulting to drawing cards, visiting second real zone.");
          strategy = 'draw';
          await visitZone(lobbyId, playerId, gameData.realZones[1]);
        } else {
          console.log("AI ACTION: visitZone - Not enough real zones to make a choice, picking first legal.");
          // Fallback strategy
          const fallbackStrategies = ['score', 'draw', 'play'];
          strategy = fallbackStrategies[Math.floor(Math.random() * fallbackStrategies.length)];
          await visitZone(lobbyId, playerId, gameData.legalZones[0]);
        }
        aiTurnStrategy.set(playerId, strategy);
      }
      break;
    case 'score':
    case 'space-age':
      if (aiPlayer.scoreableCards && aiPlayer.scoreableCards.length > 0) {
        const cardIndexToScore = aiPlayer.scoreableCards[0];
        console.log(`AI ACTION: score - choosing card index ${cardIndexToScore}`);
        await scoreCard(lobbyId, playerId, cardIndexToScore);
      } else if (aiPlayer.prompt === 'space-age') {
        // If it's space-age and there are no scoreable cards, decline.
        console.log("AI ACTION: space-age - declining");
        await resolveOptionalZone(lobbyId, playerId, false, 'space-age');
      }
      break;
    case 'play':
      if (aiPlayer.hand.length > 0) {
        const cardIndexToPlay = 0; // Play the first card
        console.log(`AI ACTION: play - choosing card index ${cardIndexToPlay}`);
        await playCard(lobbyId, playerId, cardIndexToPlay);
      }
      break;
    case 'choose':
      {
        let choice = aiTurnStrategy.get(playerId);
        if (!choice) {
          // If for some reason the strategy wasn't set, fall back to random.
          const choices = ['score', 'draw', 'play'];
          choice = choices[Math.floor(Math.random() * choices.length)];
          console.warn(`AI [${aiPlayer.name}] had no strategy for 'choose' prompt. Choosing randomly.`);
        }
        console.log(`AI ACTION: choose - executing stored strategy: '${choice}'`);
        await executeChoice(lobbyId, playerId, choice);
      }
      break;
    case 'discard':
      if (aiPlayer.hand.length > 0) {
        const cardIndexToDiscard = 0; // Discard the first card
        console.log(`AI ACTION: discard - choosing card index ${cardIndexToDiscard}`);
        await discardAndContinue(lobbyId, playerId, cardIndexToDiscard);
      } else {
        // If prompted to discard but has no cards, must still respond.
        console.log("AI ACTION: discard - no cards to discard, sending empty action");
        await discardAndContinue(lobbyId, playerId, -1);
      }
      break;
    case 'discard-n':
      {
        const discardArray = [];
        if (aiPlayer.hand.length >= 2) {
          discardArray.push(0, 1);
        } else if (aiPlayer.hand.length === 1) {
          discardArray.push(0);
        }
        console.log(`AI ACTION: discard-n - choosing cards with indices: [${discardArray.join(', ')}]`);
        await discardMany(lobbyId, playerId, discardArray);
      }
      break;
    case 'discard-many':
      {
        const numToDiscard = Math.floor(Math.random() * (aiPlayer.hand.length + 1));
        // Create an array of the first `numToDiscard` indices: [0, 1, ..., n-1]
        const discardArray = Array.from({ length: numToDiscard }, (_, i) => i);
        console.log(`AI ACTION: discard-many - choosing to discard ${numToDiscard} cards with indices: [${discardArray.join(', ')}]`);
        await discardMany(lobbyId, playerId, discardArray);
      }
      break;
    case 'advance':
      {
        const crownsToAdvance = aiPlayer.crowns;
        if (crownsToAdvance > 0) {
          const advances = [];
          const tempScoreTrack = [...aiPlayer.scoreTrack];

          for (let i = 0; i < crownsToAdvance; i++) {
            const possibleAges = [];
            // Find valid ages to advance from (0, 1, 2)
            for (let j = 0; j < 3; j++) {
              if (tempScoreTrack[j] > 0) {
                possibleAges.push(j);
              }
            }
            if (possibleAges.length > 0) {
              // Simple strategy: always advance from the lowest possible age
              const ageToAdvanceFrom = possibleAges[0];
              advances.push(ageToAdvanceFrom);
              tempScoreTrack[ageToAdvanceFrom]--;
            }
          }
          console.log(`AI ACTION: advance - batch advancing crowns: ${JSON.stringify(advances)}`);
          await advanceCrown(lobbyId, playerId, { advances });
        }
      }
      break;
    case 'retreat':
      {
        const possibleAges = [];
        // Can retreat from Age II, III, IV (indices 1, 2, 3)
        for (let i = 1; i < 4; i++) {
          if (aiPlayer.scoreTrack[i] > 0) {
            possibleAges.push(i);
          }
        }
        if (possibleAges.length > 0) {
          const ageToRetreatFrom = possibleAges[Math.floor(Math.random() * possibleAges.length)];
          console.log(`AI ACTION: retreat - retreating from age index ${ageToRetreatFrom}`);
          await retreatCrown(lobbyId, playerId, ageToRetreatFrom);
        } else {
          console.log("AI ACTION: retreat - no valid crowns to advance, this may be an issue.");
        }
      }
      break;
    case 'changeHist':
      {
        const shouldChange = Math.random() > 0.5;
        if (shouldChange) {
          console.log("AI ACTION: changeHist - choosing to change history");
          // The zone to change is stored in the promptContext
          const zoneIndex = aiPlayer.promptContext?.zoneIndex;
          if (zoneIndex !== undefined) {
            await changeHistory(lobbyId, playerId, zoneIndex);
          } else {
            console.log("AI ERROR: changeHist prompt without zoneIndex in context. Declining.");
            await declineChangeHistory(lobbyId, playerId);
          }
        } else {
          console.log("AI ACTION: changeHist - choosing to decline");
          await declineChangeHistory(lobbyId, playerId);
        }
      }
      break;
    case 'alien-contact':
      const cardIndexToScore = aiPlayer.handCount;
      console.log(`AI ACTION: alien-contact - choosing to score`);
      await scoreCard(lobbyId, playerId, cardIndexToScore - 1); // Alien contact card is the last one drawn, so it's hand.length - 1
      break;
    case 'ancient-greece':
      {
        // If hand is large (>=6), decline. Otherwise, pay to draw (if can afford)
        if (aiPlayer.hand.length >= 6 || aiPlayer.coins < 4) {
          console.log("AI ACTION: ancient-greece - paying $4 to draw");
          await resolveOptionalZone(lobbyId, playerId, false, 'ancient-greece');
        } else {
          console.log("AI ACTION: ancient-greece - declining");
          await resolveOptionalZone(lobbyId, playerId, true, 'ancient-greece');
        }
      }
      break;
    case 'singularity-choice':
    case 'greek-america-base-choice':
      {
        console.log(`AI ACTION: optional zone '${aiPlayer.prompt}' - always choosing true`);
        await resolveOptionalZone(lobbyId, playerId, true, aiPlayer.prompt);
      }
      break;
    case 'singularity-choice':
    case 'scientist-enclave':
      {
        const choice = Math.random() > 0.5;
        console.log(`AI ACTION: optional zone '${aiPlayer.prompt}' - choosing ${choice}`);
        await resolveOptionalZone(lobbyId, playerId, choice, aiPlayer.prompt);
      }
      break;
    case 'age-of-plastic':
      {
        const { canGainMoney, canDrawCard } = aiPlayer.promptContext;
        let choice;

        if (canGainMoney && !canDrawCard) {
          choice = 'gain';
        } else if (!canGainMoney && canDrawCard) {
          choice = 'draw';
        } else if (canGainMoney && canDrawCard) {
          // If both are possible, consult the turn strategy
          const strategy = aiTurnStrategy.get(playerId);
          // 'score' or 'play' strategies prefer money, 'draw' prefers cards
          choice = (strategy === 'score' || strategy === 'play') ? 'gain' : 'draw';
        } else {
          // Fallback, though this state should not be reachable.
          choice = 'gain';
        }
        console.log(`AI ACTION: age-of-plastic - choosing '${choice}'`);
        await resolveOptionalZone(lobbyId, playerId, choice, 'age-of-plastic');
      }
      break;
    case 'feudal-japan':
      console.log("AI ACTION: feudal-japan - declining for now");
      await resolveOptionalZone(lobbyId, playerId, false, 'feudal-japan');
      break;
    case 'industrial-revolution':
      {
        const cardId = aiPlayer.promptContext?.cardId;
        const cardInPlay = aiPlayer.cardsInPlay?.find(c => c.id === cardId);
        if (cardInPlay) {
          // Choose 'yes' to return Momentary cards to hand, 'no' for Perpetuals.
          const choice = cardInPlay.type === 'M';
          console.log(`AI ACTION: industrial-revolution - card is ${cardInPlay.type}, choosing to return: ${choice}`);
          await resolveOptionalZone(lobbyId, playerId, choice, 'industrial-revolution');
        } else {
          // Fallback if card isn't found for some reason.
          console.warn("AI ACTION: industrial-revolution - Could not find card in play. Defaulting to decline.");
          await resolveOptionalZone(lobbyId, playerId, false, 'industrial-revolution');
        }
      }
      break;
    case 'inquisition': // Existing logic, kept as is
      {
        if (aiPlayer.handCount === 0) {
          console.log("AI ACTION: inquisition - choosing to discard (no cards in hand)");
          await resolveInquisition(lobbyId, playerId, -1);
        } else if (aiPlayer.handCount >= 6 && aiPlayer.coins >= 2) {
          console.log("AI ACTION: inquisition - hand is large, choosing to discard card 0");
          await resolveInquisition(lobbyId, playerId, 0);
        } else {
          console.log("AI ACTION: inquisition - choosing to lose $2");
          await resolveInquisition(lobbyId, playerId, null);
        }
      }
      break;
    case 'inventor':
      console.log("AI ACTION: inventor - choosing 'draw' for now");
      await resolveInventor(lobbyId, playerId, 'draw');
      break;
    case 'investments-choice':
      {
        const shouldDiscard = (aiPlayer.moneyGainedThisTurn || 0) >= 12;
        if (shouldDiscard) {
          console.log("AI ACTION: investments-choice - choosing to discard for money");
          await resolveInvestments(lobbyId, playerId, true);
        } else {
          console.log("AI ACTION: investments-choice - declining");
          await resolveInvestments(lobbyId, playerId, false);
        }
      }
      break;
    case 'cats':
      console.log("AI ACTION: cats - paying $10");
      await resolveOptionalZone(lobbyId, playerId, true, 'age-of-cats');
      break;
    case 'toys':
      console.log("AI ACTION: toys - paying $4");
      await resolveOptionalZone(lobbyId, playerId, true, 'age-of-toys');
      break;
    case 'toys-choice':
      {
        // Play the first of the two drawn cards
        const cardIndexToPlay = aiPlayer.hand.length - 2;
        console.log(`AI ACTION: toys-choice - playing card index ${cardIndexToPlay}`);
        await resolveToysChoice(lobbyId, playerId, cardIndexToPlay);
      }
      break;
    case 'greek-america-discard-choice':
    case 'imperial-china':
      {
        // If hand is large (>=6), discard. Otherwise, decline (if no cards or low hand)
        if (aiPlayer.hand.length >= 6) {
          console.log("AI ACTION: imperial-china - hand is large, choosing to discard card 0");
          await resolveDiscardForMoney(lobbyId, playerId, 0, aiPlayer.prompt === 'imperial-china' ? 'imperial-china' : 'greek-america');
        } else {
          console.log("AI ACTION: imperial-china - declining");
          await resolveOptionalZone(lobbyId, playerId, false, aiPlayer.prompt === 'imperial-china' ? 'imperial-china' : 'greek-america-discard-choice');
        }
      }
      break;
    case 'predict-the-future':
      console.log("AI ACTION: predict-the-future - declining for now");
      await resolvePredictTheFuture(lobbyId, playerId, false);
      break;
    case 'retreat': // Existing logic, kept as is
      {
        const possibleAges = [];
        for (let i = 1; i < 4; i++) {
          if (aiPlayer.scoreTrack[i] > 0) {
            possibleAges.push(i);
          }
        }
        if (possibleAges.length > 0) {
          const ageToRetreatFrom = possibleAges[Math.floor(Math.random() * possibleAges.length)];
          console.log(`AI ACTION: retreat - retreating from age index ${ageToRetreatFrom}`);
          await retreatCrown(lobbyId, playerId, ageToRetreatFrom);
        } else {
          console.log("AI ACTION: retreat - no valid crowns to retreat, this may be an issue.");
        }
      }
      break;
    case 'y2k-discard':
      {
        // AI will always decline to discard for Y2K for now.
        console.log("AI ACTION: y2k-discard - declining");
        await resolveY2KDiscard(lobbyId, playerId, { cardIndex: null });
      }
      break;
    case 'inquisition':
      {
        // Simple logic: if hand is large or has few coins, discard. Otherwise, lose coins.
        if (aiPlayer.handCount > 5 || aiPlayer.coins < 4) {
          console.log("AI ACTION: inquisition - choosing to discard card 0");
          await resolveInquisition(lobbyId, playerId, { cardIndex: 0 });
        } else {
          console.log("AI ACTION: inquisition - choosing to lose coins");
          await resolveInquisition(lobbyId, playerId, { cardIndex: null });
        }
      }
      break;
    case 'treasure-map-choice':
      console.log("AI ACTION: treasure-map-choice - accept");
      await resolveTreasureMap(lobbyId, playerId, true);
      break;
    case 'cybernetics-perpetual':
      {
        // Select the first available perpetual card
        let selectedPerpetualId = null;
        if (aiPlayer.perpetuals) {
          for (const key in aiPlayer.perpetuals) {
            if (aiPlayer.perpetuals[key].length > 0) {
              selectedPerpetualId = aiPlayer.perpetuals[key][0].id;
              break;
            }
          }
        }
        if (selectedPerpetualId) {
          console.log(`AI ACTION: cybernetics-perpetual - selecting ${selectedPerpetualId}`);
          await selectCyberneticsPerpetual(lobbyId, playerId, selectedPerpetualId);
        } else {
          console.log("AI ACTION: cybernetics-perpetual - no perpetuals to select, this may be an issue.");
          // Fallback: if no perpetuals, clear prompt to avoid hang.
          // This might need a specific "decline" action if available.
        }
      }
      break;
    case 'cybernetics-hand':
      {
        // Select the first card in hand to play as the perpetual
        if (aiPlayer.hand.length > 0) {
          const cardIndex = 0;
          console.log(`AI ACTION: cybernetics-hand - selecting card index ${cardIndex}`);
          await selectCyberneticsHandCard(lobbyId, playerId, cardIndex);
        } else {
          console.log("AI ACTION: cybernetics-hand - no cards in hand, this may be an issue.");
          // Fallback: if no cards, clear prompt to avoid hang.
        }
      }
      break;
    case 'pass-card':
      {
        // Pass the first card in hand
        if (aiPlayer.hand.length > 0) {
          const cardIndex = 0;
          console.log(`AI ACTION: pass-card - passing card index ${cardIndex}`);
          await selectCardToPass(lobbyId, playerId, cardIndex);
        } else {
          console.log("AI ACTION: pass-card - no cards to pass, sending -1");
          await selectCardToPass(lobbyId, playerId, -1); // Indicate no card to pass
        }
      }
      break;
    case 'simulatedChoice':
      {
        const zoneIndex = gameData.legalZones[0];
        console.log(`AI ACTION: simulatedChoice - choosing zone index ${zoneIndex}`);
        await resolveSimulatedParadiseChoice(lobbyId, playerId, zoneIndex);
      }
      break;
    case 'gizmo-choice':
      {
        const momentaryCards = aiPlayer.hand.map((c, i) => ({ card: c, index: i })).filter(c => c.card.type === 'M' && c.card.id !== 'gizmo');
        if (momentaryCards.length > 0) {
          const choice = momentaryCards[Math.floor(Math.random() * momentaryCards.length)];
          console.log(`AI ACTION: gizmo-choice - choosing to play ${choice.card.name}`);
          await resolveGizmoChoice(lobbyId, playerId, choice.index);
        } else {
          console.log("AI ACTION: gizmo-choice - no momentary cards to choose.");
          // This state shouldn't be reachable if Gizmo was played correctly.
        }
      }
      break;
    case 'babylonian-choice':
      {
        const choice = aiPlayer.coins >= 10 && Math.random() > 0.3; // 70% chance to accept if can afford
        console.log(`AI ACTION: babylonian-choice - choosing ${choice}`);
        await resolveBabylonianChoice(lobbyId, playerId, { choice });
      }
      break;
    case 'trade-goods-choice':
      {
        const choices = ['draw', 'gain', 'draw-gain'];
        const choice = choices[Math.floor(Math.random() * choices.length)];
        console.log(`AI ACTION: trade-goods-choice - choosing ${choice}`);
        await resolveTradeGoods(lobbyId, playerId, choice);
      }
      break;
    case 'move':
    case 'set-hq':
      {
        if (gameData.legalZones && gameData.legalZones.length > 0) {
          const zoneIndex = gameData.legalZones[Math.floor(Math.random() * gameData.legalZones.length)];
          console.log(`AI ACTION: ${aiPlayer.prompt} - choosing zone index ${zoneIndex}`);
          aiPlayer.prompt === 'move' ? await resolveMove(lobbyId, playerId, zoneIndex) : await resolveSetHQ(lobbyId, playerId, zoneIndex);
        }
      }
      break;
    case 'sunboat-choice':
      {
        const choice = Math.random() < 0.9; // 90% chance to accept
        console.log(`AI ACTION: sunboat-choice - choosing ${choice}`);
        await resolveSunboat(lobbyId, playerId, choice);
      }
      break;
    case 'return-card':
      {
        if (aiPlayer.hand.length > 0) {
          const cardIndex = Math.floor(Math.random() * aiPlayer.hand.length);
          console.log(`AI ACTION: return-card - returning card at index ${cardIndex}`);
          await returnCard(lobbyId, playerId, cardIndex);
        } else {
          console.log("AI ACTION: return-card - no cards to return.");
        }
      }
      break;
    case 'post-visit-choice':
    case 'end-of-turn-choice':
    case 'start-of-turn-choice':
      {
        const choices = aiPlayer.promptContext?.choices;
        if (choices && choices.length > 0) {
          const randomChoice = choices[Math.floor(Math.random() * choices.length)];
          console.log(`AI ACTION: ${aiPlayer.prompt} - choosing '${randomChoice.label}'`);

          // The payload for start-of-turn choices can be more complex if it's a secret card.
          // For now, we assume it's a simple choiceId.
          const payload = { choiceId: randomChoice.id };

          switch (aiPlayer.prompt) {
            case 'post-visit-choice':
              await choosePostVisit(lobbyId, playerId, payload);
              break;
            case 'end-of-turn-choice':
              await chooseEndOfTurn(lobbyId, playerId, payload);
              break;
            case 'start-of-turn-choice':
              await chooseStartOfTurn(lobbyId, playerId, payload);
              break;
          }
        } else {
          console.warn(`AI ACTION: ${aiPlayer.prompt} - no choices available.`);
        }
      }
      break;
    default:
      // TODO: AI logic for optional zones and other choices. For now, many can probably default to declining.
      console.log(`AI ACTION: Default/unhandled prompt: ${aiPlayer.prompt}`);
      break;
  }
}
