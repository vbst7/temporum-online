const {logMessage, peekStack} = require("../utils/logHelpers");
const {advanceSpecificCrown, drawCards} = require("../utils/resourceHelpers");
const {
  executeCardFollowUp,
  executeZoneFollowUp,
} = require("../utils/followUpHelpers");
const {
  checkAnubisAndEndTurn,
} = require("../utils/turnManagementHelpers");
const {getFirestore} = require("firebase-admin/firestore");
const {promptScore, promptPlay} = require("../utils/promptingHelpers");

/**
 * Handles the 'advanceCrown' action.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} playerId The ID of the player initiating the action.
 * @param {object} payload The action-specific payload (e.g., { ageIndex: 0 }).
 * @param {object} afterData The current state of the lobby document.
 * @return {object} The updated lobby data, potentially with winner information.
 */
exports.execute = async (lobbyId, playerId, payload, afterData) => {
  const lobbyData = afterData;
  const {ageIndex} = payload;

  const playerIndex = lobbyData.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    logMessage(lobbyData, "Player not found in lobby.", "error");
    return lobbyData;
  }

  const player = lobbyData.players[playerIndex];

  // Ensure player is in the correct state
  if (player.prompt !== "advance") {
    logMessage(lobbyData, "Player cannot advance crowns right now.", "warn");
    return lobbyData;
  }

  // Ensure the age is valid for advancing from (0, 1, 2) and has crowns
  if (ageIndex < 0 || ageIndex > 2 || player.scoreTrack[ageIndex] <= 0) {
    logMessage(lobbyData, `Cannot advance from Age ${ageIndex + 1}.`, "warn");
    return lobbyData;
  }

  // Perform the advance action
  advanceSpecificCrown(player, ageIndex, lobbyData);

  // Check if advancing is complete
  if (player.crowns <= 0 || player.scoreTrack[3] === 10) {
    player.prompt = ""; // Advancing is done
    const promptContext = player.promptContext || {};
    const source = player.promptContext?.source;
    const advancedCount = player.promptContext?.crownCount || 0;

    const messageParts = [
      {type: "player", value: player.name, color: player.color},
      {
        type: "text",
        value: ` advanced ${advancedCount === 1 ? "a" : advancedCount} `, // eslint-disable-line max-len
      },
      {type: "crown"},
    ];
    if (source && source.type !== "score") {
      messageParts.push({type: "text", value: " ("});
      if (source.type && source.name) {
        const sourceType = (source.type === "M" || source.type === "P") ?
          "card" : "zone";
        const logPart = {type: sourceType, value: source.name,
          cardType: source.type};
        if (sourceType === "zone") {
          logPart.color = source.type;
        }
        messageParts.push(logPart);
      } else {
        messageParts.push({type: "text", value: source});
      }
      messageParts.push({type: "text", value: ")"});
    }
    messageParts.push({type: "text", value: "."});
    logMessage(lobbyData, messageParts);

    // --- Post-Play Logic (e.g., for Visionary) ---
    if (source && source.name === "Visionary" && source.type === "M") {
      const db = getFirestore();
      const privateRef = db.collection("lobbies").doc(lobbyId)
          .collection("private").doc(playerId);
      const privateSnap = await privateRef.get();
      const hand = privateSnap.exists ? privateSnap.data().hand : [];

      await promptPlay(player, hand, lobbyData, lobbyId);

      // If promptPlay set a new prompt, we stop here.
      if (player.prompt) {
        player.handCount = hand.length;
        const batch = db.batch();
        batch.update(privateRef, {hand});
        return {updatePayload: lobbyData, batch};
      }
    }
    // --- End Post-Play Logic ---

    // --- Post-Score Logic ---
    if (promptContext.source?.type === "score") {
      const scoredCardId = promptContext.scoredCardId;

      // 1. Secret Society & Meet Younger Self (these modify the hand)
      if ((player.perpetuals?.postScore && player.perpetuals.postScore
          .length > 0) || scoredCardId === "meet-younger-self") {
        const db = getFirestore();
        const privateRef = db.collection("lobbies").doc(lobbyId)
            .collection("private").doc(playerId);
        const privateSnap = await privateRef.get();
        const hand = privateSnap.exists ? privateSnap.data().hand : [];

        const multiplier = promptContext.instruction === "age-of-cats" ? 2 : 1;
        if (player.perpetuals?.postScore) {
          const secretSocietyCount = player.perpetuals.postScore
              .filter((c) => c.id === "secret-society").length;
          if (secretSocietyCount > 0) {
            drawCards(player, hand, secretSocietyCount * multiplier, lobbyData,
                {name: "Secret Society", type: "P"});
          }
        }

        if (scoredCardId === "meet-younger-self") {
          drawCards(player, hand, multiplier, lobbyData,
              {name: "Meet Younger Self", type: "M"});
        }

        player.handCount = hand.length;
        const batch = getFirestore().batch();
        batch.update(privateRef, {hand});
        await batch.commit();
      }

      // 2. Visionary (this sets a new prompt)
      if (scoredCardId === "visionary") {
        const db = getFirestore();
        const privateRef = db.collection("lobbies").doc(lobbyId)
            .collection("private").doc(playerId);
        const privateSnap = await privateRef.get();
        const hand = privateSnap.exists ? privateSnap.data().hand : [];

        await promptScore(player, hand, "", lobbyData);
        // If scored in Age of Cats, we need to score a second time.
        if (promptContext.instruction === "age-of-cats") {
          lobbyData.resolutionStack.push({type: "card", id: "visionary",
            instruction: "score-again"});
        }

        // If promptScore set a new prompt, we stop here.
        if (player.prompt) {
          player.handCount = hand.length;
          const batch = db.batch();
          batch.update(privateRef, {hand});
          return {updatePayload: lobbyData, batch};
        }
      }
    }
    // --- End Post-Score Logic ---

    if (lobbyData.resolutionStack.length > 0) {
      const action = peekStack(lobbyData);
      if (action && action.type === "zone") {
        const turnEnded = await executeZoneFollowUp(player, action.id,
            lobbyData, lobbyId, action.instruction);
        // Follow-up handled the update and turn progression
        if (turnEnded) return {...lobbyData};
      } else if (action && action.type === "card") {
        const turnEnded = await executeCardFollowUp(player, action.id,
            lobbyData, lobbyId, action.instruction);
        if (turnEnded) return {...lobbyData};
      }
    } else {
      // This case should be rare, but if the stack is empty, end the turn.
      checkAnubisAndEndTurn(lobbyId, lobbyData);
      return lobbyData;
    }
  }

  // Update the player object within the main players array.
  lobbyData.players[playerIndex] = player;
  return lobbyData;
};
