import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { user, gameData, localPlayerHand } from "./state.js";
import { runAIAction, clearAIPromptMemory } from "./aiService.js";

const functions = getFunctions();

let runAITestCallable;

// Store listeners by lobbyId to manage multiple concurrent listeners (for test suites)
const lobbyListeners = new Map();
const oldPlayersData = new Map();

/**
 * A generic helper to dispatch a pending action to Firestore.
 * @param {string} lobbyId The ID of the lobby.
 * @param {string} type The action type.
 * @param {object} [payload={}] The action-specific payload.
 * @param {string} [actingPlayerId=null] The ID of the player performing the action, if different from the authenticated user (for AI).
 */
export async function dispatchAction(lobbyId, type, payload = {}, actingPlayerId = null) {
  if (!user.value) {
    console.error("User not authenticated.");
    return;
  }

  const lobbyRef = doc(db, "lobbies", lobbyId);
  await updateDoc(lobbyRef, {
    pendingAction: {
      type,
      uid: actingPlayerId || user.value.uid,
      payload,
      actionId: `${type}-${Date.now()}`,
      timestamp: serverTimestamp(),
    },
  });
}

export async function createLobby(nickName, testConfig = {}) {
  if (!user.value) {
    console.error("User not authenticated.");
    return null;
  }

  try {
    const createLobbyCallable = httpsCallable(functions, "createLobby");
    runAITestCallable = httpsCallable(functions, "runAITest");
    const result = await createLobbyCallable({ nickName, ...testConfig });
    return result.data.lobbyId;
  } catch (error) {
    console.error("Error creating lobby:", error);
    alert("Failed to create lobby: " + error.message);
    return null;
  }
}

/**
 * Initiates an automated AI test by creating a special lobby.
 * @param {object} testConfig The configuration for the automated test.
 * @returns {Promise<string>} The ID of the created test lobby.
 */
export async function runAITest(testConfig) {
  try {
    if (!runAITestCallable) {
      runAITestCallable = httpsCallable(functions, "runAITest");
    }
    const result = await runAITestCallable({ testConfig });
    return result.data; // Should contain { lobbyId: "..." }
  } catch (error) {
    console.error("Error running AI test:", error);
    throw error;
  }
}

/**
 * Sets up a real-time listener for a specific lobby document.
 * @param {string} lobbyId The ID of the lobby to listen to.
 * @param {import('vue').Ref<Set<string>> | null} onlinePlayerIdsRef A Vue ref to store online player IDs, or null if not needed.
 * @param {(data: object | null) => void} [onUpdateCallback=null] An optional callback to run on each update, used by the test suite.
 */
export function listenToLobby(lobbyId, onlinePlayerIdsRef, onUpdateCallback = null) {
  if (!lobbyId) {
    // If we are trying to listen to a null/empty lobby, ensure the main gameData is cleared.
    // This happens when a user leaves a lobby.
    gameData.value = null;
    localPlayerHand.value = [];
    return;
  }

  // If already listening to this lobby, don't create a new listener.
  if (lobbyListeners.has(lobbyId)) {
    return;
  }

  let unsubscribeLobby = null;
  let unsubscribeHand = null;
  let sessionUnsubscribe = null;

  const lobbyRef = doc(db, "lobbies", lobbyId);
  unsubscribeLobby = onSnapshot(lobbyRef, (docSnap) => {
    const data = docSnap.exists() ? docSnap.data() : null;

    // --- Test Suite Callback ---
    if (onUpdateCallback) {
      onUpdateCallback(data);
    }

    // --- Main Game Data Update ---
    // Only update the main gameData if this is the lobby the user is "in".
    if (onlinePlayerIdsRef) { // onlinePlayerIdsRef is only passed for the active game screen
      gameData.value = data;
    }

    if (docSnap.exists()) {
      // --- AI State Tracking & Trigger Logic ---
      // Get the state from the *previous* snapshot before doing anything else.
      const oldPlayers = oldPlayersData.get(lobbyId) || {};

      // --- AI Trigger Logic ---
      // This block MUST run before oldPlayersData is updated.
      // It compares the new `data` with the `oldPlayers` state from the previous snapshot.
      // Only run client-side AI if it's a regular game (NOT a test) and the current user is the host.
      // The `!data.isTest` check is the crucial part to prevent interference with automated tests.
      const isClientAIRunner = data.status === 'in-progress' && !data.isTest && 
                               user.value && data.ownerId === user.value.uid;
      if (isClientAIRunner) {
          data.players.forEach(player => {
              const oldPlayerState = oldPlayers[player.id];
              // If it's a new turn for an AI player, clear its prompt memory to prevent debouncing issues.
              if (player.isAI && player.turn && (!oldPlayerState || !oldPlayerState.turn)) {
                  clearAIPromptMemory(player.id);
              }
              // Trigger AI if it's an AI and it has a prompt.
              if (player.isAI && player.prompt) {
                  runAIAction(player, data);
              }
          });
      }

      // Now that the logic has run using the old state, update the state for the *next* snapshot.
      const newPlayersById = data.players.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      oldPlayersData.set(lobbyId, newPlayersById);

      // If the lobby exists but has no players, it's effectively closed.
      const isPlayerInLobby = user.value && data.players?.some(p => p.id === user.value.uid);
      // A spectator is someone connected to the lobby who is not in the players list.
      // This can be the host or just someone who joined to watch.
      const isSpectator = user.value && !isPlayerInLobby;

      // This handles the case where the last player leaves/resigns.
      if (data.players && data.players.length === 0) {
        console.log("Lobby is empty, treating as closed.");
        localPlayerHand.value = [];
        gameData.value = null;
        exitLobby(lobbyId, false);
      } else if (onlinePlayerIdsRef) { // Only set up sub-listeners for the active game
        // If the user is a player or a spectator, set up presence listeners.
        if (isPlayerInLobby || isSpectator) {
          // Only set up session listener if it doesn't exist AND it's needed (i.e., not in test mode).
          if (!sessionUnsubscribe && onlinePlayerIdsRef) {
            const sessionRef = doc(db, `lobbies/${lobbyId}/sessions/${user.value.uid}`);
            setDoc(sessionRef, { online: true });

            const sessionsColRef = collection(db, `lobbies/${lobbyId}/sessions`);
            sessionUnsubscribe = onSnapshot(sessionsColRef, (snapshot) => {
              // The ref is checked again inside, but the outer check prevents the listener from being attached at all.
              if (onlinePlayerIdsRef) {
                onlinePlayerIdsRef.value = new Set(snapshot.docs.map(doc => doc.id));
              }
            });
          }

          // Set up the listener for the player's private hand data, only if they are a player.
          // Spectators should not listen for hand data.
          if (!unsubscribeHand) {
            const privateHandRef = doc(db, `lobbies/${lobbyId}/private/${user.value.uid}`);
            unsubscribeHand = onSnapshot(privateHandRef, (handDoc) => {
              localPlayerHand.value = handDoc.exists() ? handDoc.data().hand || [] : [];
            }
            );
          }
        }
      }
    } else {
      console.warn(`Lobby ${lobbyId} does not exist or was deleted.`);
      localPlayerHand.value = [];
      gameData.value = null;
      stopListeningToLobby(lobbyId); // The lobby is gone, so stop listening.
    }
  });

  // Store all unsubscribe functions for this lobby
  lobbyListeners.set(lobbyId, {
    unsubscribeLobby,
    unsubscribeHand,
    sessionUnsubscribe,
  });
}

/**
 * Stops listening to a specific lobby and cleans up its resources.
 * @param {string} lobbyId The ID of the lobby to stop listening to.
 */
export function stopListeningToLobby(lobbyId) {
  const listeners = lobbyListeners.get(lobbyId);
  if (listeners) {
    listeners.unsubscribeLobby?.();
    listeners.unsubscribeHand?.();
    listeners.sessionUnsubscribe?.();
    lobbyListeners.delete(lobbyId);
    oldPlayersData.delete(lobbyId);
    console.log(`Stopped listening to lobby ${lobbyId}`);
  }
}

export async function joinLobby(lobbyId, nickName) {
  await dispatchAction(lobbyId.toUpperCase(), "JOIN_LOBBY", { nickName });
}

export async function exitLobby(lobbyId, dispatch = true) {
  // Unsubscribe from listeners immediately on the client side.
  // This prevents a race condition where the backend removes the player's permissions
  // before the client's snapshot listener has a chance to react to the document change.
  stopListeningToLobby(lobbyId);
  gameData.value = null;
  localPlayerHand.value = [];

  if (dispatch) {
    await dispatchAction(lobbyId, "LEAVE_LOBBY");
  }
}

/**
 * Allows a spectator to leave a test lobby, which may trigger its deletion on the backend.
 * @param {string} lobbyId The ID of the test lobby.
 */
export async function leaveTestLobby(lobbyId) {
  // The backend `endTurn` logic for tests should handle the `deleteMe: true` flag.
  // The client just needs to perform a standard exit.
  await exitLobby(lobbyId);
}
export async function startGame(lobbyId) {
  await dispatchAction(lobbyId, "START_GAME");
}

export async function addAIPlayer(lobbyId) {
  await dispatchAction(lobbyId, "ADD_AI");
}

export async function removePlayer(lobbyId, playerIdToRemove) {
  await dispatchAction(lobbyId, "REMOVE_PLAYER", { playerIdToRemove });
}

export async function removeSpectator(lobbyId, spectatorIdToRemove) {
  await dispatchAction(lobbyId, "REMOVE_SPECTATOR", { spectatorIdToRemove });
}

export async function replacePlayerWithAI(lobbyId, playerIdToReplace) {
  await dispatchAction(lobbyId, "REPLACE_PLAYER", { playerIdToReplace });
}

export async function becomeSpectator(lobbyId) {
  await dispatchAction(lobbyId, "BECOME_SPECTATOR");
}

export async function updateSelectedZone(lobbyId, index, zoneName) {
  await dispatchAction(lobbyId, "UPDATE_ZONE", { index, zoneName });
}

export async function updateTimeline(lobbyId, zones) {
  await dispatchAction(lobbyId, "UPDATE_TIMELINE", { zones });
}

export async function updateInitialCard(lobbyId, playerId, cardName) {
  await dispatchAction(lobbyId, "UPDATE_INITIAL_CARD", { playerId, cardName });
}

export async function toggleTestMode(lobbyId, enabled) {
  await dispatchAction(lobbyId, "TOGGLE_TEST_MODE", { enabled });
}

export async function selectPlayerColor(lobbyId, playerId, color) {
  await dispatchAction(lobbyId, "CHANGE_COLOR", { color, playerId });
}

export async function updateAlternateRealities(lobbyId, enabled) {
  await dispatchAction(lobbyId, "UPDATE_ALTERNATE_REALITIES", { enabled });
}

export async function resignGame(lobbyId, playerId) {
  // Resigning from an in-progress game is handled by replacing the player with an AI,
  // or ending the game if they are the last human. The 'REPLACE_PLAYER' action handles this logic.

  // Immediately stop listening and clear local game data so the user is returned to the home screen.
  stopListeningToLobby(lobbyId);
  gameData.value = null;
  localPlayerHand.value = [];

  await dispatchAction(lobbyId, "REPLACE_PLAYER", { playerIdToReplace: playerId });
}