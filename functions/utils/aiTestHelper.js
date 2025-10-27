const logger = require("firebase-functions/logger");

/**
 * For a test AI, determines the next action based on its prompt.
 * @param {object} aiPlayer The AI player object.
 * @param {string} lobbyId The ID of the lobby.
 * @return {object|null} A pendingAction payload or null if no action is taken.
 */
function runAITestAction(aiPlayer, lobbyId) {
  // --- Test Runner Logic ---
  // If the AI has a script, make sure the prompt matches the next action from it.
  if (!aiPlayer.script || aiPlayer.script.length === 0 && aiPlayer.prompt !== "test") {
    logger.warn(`Scripted AI [${aiPlayer.name}] in lobby [${lobbyId}] has a prompt '${aiPlayer.prompt}' but its script is empty. The test may be stuck.`);
    return null;
  }

  switch (aiPlayer.prompt) {
    case "test":
    {
      logger.info(`AI [${aiPlayer.name}] in lobby [${lobbyId}] has 'test' prompt, dispatching EVALUATE_TEST action.`);
      return {
        type: "EVALUATE_TEST",
        uid: aiPlayer.id,
        payload: {},
        actionId: `EVALUATE_TEST-${Date.now()}`,
      };
    }
    case "anubisVisit":
    case "visitZone":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "visitZone") {
        logger.warn(`AI [${aiPlayer.name}] has prompt '${aiPlayer.prompt}' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "VISIT_ZONE",
        uid: aiPlayer.id,
        payload: {zoneIndex: scriptAction.zoneIndex},
        actionId: `VISIT_ZONE-${Date.now()}`,
      };
    }
    case "simulatedChoice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "simulatedChoice") {
        logger.warn(`AI [${aiPlayer.name}] has prompt '${aiPlayer.prompt}' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_SIMULATED_PARADISE_CHOICE",
        uid: aiPlayer.id,
        payload: {zoneIndex: scriptAction.zoneIndex},
        actionId: `RESOLVE_SIMULATED_PARADISE_CHOICE-${Date.now()}`,
      };
    }
    case "play":
    {
      return {
        type: "PLAY_CARD",
        uid: aiPlayer.id,
        payload: {cardIndex: 0}, // Always play the first card
        actionId: `PLAY_CARD-${Date.now()}`,
      };
    }
    case "gizmo-choice":
    {
      return {
        type: "RESOLVE_GIZMO_CHOICE",
        uid: aiPlayer.id,
        payload: {cardIndex: 0}, // Always play the first card
        actionId: `RESOLVE_GIZMO_CHOICE-${Date.now()}`,
      };
    }
    case "alien-contact":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type === "scoreCard") {
        return {
          type: "SCORE_CARD",
          uid: aiPlayer.id,
          // The card from Alien Contact is the last one drawn.
          // The test script can specify the index, but we default to the only scoreable one.
          payload: {cardIndex: scriptAction.cardIndex ?? aiPlayer.scoreableCards?.[0] ?? 0},
          actionId: `SCORE_CARD-${Date.now()}`,
        };
      } else if (scriptAction?.type === "resolveOptionalZone") {
        return {
          type: "RESOLVE_OPTIONAL_ZONE",
          uid: aiPlayer.id,
          payload: {choice: scriptAction.choice, zoneId: "alien-contact"},
          actionId: `RESOLVE_OPTIONAL_ZONE-${Date.now()}`,
        };
      }
      logger.warn(`AI [${aiPlayer.name}] has prompt 'alien-contact' but script action is '${scriptAction?.type}'. Cannot act.`);
      return null;
    }
    case "score":
    {
      const scriptAction = aiPlayer.script?.[0];
      // If the script explicitly says to score a card, use that.
      if (scriptAction?.type === "scoreCard") {
        return {
          type: "SCORE_CARD",
          uid: aiPlayer.id,
          payload: {cardIndex: scriptAction.cardIndex},
          actionId: `SCORE_CARD-${Date.now()}`,
        };
      }
      // Otherwise, for deterministic testing, score the first scoreable card.
      return {
        type: "SCORE_CARD",
        uid: aiPlayer.id,
        payload: {cardIndex: aiPlayer.scoreableCards?.[0] ?? 0},
        actionId: `SCORE_CARD-${Date.now()}`,
      };
    }
    case "discard":
    {
      return {
        type: "DISCARD_AND_CONTINUE", // This is the action for a single discard
        uid: aiPlayer.id,
        payload: {cardIndex: 0}, // Always discard the first card
        actionId: `DISCARD_AND_CONTINUE-${Date.now()}`,
      };
    }
    case "discard-many":
    case "discard-n":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "discardMany") {
        logger.warn(`AI [${aiPlayer.name}] has prompt '${aiPlayer.prompt}' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      const discardArray = scriptAction.discardArray;
      return {
        type: "DISCARD_MANY",
        uid: aiPlayer.id,
        payload: {discardArray},
        actionId: `DISCARD_MANY-${Date.now()}`,
      };
    }
    case "choose":
    {
      const choice = aiPlayer.script?.[0]?.choice;
      return {
        type: "CHOOSE_ACTION",
        uid: aiPlayer.id,
        payload: {choice},
        actionId: `CHOOSE_ACTION-${Date.now()}`,
      };
    }
    case "feudal-japan":
    case "ancient-greece":
    case "space-age":
    case "cats":
    case "singularity-choice":
    case "toys":
    case "industrial-revolution":
    case "greek-america-base-choice":
    case "scientist-enclave-choice":
    case "age-of-plastic":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveOptionalZone") {
        logger.warn(`AI [${aiPlayer.name}] has prompt '${aiPlayer.prompt}' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_OPTIONAL_ZONE",
        uid: aiPlayer.id,
        payload: {choice: scriptAction.choice, zoneId: scriptAction.zoneId},
        actionId: `RESOLVE_OPTIONAL_ZONE-${Date.now()}`,
      };
    }
    case "imperial-china": // This is now a "discard for money" prompt
    case "greek-america-discard-choice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveDiscardForMoney") {
        logger.warn(`AI [${aiPlayer.name}] has prompt '${aiPlayer.prompt}' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      const cardIndex = scriptAction.cardIndex;
      // If cardIndex is null, it means decline, which is handled by a different action type.
      if (cardIndex === null) {
        return {type: "RESOLVE_OPTIONAL_ZONE", uid: aiPlayer.id, payload: {choice: false, zoneId: aiPlayer.prompt}, actionId: `RESOLVE_OPTIONAL_ZONE-${Date.now()}`};
      }
      return {
        type: "RESOLVE_DISCARD_FOR_MONEY",
        uid: aiPlayer.id,
        payload: {cardIndex, sourceZoneId: scriptAction.sourceZoneId},
        actionId: `RESOLVE_DISCARD_FOR_MONEY-${Date.now()}`,
      };
    }
    case "inquisition":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveInquisition") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'inquisition' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      const cardIndex = scriptAction.cardIndex;
      return {
        type: "RESOLVE_INQUISITION",
        uid: aiPlayer.id,
        payload: {cardIndex},
        actionId: `RESOLVE_INQUISITION-${Date.now()}`,
      };
    }
    case "y2k-discard":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveY2KDiscard") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'y2k-discard' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      const cardIndex = scriptAction.cardIndex;
      return {
        type: "RESOLVE_Y2K_DISCARD",
        uid: aiPlayer.id,
        payload: {cardIndex},
        actionId: `RESOLVE_Y2K_DISCARD-${Date.now()}`,
      };
    }
    case "babylonian-choice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveBabylonianChoice") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'babylonian-choice' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      const choice = scriptAction.choice;
      return {
        type: "RESOLVE_BABYLONIAN_CHOICE",
        uid: aiPlayer.id,
        payload: {choice},
        actionId: `RESOLVE_BABYLONIAN_CHOICE-${Date.now()}`,
      };
    }
    case "inventor":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveInventor") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'inventor' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_INVENTOR",
        uid: aiPlayer.id,
        payload: {choice: scriptAction.choice},
        actionId: `RESOLVE_INVENTOR-${Date.now()}`,
      };
    }
    case "investments-choice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveInvestments") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'investments-choice' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_INVESTMENTS",
        uid: aiPlayer.id,
        payload: {choice: scriptAction.choice},
        actionId: `RESOLVE_INVESTMENTS-${Date.now()}`,
      };
    }
    case "predict-the-future":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolvePredictTheFuture") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'predict-the-future' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_PREDICT_THE_FUTURE",
        uid: aiPlayer.id,
        payload: {choice: scriptAction.choice},
        actionId: `RESOLVE_PREDICT_THE_FUTURE-${Date.now()}`,
      };
    }
    case "pass-card":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "passCard") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'pass-card' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      const cardIndex = scriptAction.cardIndex;
      return {
        type: "SELECT_CARD_TO_PASS",
        uid: aiPlayer.id,
        payload: {cardIndex},
        actionId: `SELECT_CARD_TO_PASS-${Date.now()}`,
      };
    }
    case "changeHist":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type === "changeHistory") {
        return {
          type: "CHANGE_HISTORY",
          uid: aiPlayer.id,
          payload: {zoneIndex: scriptAction.zoneIndex},
          actionId: `CHANGE_HISTORY-${Date.now()}`,
        };
      } else if (scriptAction?.type === "declineChangeHistory") {
        return {
          type: "DECLINE_CHANGE_HISTORY",
          uid: aiPlayer.id,
          payload: {},
          actionId: `DECLINE_CHANGE_HISTORY-${Date.now()}`,
        };
      }
      // Default behavior: if not scripted, the test AI will decline to change history.
      logger.info(`AI [${aiPlayer.name}] has 'changeHist' prompt but no matching script. Defaulting to decline.`);
      return {
        type: "DECLINE_CHANGE_HISTORY",
        uid: aiPlayer.id,
        payload: {},
        actionId: `DECLINE_CHANGE_HISTORY-${Date.now()}`,
      };
      return null;
    }
    case "advance":
    {
      const scriptAction = aiPlayer.script?.[0];
      // If the script explicitly says to advance, use that.
      if (scriptAction?.type === "advanceCrown") {
        return {
          type: "ADVANCE_CROWN",
          uid: aiPlayer.id,
          payload: {ageIndex: scriptAction.ageIndex},
          actionId: `ADVANCE_CROWN-${Date.now()}`,
        };
      }

      logger.warn(`AI [${aiPlayer.name}] has 'advance' prompt but no valid crowns to advance. Cannot act.`);
      return null;
    }
    case "retreat":
    {
      const scriptAction = aiPlayer.script?.[0];
      // If the script explicitly says to retreat, use that.
      if (scriptAction?.type === "retreatCrown") {
        return {
          type: "RETREAT_CROWN",
          uid: aiPlayer.id,
          payload: {ageIndex: scriptAction.ageIndex},
          actionId: `RETREAT_CROWN-${Date.now()}`,
        };
      }

      logger.warn(`AI [${aiPlayer.name}] has 'retreat' prompt but no valid crowns to retreat. Cannot act.`);
      return null;
    }
    case "cybernetics-perpetual":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "selectCyberneticsPerpetual") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'cybernetics-perpetual' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "SELECT_CYBERNETICS_PERPETUAL",
        uid: aiPlayer.id,
        payload: {perpetualCardId: scriptAction.perpetualCardId},
        actionId: `SELECT_CYBERNETICS_PERPETUAL-${Date.now()}`,
      };
    }
    case "cybernetics-hand":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "selectCyberneticsHandCard") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'cybernetics-hand' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "SELECT_CYBERNETICS_HAND_CARD",
        uid: aiPlayer.id,
        payload: {handCardIndex: scriptAction.handCardIndex},
        actionId: `SELECT_CYBERNETICS_HAND_CARD-${Date.now()}`,
      };
    }
    case "toys-choice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveToysChoice") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'toys-choice' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_TOYS_CHOICE",
        uid: aiPlayer.id,
        payload: {chosenCardIndex: scriptAction.chosenCardIndex},
        actionId: `RESOLVE_TOYS_CHOICE-${Date.now()}`,
      };
    }
    case "treasure-map-choice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveTreasureMap") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'treasure-map-choice' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_TREASURE_MAP",
        uid: aiPlayer.id,
        payload: {choice: scriptAction.choice},
        actionId: `RESOLVE_TREASURE_MAP-${Date.now()}`,
      };
    }
    case "trade-goods-choice":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "resolveTradeGoods") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'trade-goods-choice' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_TRADE_GOODS",
        uid: aiPlayer.id,
        payload: {choice: scriptAction.choice},
        actionId: `RESOLVE_TRADE_GOODS-${Date.now()}`,
      };
    }
    case "move":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "move") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'move' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_MOVE",
        uid: aiPlayer.id,
        payload: {zoneIndex: scriptAction.zoneIndex},
        actionId: `RESOLVE_MOVE-${Date.now()}`,
      };
    }
    case "set-hq":
    {
      const scriptAction = aiPlayer.script?.[0];
      if (scriptAction?.type !== "setHq") {
        logger.warn(`AI [${aiPlayer.name}] has prompt 'set-hq' but script action is '${scriptAction?.type}'. Cannot act.`);
        return null;
      }
      return {
        type: "RESOLVE_SET_HQ",
        uid: aiPlayer.id,
        payload: {zoneIndex: scriptAction.zoneIndex},
        actionId: `RESOLVE_SET_HQ-${Date.now()}`,
      };
    }
    default:
      logger.warn(`AI [${aiPlayer.name}] has unhandled prompt: ${aiPlayer.prompt}`);
      return null;
  }
}

module.exports = {
  runAITestAction,
};
