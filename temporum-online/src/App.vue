<script setup
>import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import logoUrl from './assets/logo.png';
import { doc, getDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import "./services/authService.js"; // Initialize authentication
import {
  gameData,
  user,
  listenToLobby,
  stopListeningToLobby,
  createLobby,
  joinLobby,
  startGame,
  exitLobby,
  addAIPlayer,
  removePlayer,
  updateSelectedZone,
  updateTimeline,
  removeSpectator,
  selectPlayerColor,
  updateInitialCard,
  updateAlternateRealities,
  becomeSpectator,
} from "./services/firebaseService.js";
import { runAITest } from "./services/firebaseService.js"; // This will run a single test from the suite
import testSuite from "./tests/testSuite.js"; // Import the predefined test suite
import { manualTests } from "./tests/manualTests.js"; // Import manual tests
import { db } from "./firebaseConfig.js";
import GameInProgress from './components/GameInProgress.vue';

const isDevelopment = import.meta.env.DEV;

const colorPickerPlayerId = ref(null);
const gameColors = ['red', 'green', 'white', 'pink', 'yellow'];

const lobbyIdInput = ref(localStorage.getItem('temporum_lobbyIdInput') || '');
const nickName = ref(localStorage.getItem('temporum_nickName') || '');
const currentLobbyId = ref("");
const userAlternateRealitiesPreference = ref(localStorage.getItem('temporum_alternateRealitiesPreference') === 'true');

// New state for running the test suite
const testSuiteResults = ref([]);
const isSuiteRunning = ref(false);
const failureDetails = ref(null);

const isSuiteFinished = computed(() => {
  if (!isSuiteRunning.value || testSuiteResults.value.length === 0) {
    return false;
  }
  return testSuiteResults.value.every(
    (result) => result.status !== 'running' && result.status !== 'pending'
  );
});

const recommendedTimelines = {
  'Beginners': ['Ancient Egypt', 'Roman Empire', 'Renaissance', 'Industrial Revolution', 'Balloon Revolution', 'American Civil War', 'Steampunk Empire', 'Age of Toys', 'Robot Uprising', 'Nanotech Wonderland'],
  'Friendly': ['Stone Age', 'Pax Buddha', 'Age of Cults', 'Balloon Revolution', 'Summer of Love', 'Prohibition Era', 'Information Age', 'Utopia', 'Warm Globe', 'Communist Utopia'],
  'Harsh': ['Ice Age', 'Inquisition', 'Plague', 'Bureaucracy', 'Great Depression', 'Police State', 'Savagery', 'Icy Wasteland', 'Nuclear Wasteland', 'Mere Anarchy'],
  'Riches': ['Primitive Paradise', 'Crusades', 'Holy Norse Empire', 'American Civil War', 'Plutocracy', 'Age of Discovery', 'Nanotech Wonderland', 'Age of Cats', 'Age of Toys', 'Warm Globe'],
  'Control': ['Iron Age', 'Roman Empire', 'Egyptian America', 'Prohibition Era', 'American Civil War', 'French Revolution', 'Nuclear Wasteland', 'Space Age', 'Robot Uprising', 'Icy Wasteland'],
};

const alternateTimelines = {
  'Science!': ['Age of Atlantis','Bright Ages','Scientist Enclave','Industrial Revolution','Age of Plastic','Atomic Age','Steampunk Empire','Singularity','Floating Cities','Nuclear Wasteland'],
  'Traders': ['Babylonian Bazaar','Ancient Carthage','Byzantine Empire','Age of Discovery','Y2K','Dutch Golden Age','Scrapyard World','Underground Haven','Endless City','Information Age'],
  //'Nightmare Worlds': ['Trojan War','Mongolian Empire','Dark Ages','Police State','Age of Piracy','Bureaucracy','Mere Anarchy','Zombie Apocalypse','Poison Earth','Robot Uprising'],
  //'Perfect Worlds': ['Neolithic Renaissance','Celtic Paradise','Renaissance','Meritocracy','Pax Britannica','Gold Rush','Utopia','Capitalist Utopia','Robotic Utopia','Communist Utopia'],
  //'Big Time': ['Bronze Age','Tibetan Empire','Scientist Enclave','Pax Britannica','Dutch Golden Age','Plutocracy','Space Age','Floating Cities','Earth United','Green World'],
  //'Control Your Destiny': ['Kingdom of Trilobites','Greek America','Roman Empire','New France','Atomic Age','Rome Eternal','Simulated Paradise','Robotic Utopia','Quiet Planet','Mafia City-States'],
  //'Revolutions': ['Dawn of Man','Viking America','Three Kingdoms','American Civil War','Cultural Revolution','Russian Revolution','Zombie Apocalypse','Savagery','Exodus','Nuclear Wasteland'],
  //'They Walk Among Us': ['Alien Egypt','Amazonian Europe','Greek America','Balloon Revolution','Meritocracy','Age of Plastic','Simulated Paradise','Alien Contact','Age of Superheroes','Age of Cats']
};

const availableTimelineSets = computed(() => {
  if (gameData.value?.alternateRealities) {
    return { ...recommendedTimelines, ...alternateTimelines };
  }
  return recommendedTimelines;
});

async function onSelectTimelineSet(event) {
  const setName = event.target.value;
  let zones;

  if (setName === 'Clear Timeline') {
    zones = Array(10).fill('');
  } else {
    zones = availableTimelineSets.value[setName];
  }

  if (zones) {
    await updateTimeline(currentLobbyId.value, zones);
    // After clearing, reset the dropdown to its default state.
    if (setName === 'Clear Timeline') {
      event.target.value = '';
    }
  }
}
const onlinePlayerIds = ref(new Set());

// Watch for user authentication state changes to restore session
watch(user, (newUser) => {
  if (newUser && !currentLobbyId.value) {
    setupInitialState(newUser.uid);
  }
});

// Watch for lobby changes to manage presence
watch(currentLobbyId, (newLobbyId, oldLobbyId) => {
  // This is the main reactivity hook. When the lobby ID changes,
  // we tell our service to listen to the new document.
  listenToLobby(newLobbyId, onlinePlayerIds);
});
watch(userAlternateRealitiesPreference, (newVal) => localStorage.setItem('temporum_alternateRealitiesPreference', newVal));

watch(nickName, (newVal) => localStorage.setItem('temporum_nickName', newVal));
watch(lobbyIdInput, (newVal) => localStorage.setItem('temporum_lobbyIdInput', newVal));

const ageZoneNames = computed(() => {
    const zonesByAge = gameData.value?.allZoneNamesByAge;
    if (!zonesByAge) return [[], [], [], []];
    // Convert the map object back into an array of arrays for the datalists.
    return Object.keys(zonesByAge)
        .sort() // Sort keys to ensure age1, age2, etc. are in order.
        .map(key => zonesByAge[key]);
});

const allCardNames = computed(() => {
    if (!gameData.value?.allCardNames) return [];
    return gameData.value.allCardNames;
});

const usedColors = computed(() => {
    if (!gameData.value?.players) return new Set();
    // Get all colors used by players other than the one whose picker is open
    const pickerOwnerId = colorPickerPlayerId.value;
    return new Set(
        gameData.value.players
            .filter(p => p.id !== pickerOwnerId && p.color !== 'grey')
            .map(p => p.color)
    );
});

onMounted(() => {
  // Prevent zoom with keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '0')) {
      e.preventDefault();
    }
  });

  // Prevent pinch zoom
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  
  // Prevent wheel zoom
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

async function setupInitialState(userId) {
  try {
    const sessionRef = doc(db, `user_sessions/${userId}`);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      if (sessionData && sessionData.lobbyId) {
        currentLobbyId.value = sessionData.lobbyId;
        console.log(`User re-joined lobby ${currentLobbyId.value}`);
      }
    } else {
      // Ensure no stale lobby ID if session doc is missing
      currentLobbyId.value = "";
    }
  } catch (error) {
    console.error("Error setting up initial state:", error);
  }
}

async function onCreateLobby() {
  // Call the new function and get the ID
  console.log(userAlternateRealitiesPreference.value)
  const newId = await createLobby(nickName.value.trim(), { alternateRealities: userAlternateRealitiesPreference.value });

  // Update the reactive variable
  if (newId) {
    currentLobbyId.value = newId;
  }
}
async function onCreateAIGame() {
  // Create a lobby where the host is a spectator.
  const newId = await createLobby(nickName.value.trim(), { spectate: true, aiPlayerCount: 2, alternateRealities: userAlternateRealitiesPreference.value });

  if (newId) {
    currentLobbyId.value = newId;
  }
}

async function onJoinLobby() {
  // Call the function to add the user to the lobby's document
  await joinLobby(lobbyIdInput.value,nickName.value.trim());
  currentLobbyId.value = lobbyIdInput.value.toUpperCase();
  lobbyIdInput.value = ''; // Clear the input after joining
}

async function onStartGame() {
  // Call the function to start the game in this lobby
  await startGame(currentLobbyId.value);
}

async function onAddAIPlayer() {
  await addAIPlayer(currentLobbyId.value);
}

async function onRemovePlayer(playerId) {
  await removePlayer(currentLobbyId.value, playerId);
}

async function onRemoveSpectator(spectatorId) {
  await removeSpectator(currentLobbyId.value, spectatorId);
}

function toggleColorPicker(playerId) {
    if (colorPickerPlayerId.value === playerId) {
        colorPickerPlayerId.value = null;
    } else {
        colorPickerPlayerId.value = playerId;
    }
}

async function onSelectColor(playerId, color) {
    await selectPlayerColor(currentLobbyId.value, playerId, color);
    colorPickerPlayerId.value = null; // Close picker after selection
}

async function handleInitialCardChange(playerId, event) {
    const cardName = event.target.value;
    await updateInitialCard(currentLobbyId.value, playerId, cardName);
}

async function handleAlternateRealitiesChange(isChecked) {
  userAlternateRealitiesPreference.value = isChecked; // Persist user's preference for future lobbies
  await updateAlternateRealities(currentLobbyId.value, isChecked);
}

async function handleZoneChange(index, event) {
    const newValue = event.target.value;
    const currentSelections = gameData.value.selectedZones;

    // Client-side check to prevent selecting the same zone twice
    if (newValue && currentSelections.some((name, i) => name === newValue && i !== index)) {
        alert('Duplicate zones are not allowed.');
        event.target.value = currentSelections[index] || ''; // Revert the input visually
        return;
    }

    await updateSelectedZone(currentLobbyId.value, index, newValue);
}

async function onExitLobby() {
  await exitLobby(currentLobbyId.value);
  currentLobbyId.value = "";
}

async function onBecomeSpectator() {
  await becomeSpectator(currentLobbyId.value);
}

async function runSingleTestWithTimeout(testConfig, index) {
  return new Promise(async (resolve) => {
    let timeoutId = null;
    let listenerUnsubscribe = null;

    const cleanupAndResolve = (status, message = null, error = null) => {
      clearTimeout(timeoutId);
      if (listenerUnsubscribe) listenerUnsubscribe();
      testSuiteResults.value[index].status = status;
      if (message) testSuiteResults.value[index].message = message;
      if (error) testSuiteResults.value[index].error = error;
      resolve();
    };

    timeoutId = setTimeout(() => {
      cleanupAndResolve('TIMEOUT', 'Test exceeded 20 seconds and was terminated.');
    }, 20000); // 20-second timeout

    try {
      testSuiteResults.value[index].status = 'running';
      const { lobbyId } = await runAITest(testConfig);
      testSuiteResults.value[index].lobbyId = lobbyId;

      listenerUnsubscribe = listenToLobby(lobbyId, null, (data) => {
        if (data && data.status === 'finished') {
          if (testSuiteResults.value[index].status === 'running') {
            const result = data.winner.includes('Automated test PASSED') ? 'PASS' : 'FAIL';
            const message = result === 'FAIL' ? data.winner : null;
            cleanupAndResolve(result, message);
          }
        } else if (!data) { // Lobby deleted
          if (testSuiteResults.value[index].status === 'running') {
            cleanupAndResolve('FAIL', 'Lobby was deleted before test completion.');
          }
        }
      });
    } catch (error) {
      console.error(`Error starting test '${testConfig.testName}':`, error);
      cleanupAndResolve('ERROR', null, error.message);
    }
  });
}

async function onRunTestSuite() {
  isSuiteRunning.value = true;
  failureDetails.value = null; // Clear previous details
  testSuiteResults.value = testSuite.map(test => ({
    testName: test.testName,
    status: 'pending',
    lobbyId: null,
    error: null,
    message: null,
  }));

  const BATCH_SIZE = 10;
  for (let i = 0; i < testSuite.length; i += BATCH_SIZE) {
    const batch = testSuite.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map((testConfig, batchIndex) => {
      const originalIndex = i + batchIndex;
      return runSingleTestWithTimeout(testConfig, originalIndex);
    });
    await Promise.all(batchPromises);
  }
  // The `isSuiteFinished` computed property will automatically update.
}

function showFailureDetails(testResult) {
  if (testResult.status === 'FAIL' && testResult.message) {
    failureDetails.value = testResult.message;
  }
}

async function onCreateManualTestGame(testId) {
  const test = manualTests.find(t => t.testId === testId);
  if (!test) {
    console.error(`Manual test with ID ${testId} not found.`);
    return;
  }

  const humanPlayerId = user.value.uid;

  // Deep copy and replace the placeholder ID with the actual human player's ID
  const processedConfig = JSON.parse(JSON.stringify(test.config));
  if (processedConfig.initialHands && processedConfig.initialHands.player_1) {
    processedConfig.initialHands[humanPlayerId] = processedConfig.initialHands.player_1;
    delete processedConfig.initialHands.player_1;
  }
  if (processedConfig.initialPerpetuals && processedConfig.initialPerpetuals.player_1) {
    processedConfig.initialPerpetuals[humanPlayerId] = processedConfig.initialPerpetuals.player_1;
    delete processedConfig.initialPerpetuals.player_1;
  }

  const lobbyPayload = {
    isTest: true,
    aiPlayerCount: 0,
    testConfig: {
      ...processedConfig,
      autoStart: true,
      testName: `Manual Test: ${test.buttonLabel}`
    }
  };

  const newId = await createLobby(nickName.value.trim(), lobbyPayload);
  if (newId) currentLobbyId.value = newId;
}

function handleBeforeUnload() {
  // This function is now empty as the service layer handles listener cleanup.
  // The onDisconnect functionality for presence is best handled with RTDB, which is a separate feature.
}
</script>

<template>
  <div v-if="user">

    <!-- This is a global datalist for card name suggestions -->
    <datalist id="all-card-names">
      <option v-for="cardName in allCardNames" :key="cardName" :value="cardName"></option>
    </datalist>

    <!-- Modal for displaying test failure details -->
    <div v-if="failureDetails" class="modal-overlay" @click="failureDetails = null">
      <div class="modal-content" @click.stop>
        <h3>Test Failure Details</h3>
        <pre>{{ failureDetails }}</pre>
        <button @click="failureDetails = null" class="lobby-btn">Close</button>
      </div>
    </div>

    <div v-if="!currentLobbyId || currentLobbyId != gameData?.lobbyId" class="home-screen">
      <img :src="logoUrl" alt="Temporum Online Logo" class="logo">
      
      <div class="home-controls">
        <div class="input-group">
          <label for="nickname">Nickname</label>
          <input id="nickname" type="text" v-model="nickName" placeholder="Your Nickname" class="lobby-input nickname-input" />
        </div>

        <div class="actions-row">
          <button @click="onCreateLobby" class="lobby-btn create-btn">Create Lobby</button>
          <button @click="onCreateAIGame" class="lobby-btn create-ai-btn">Create AI Game</button>
          <div class="join-group">
            <div class="input-group">
              <label for="lobbyId">Lobby ID</label>
              <input id="lobbyId" type="text" v-model="lobbyIdInput" placeholder="Enter Lobby ID" class="home-input"/>
            </div>
            <button @click="onJoinLobby" class="home-btn join-btn">Join</button>
          </div>
        </div>
      </div>

      <!-- Automated Testing Section -->
      <div class="automated-test-section" v-if="isDevelopment">
        <h2>Automated AI Tests</h2>
        <button @click="onRunTestSuite" :disabled="isSuiteRunning && !isSuiteFinished" class="lobby-btn create-ai-btn">
          <span v-if="isSuiteRunning && !isSuiteFinished">Running...</span>
          <span v-else-if="isSuiteFinished">Rerun Test Suite</span>
          <span v-else>Run Test Suite</span>
        </button>
        <div v-for="test in manualTests" :key="test.testId">
          <button @click="onCreateManualTestGame(test.testId)" class="lobby-btn create-ai-btn">
            Manual Test: {{ test.buttonLabel }}
          </button>
        </div>
        <p class="test-instructions">
          Click to run the predefined test suite from <code>src/tests/testSuite.js</code>.
        </p>
        <div v-if="testSuiteResults.length > 0" class="test-suite-results">
          <ul>
            <li v-for="(result, index) in testSuiteResults" :key="index" :class="['test-result', result.status.toLowerCase()]" @click="showFailureDetails(result)">
              <span class="test-status-indicator">{{ result.status }}</span>
              <span class="test-name">{{ result.testName }}</span>
              <span v-if="result.lobbyId" class="test-lobby-id">(Lobby: {{ result.lobbyId }})</span>
              <span v-if="result.error" class="test-error-message">Error: {{ result.error }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <GameInProgress v-else-if="['in-progress', 'finished'].includes(gameData?.status)" :onlinePlayerIds="onlinePlayerIds" />

    <div v-else class="lobby-screen">
      <div class="lobby-header">
        <h1 class="lobby-title">LOBBY: <span class="lobby-id-display">{{ currentLobbyId }}</span></h1>
        <div v-if="gameData.ownerId === user?.uid" class="alternate-realities-toggle">
            <input 
              type="checkbox" 
              id="alternate-realities" 
              :checked="gameData.alternateRealities"
              @change="handleAlternateRealitiesChange($event.target.checked)"
              :disabled="gameData.ownerId !== user?.uid">
            <label for="alternate-realities">Alternate Realities (WIP)</label> 
        </div>
      </div>
      <div v-if="gameData" class="lobby-main-content">
        <div class="lobby-section players-section-grid">
          <h3 class="section-title">OPERATIVES</h3>
          <ul class="player-list">
            <li v-for="player in gameData.players" :key="player.id" class="player-list-item">
            <div 
              class="color-square"
              :style="{ backgroundColor: player.color === 'grey' ? '#808080' : player.color }"
              @click="((player.id === user?.uid) || (gameData.ownerId === user?.uid && player.isAI)) && toggleColorPicker(player.id)"
              :class="{ 'clickable': (player.id === user?.uid) || (gameData.ownerId === user?.uid && player.isAI) }"
            ></div>
            <!-- Color Picker Popup -->
            <div v-if="colorPickerPlayerId === player.id" class="color-picker-popup">
              <div 
                v-for="color in [...gameColors, 'grey']" 
                :key="color"
                class="color-option"
                :class="{ 
                  'disabled': usedColors.has(color),
                  'selected': player.color === color
                }"
                :style="{ backgroundColor: color === 'grey' ? '#808080' : color }"
                @click="!usedColors.has(color) && onSelectColor(player.id, color)"
              >
                <span v-if="usedColors.has(color)" class="disabled-x">X</span>
              </div>
            </div>
              <span class="player-name">
                {{ player.name }}
                <span v-if="player.id === user?.uid" class="player-tag">(You)</span>
                <span v-else-if="player.isAI" class="player-tag">(AI)</span>
              </span>
              <button v-if="gameData.ownerId === user?.uid && player.id !== user?.uid" @click="onRemovePlayer(player.id)" class="lobby-btn remove-btn">X</button>
            </li>
          </ul>
        </div>

        <div class="lobby-section zone-config-section" v-if="gameData.selectedZones">
            <h3 class="section-title">TIMELINE CONFIGURATION</h3>
            <div class="zone-age-group">
                <label>I</label>
                <input :value="gameData.selectedZones[0]" type="text" list="age1-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(0, $event)">
            </div>
            <div class="zone-age-group">
                <label>II</label>
                <input :value="gameData.selectedZones[1]" type="text" list="age2-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(1, $event)">&nbsp;
                <input :value="gameData.selectedZones[2]" type="text" list="age2-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(2, $event)">
            </div>
            <div class="zone-age-group">
                <label>III</label>
                <input :value="gameData.selectedZones[3]" type="text" list="age3-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(3, $event)">
                <input :value="gameData.selectedZones[4]" type="text" list="age3-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(4, $event)">
                <input :value="gameData.selectedZones[5]" type="text" list="age3-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(5, $event)">
            </div>
            <div class="zone-age-group">
                <label>IV</label>
                <input :value="gameData.selectedZones[6]" type="text" list="age4-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(6, $event)">
                <input :value="gameData.selectedZones[7]" type="text" list="age4-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(7, $event)">
                <input :value="gameData.selectedZones[8]" type="text" list="age4-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(8, $event)">
                <input :value="gameData.selectedZones[9]" type="text" list="age4-zones" class="lobby-input" :disabled="gameData.ownerId !== user?.uid" @change="handleZoneChange(9, $event)">
            </div>
            <div v-if="gameData.ownerId === user?.uid" class="timeline-preset-selector">
              <label for="timeline-set">Recommended Sets:</label>
              <select id="timeline-set" class="lobby-input" @change="onSelectTimelineSet">
                <option value="" disabled selected>Select a preset...</option>
                <option v-for="(zones, name) in availableTimelineSets" :key="name" :value="name">
                  {{ name }}
                </option>
                <option value="Clear Timeline">Clear Timeline</option>
              </select>
            </div>

            <div class="lobby-actions">
              <button v-if="gameData.ownerId === user?.uid && gameData.players.length < 5" @click="onAddAIPlayer" class="lobby-btn">Add AI</button>
              <button v-if="gameData.ownerId === user?.uid" @click="onStartGame" class="lobby-btn start-btn">Start Game</button>
              <button v-if="gameData?.players.some(p => p.id === user.uid)" @click="onBecomeSpectator" class="lobby-btn spectate-btn">Spectate</button>
              <button @click="onExitLobby" class="lobby-btn exit-btn">Exit Lobby</button>
            </div>

            <!-- Datalists for suggestions -->
            <datalist id="age1-zones"><option v-for="zone in ageZoneNames[0]" :key="zone" :value="zone"></option></datalist>
            <datalist id="age2-zones"><option v-for="zone in ageZoneNames[1]" :key="zone" :value="zone"></option></datalist>
            <datalist id="age3-zones"><option v-for="zone in ageZoneNames[2]" :key="zone" :value="zone"></option></datalist>
            <datalist id="age4-zones"><option v-for="zone in ageZoneNames[3]" :key="zone" :value="zone"></option></datalist>

        </div>
      </div>
      <div v-if="gameData.spectators && gameData.spectators.length > 0" class="lobby-section spectators-section-bottom">
        <h3 class="section-title">SPECTATORS</h3>
        <ul class="spectator-list-inline">
          <li v-for="spectator in gameData.spectators" :key="spectator.id" class="spectator-list-item">
            <span class="spectator-name">
              {{ spectator.name }}
              <span v-if="spectator.id === user?.uid" class="player-tag">(You)</span>
            </span>
            <button v-if="gameData.ownerId === user?.uid && spectator.id !== user?.uid" @click="onRemoveSpectator(spectator.id)" class="lobby-btn remove-btn-small">X</button>
          </li>
        </ul>
      </div>

    </div>

    <footer v-if="!currentLobbyId || currentLobbyId != gameData?.lobbyId">
      Programmed by <a href="https://github.com/vbst7" target="_blank" rel="noopener noreferrer">Valerie Brown</a>.
      Not affiliated with <a href="https://www.riograndegames.com/" target="_blank" rel="noopener noreferrer">Rio Grande Games</a>.
    </footer>
  </div>
</template>

<style>
html {
  touch-action: manipulation;
  background-color: #333;
}

body {
  zoom: 1.0;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

/* --- Home Screen --- */

.home-screen {
    text-align: center;
}

.logo {
    display: block;
    width: 600px;
    max-width: 90%;
    margin: 40px auto;
    height: auto;
}

.test-result {
    color: #fff;
    cursor: pointer;
    background-color: #222;
    padding: 10px;
    border-radius: 5px;
}
.test-result.pass { background-color: #4a7d4c; }
.test-result.fail { background-color: #8c3a3a; }
.test-result.error { background-color: #b87333; }
.test-result.timeout { background-color: #b833a6; }
.test-result.running { background-color: #3e5a8a; cursor: default; }
.test-result.pending { background-color: #5a5a5a; }

.test-suite-results {
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
}

.test-suite-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.test-suite-results li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: left;
}

.test-status-indicator {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  color: #222;
  background-color: rgba(255, 255, 255, 0.7);
  min-width: 60px;
  text-align: center;
}

.test-name { flex-grow: 1; }
.test-lobby-id { font-family: 'Courier New', monospace; font-size: 0.9em; opacity: 0.8; }
.test-error-message { font-style: italic; color: #ffdddd; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #2d2d2d;
  color: #e0e0e0;
  padding: 20px 30px;
  border-radius: 8px;
  border: 1px solid #555;
  min-width: 400px;
  max-width: 80%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.modal-content pre {
  background-color: #1a1a1a;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap; /* Ensures long messages wrap */
  word-break: break-all;
  border: 1px solid #444;
  margin: 20px 0;
}

.home-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}

.input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
}

.input-group label {
    color: #ccc;
    margin-bottom: 5px;
}

.nickname-input {
    width: 100%;
    text-align: center;
}

.actions-row {
    display: grid;
    justify-content: space-between;
    align-items: stretch; /* Make items same height */
    gap: 15px;
    width: 100%;
}

.join-group {
    display: flex; /* Aligns input and button */
    gap: 5px;
    align-items: flex-end; /* Aligns button with bottom of input */
    /* flex-grow: 1; */ /* Removed to prevent it from taking all space */
}

.join-group .input-group {
    flex-grow: 1;
}

.color-square {
    width: 20px;
    height: 20px;
    border: 1px solid black;
    margin-right: 10px;
    flex-shrink: 0;
}

.color-square.clickable {
    cursor: pointer;
}

.color-picker-popup {
    position: absolute;
    left: 30px; /* Position it next to the square */
    top: 0;
    background: white;
    border: 1px solid #ccc;
    padding: 5px;
    display: flex;
    gap: 5px;
    z-index: 10;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.expansion-toggle {
    grid-column: 1 / -1; /* Span across both columns */
    text-align: center;
    margin-bottom: -10px;
}

.color-option {
    width: 25px;
    height: 25px;
    border: 1px solid black;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-weight: bold;
}

.color-option.selected {
    outline: 2px solid blue;
    outline-offset: 1px;
}

.color-option.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
.disabled-x {
    color: red;
    font-size: 20px;
    line-height: 1;
}

/* --- Lobby Screen --- */

.lobby-screen {
    max-width: 1200px;
    margin: 10px auto;
    padding: 20px;
    color: #e0e0e0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.lobby-main-content {
    display: grid;
    grid-template-columns: 400px 1fr; /* Fixed width for players, flexible for timeline */
    gap: 25px; /* Gap between columns */
    align-items: stretch;
}

.lobby-title {
    font-family: 'Copperplate', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
    font-size: 2.2em;
    color: #c5b358; /* Gold-ish color */
    text-shadow: 1px 1px 2px #000;
    letter-spacing: 2px;
}

.lobby-id-display {
    color: #fff;
    background-color: #222;
    padding: 5px 15px;
    border-radius: 5px;
    border: 1px solid #555;
    font-family: 'Courier New', Courier, monospace;
}

.lobby-section {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid #555;
    border-radius: 8px;
    padding: 15px 20px;
}

.players-section-grid {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid #555;
    border-radius: 8px;
    padding: 15px 20px;
}

.spectators-section-bottom {
    margin-top: 25px; /* Space from the main content */
    padding: 15px 20px; /* Slightly less padding */
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid #555;
    border-radius: 8px;
}

.spectators-section-bottom .section-title {
    font-size: 1.2em; /* Smaller title */
    padding-bottom: 8px;
    margin-bottom: 10px;
}

.spectator-list-inline {
    list-style: none;
    padding: 0;
    display: flex; /* Arrange spectators in a row */
    flex-wrap: wrap; /* Allow wrapping if many spectators */
    gap: 10px; /* Space between spectator items */
}

.spectator-list-item {
    display: flex;
    align-items: center;
    background-color: #3a3a3a;
    padding: 5px 10px;
    border-radius: 4px;
    gap: 5px;
}

.spectator-name {
    font-size: 0.9em;
}

.remove-btn-small {
    background-color: #8c3a3a;
    padding: 0;
    width: 20px; /* Smaller button */
    height: 20px;
    line-height: 20px;
    font-size: 0.8em;
    flex-shrink: 0;
}
.remove-btn-small:hover {
    background-color: #a14e4e;
}

.section-title {
    font-family: 'Copperplate', 'Palatino Linotype', serif;
    color: #c5b358;
    border-bottom: 1px solid #555;
    padding-bottom: 10px;
    margin-bottom: 20px;
    font-size: 1.5em;
    letter-spacing: 1px;
}

.player-list {
    list-style: none;
    padding: 0;
}

.player-list-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    border-radius: 4px;
    background-color: #3a3a3a;
    margin-bottom: 10px;
}

.player-name {
    flex-grow: 1;
    font-size: 1.1em;
}

.player-tag {
    font-style: italic;
    color: #aaa;
    margin-left: 5px;
}

.lobby-input {
    background-color: #222;
    border: 1px solid #555;
    color: #ddd;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 1em;
}

.lobby-input:focus {
    outline: none;
    border-color: #c5b358;
}

.lobby-input:disabled {
    background-color: #333;
    cursor: not-allowed;
}

.timeline-preset-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    width: 100%;
}

.timeline-preset-selector select {
    flex-grow: 1;
}

.zone-config-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
}

.zone-age-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
}
.zone-age-group .lobby-input {
    width: 130px;
}

.lobby-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: auto; /* Pushes actions to the bottom */
}
.zone-age-group label {
    font-weight: bold;
    color: #aaa;
    width: 25px; /* Give a small fixed width to align rows */
    text-align: right;
    margin-right: 5px;
}

.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  gap: 20px; /* Add gap for spacing */
}

.lobby-header .lobby-title {
  flex-grow: 1
}

.lobby-btn {
    padding: 10px 20px;
    font-size: 1em;
    font-weight: bold;
    border: 1px solid #222;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #5a5a5a;
    color: #ddd;
}

.lobby-btn:hover {
    background-color: #6a6a6a;
    border-color: #444;
}

.remove-btn {
    background-color: #8c3a3a;
    padding: 0;
    width: 30px;
    height: 30px;
    line-height: 30px;
    flex-shrink: 0;
}
.remove-btn:hover { background-color: #a14e4e; }

.start-btn {
    background-color: #4a7d4c;
    color: white;
}
.start-btn:hover { background-color: #5a9d5c; }

.exit-btn {
    background-color: #3e5a8a;
}
.exit-btn:hover { background-color: #5072b0; }

.create-btn {
    background-color: #b87333; /* Bronze color */
    color: white;
}
.create-ai-btn {
    background-color: #339db8;
    color: white;
}
.create-btn:hover { background-color: #9c602a; }
.create-ai-btn:hover { background-color: #2a7f9c; }

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 5px 0;
  font-size: 0.8em;
  color: #aaa;
  background-color: #222;
  z-index: 1001; /* Ensure it's above other content */
}
footer a {
  color: #ccc;
  text-decoration: none;
}
footer a:hover {
  text-decoration: underline;
}
</style>