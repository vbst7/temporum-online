<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { defineProps } from 'vue';
import {
  gameData,
  user,
  localPlayerHand,
  exitLobby,
  changeHistory,
  declineChangeHistory,
  visitZone,
  scoreCard,
  playCard,
  advanceCrown,
  retreatCrown,
  executeChoice,
  resolveOptionalZone,
  discardAndContinue,
  resolveDiscardForMoney,
  resolveInventor,
  resolveInquisition,
  discardMany, 
  resolveBabylonianChoice,
  resolveGizmoChoice,
  resignGame,
  replacePlayerWithAI,
  resolveSunboat,
  resolvePredictTheFuture,
  selectCyberneticsPerpetual,
  selectCyberneticsHandCard,
  resolveToysChoice,
  resolveInvestments,
  resolveTradeGoods,
  resolveTreasureMap,
  selectCardToPass,
  returnCard,
  resolveSimulatedParadiseChoice,
  resolveMove,
  resolveSetHQ,
  resolveY2KDiscard,
  choosePostVisit,
  chooseEndOfTurn,
  chooseStartOfTurn} from "../services/firebaseService.js";
import { runAIAction, clearAIPromptMemory } from '../services/aiService.js';
import PlayerIcon from "../assets/Meeple.vue" 
import CrownIcon from "../assets/Crown.vue" 
import CoinIcon from "../assets/CoinIcon.vue"
import BaseIcon from "../assets/BaseIcon.vue"
import Hourglass from "../assets/Hourglass.vue"
import HQIcon from "../assets/HQIcon.vue"

const props = defineProps({ onlinePlayerIds: Set });

// New state for inspector
const inspectedItem = ref(null);
const expandedPlayers = ref(new Set()); // New state for expanded player cards
const showResignConfirm = ref(false);
const showAllCardsModal = ref(false);
const allCardsActiveTab = ref('base');
const showAllZonesModal = ref(false);
const allZonesActiveTab = ref('base');
const showHelpModal = ref(false);

const cardSearchQuery = ref('');
const zoneSearchQuery = ref('');

// Other game state data
const hand = ref([]);
const crowns = ref([]);
const crownColors = ['#dc2626', '#16a34a', '#f9fafb', '#9333ea', '#eab308'];
const newMessage = ref('');
const discardSelection = ref([]);
const logContent = ref(null);

const advancementState = ref({
  pendingCrowns: 0,
  advances: [], // array of age indices to advance from
  tempScoreTrack: [],
});


const sortCards = (cards) => {
  if (!cards) return [];
  return [...cards].sort((a, b) => {
    // Momentary ('M') before Perpetual ('P')
    if (a.type === 'M' && b.type !== 'M') return -1;
    if (a.type !== 'M' && b.type === 'M') return 1;
    // If types are the same, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

const allBaseCardsSorted = computed(() => {
  if (!gameData.value?.allCards) return [];
  // Exclude special cards from the main list for the modal
  const baseCards = gameData.value.allCards.filter(c => c.id !== 'gizmo' && c.id !== 'trade-goods');
  return sortCards(baseCards);
});

const allAlternateCardsSorted = computed(() => {
  const alternateCards = gameData.value?.allAlternateCards || [];
  return sortCards(alternateCards);
});

const sortZones = (zonesByAge) => {
  if (!zonesByAge) return [];
  
  // Sort the flattened array.
  return zonesByAge.sort((a, b) => {
    // First, sort by age numerically.
    const ageA = parseInt(a.age);
    const ageB = parseInt(b.age);
    if (ageA !== ageB) {
      return ageA - ageB;
    }
    // If ages are the same, sort alphabetically by name.
    return a.name.localeCompare(b.name);
  });
};

const allBaseZonesSorted = computed(() => {
  return sortZones(gameData.value?.allZones);
});

const allAlternateZonesSorted = computed(() => {
  return sortZones(gameData.value?.allAlternateZones);
});

const allCardsById = computed(() => {
  if (!gameData.value?.allCards) return {};
  return gameData.value.allCards.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {});
});

const filteredBaseCards = computed(() => {
  if (!allBaseCardsSorted.value) return [];
  const query = cardSearchQuery.value.toLowerCase().trim();
  if (!query) return allBaseCardsSorted.value;
  return allBaseCardsSorted.value.filter(card =>
    card.name.toLowerCase().includes(query) ||
    card.description.toLowerCase().replace(/♛/g, 'crown').includes(query)
  );
});

const filteredAlternateCards = computed(() => {
  if (!allAlternateCardsSorted.value) return [];
  const query = cardSearchQuery.value.toLowerCase().trim();
  if (!query) return allAlternateCardsSorted.value;
  return allAlternateCardsSorted.value.filter(card =>
    card.name.toLowerCase().includes(query) ||
    card.description.toLowerCase().replace(/♛/g, 'crown').includes(query)
  );
});

const filteredBaseZones = computed(() => {
  if (!allBaseZonesSorted.value) return [];
  const query = zoneSearchQuery.value.toLowerCase().trim();
  if (!query) return allBaseZonesSorted.value;
  return allBaseZonesSorted.value.filter(zone =>
    zone.name.toLowerCase().includes(query) ||
    zone.description.toLowerCase().replace(/♛/g, 'crown').includes(query)
  );
});

const filteredAlternateZones = computed(() => {
  if (!allAlternateZonesSorted.value) return [];
  const query = zoneSearchQuery.value.toLowerCase().trim();
  if (!query) return allAlternateZonesSorted.value;
  return allAlternateZonesSorted.value.filter(zone =>
    zone.name.toLowerCase().includes(query) ||
    zone.description.toLowerCase().replace(/♛/g, 'crown').includes(query)
  );
});

const clientPlayer = computed(() => {
  if (!gameData.value || !user.value) return null;
  return gameData.value.players.find(player => player.id === user.value.uid);
});

const alienContactCard = computed(() => {
  if (clientPlayer.value?.prompt === 'alien-contact' && localPlayerHand.value?.length > 0) {
    // The card drawn for Alien Contact is always the last one.
    return localPlayerHand.value[localPlayerHand.value.length - 1];
  }
  return null;
});

const simulatedZoneObject = computed(() => {
  if (!gameData.value?.zones) return null;
  const simParadise = gameData.value.zones.find(z => z.id === 'simulated-paradise');
  if (!simParadise?.simulatedZoneId) return null;
  return gameData.value.zones.find(z => z.id === simParadise.simulatedZoneId);
});

const handForDisplay = computed(() => {
  if (!localPlayerHand.value) return [];

  const player = clientPlayer.value;
  const isScoringPrompt = ['score', 'space-age'].includes(player.prompt);

  // Base hand to process
  let handSource = localPlayerHand.value;
  if (player.prompt === 'alien-contact' && localPlayerHand.value.length > 0) {
    handSource = localPlayerHand.value.slice(0, -1);
  }
  // NEW: Hide the two cards for Age of Toys choice
  if (player.prompt === 'toys-choice' && localPlayerHand.value.length >= 2) {
    handSource = localPlayerHand.value.slice(0, -2);
  }

  // Apply dynamic cost/score if in a scoring context
  if (isScoringPrompt && player.promptContext) {
    const { costReduction = 0, bonusCrown = 0, instruction = '' } = player.promptContext;
    if (instruction === 'scrapyard-world') {
      return handSource.map(card => {
        let displayScore = parseInt(card.score) + bonusCrown;
        let costInCards = parseInt(card.cost) - costReduction;
        costInCards = Math.max(0, costInCards);
        costInCards = Math.floor(costInCards / 4);
        return {
          ...card,
          displayCost: `${costInCards} card${costInCards !== 1 ? 's' : ''}`,
          secret: card.secret,
          displayScore: displayScore,
        };
      });
    }
    else {   
      return handSource.map(card => {
        let displayCost = parseInt(card.cost) - costReduction;
        let displayScore = parseInt(card.score) + bonusCrown;

        // Age of Cats doubles everything after other modifiers
        if (instruction === 'age-of-cats') {
          displayCost *= 2;
          displayScore *= 2;
        }

        return {
          ...card,
          displayCost: Math.max(0, displayCost),
          secret: card.secret,
          displayScore: displayScore,
        };
      });
    }
  }

  // Default: just add display properties with original values
  return handSource.map(card => ({
    ...card,
    secret: card.secret,
    displayCost: parseInt(card.cost),
    displayScore: parseInt(card.score),
  }));
});

function getPerpetualsForPlayer(player) {
  if (!player?.perpetuals) return [];
  const allPerpetuals = [];
  for (const cardArray of Object.values(player.perpetuals)) {
    allPerpetuals.push(...cardArray);
  }
  return allPerpetuals;
}

function getPoisonTokensForPlayer(player) {
  if (!player?.poison) return [];
  return player.poison.map((p, index) => ({
    id: `poison-${index}`,
    name: 'Poison',
    type: 'token',
    instanceId: `poison-${player.id}-${index}`
  }));
}

const clientPlayerPerpetuals = computed(() => {
  if (!clientPlayer.value) return [];
  return getPerpetualsForPlayer(clientPlayer.value);
});

const clientPlayerPerpetualsAndTokens = computed(() => {
  if (!clientPlayer.value) return [];
  const perpetuals = getPerpetualsForPlayer(clientPlayer.value);
  const poisonTokens = getPoisonTokensForPlayer(clientPlayer.value);
  return [...perpetuals, ...poisonTokens];
});

const toysChoiceCards = computed(() => {
    if (clientPlayer.value?.prompt === 'toys-choice' && localPlayerHand.value?.length >= 2) {
        const hand = localPlayerHand.value;
        return [
            { card: hand[hand.length - 2], index: hand.length - 2 },
            { card: hand[hand.length - 1], index: hand.length - 1 }
        ];
    }
    return [];
});

function isPlayerOnline(player) {
  if (player.isAI) return true;
  return props.onlinePlayerIds.has(player.id);
}


function parseTextForIcons(text) {
  if (!text) return [];
  // This regex will split by $X (digits), standalone $, ♛, or ⧖, keeping the delimiters
  const regex = /(\$\d+|\$|\♛|\⧖)/g;
  const parts = String(text).split(regex);

  return parts.filter(p => p).map(part => {
    if (part === '♛') {
      return { type: 'crown' };
    }
    if (part === '⧖') {
      return { type: 'hourglass' };
    }
    if (part.startsWith('$')) {
      return { type: 'coin', value: part.substring(1) || '' };
    }
    return { type: 'text', value: part };
  });
}

function parseLogMessage(message) {
  if (message.parts) {
    // New structured log message
    return message.parts.map(part => {
      if (part.type === 'player' || part.type === 'card' || part.type === 'zone') {
        let style = { fontWeight: 'bold', whiteSpace: 'nowrap' };
        if (part.type === 'player') {
          style.color = getPlayerLogColor(part.color);
        } else if (part.type === 'card') {
          style.color = getCardTypeColor(part.cardType, true);
        } else if (part.type === 'zone') {
        let zoneColor = part.color;
        // Lighten specific zone colors for better readability in the log
        if (zoneColor === 'brown') {
          zoneColor = '#F08080'; // LightCoral
        } else if (zoneColor === 'green') { 
          zoneColor = '#90EE90'; // LightGreen
        } else if (zoneColor === 'white') { 
          zoneColor = '#dddddd'; // LightGreen
        }
          style.color = zoneColor;
          style.filter = 'brightness(0.9)';
          style.textShadow = '0 0 1px black';
        }
        return { type: 'text', value: part.value, style: style };
      }
      // For text parts, parse them for icons
      if (part.type === 'text') {
        return parseTextForIcons(part.value);
      }
      return part;
    }).flat();
  }
  // Fallback for old string-based messages
  return parseTextForIcons(message.text);
}

const inspectedDescriptionParts = computed(() => {
  return parseTextForIcons(inspectedItem.value?.description);
});

const inspectedSecretParts = computed(() => {
  return parseTextForIcons(inspectedItem.value?.secret);
});

const inspectedBoxParts = computed(() => {
  return parseTextForIcons(inspectedItem.value?.box);
});

const playersByColor = computed(() => {
  if (!gameData.value?.players) return {};
  const map = {};
  for (const player of gameData.value.players) {
    map[player.color] = player;
  }
  return map;
});

const playersById = computed(() => {
  if (!gameData.value?.players) return {};
  const map = {};
  for (const player of gameData.value.players) {
    map[player.id] = player;
  }
  return map;
});

const iconSizing = computed(() => {
  const sizingMap = {};
  if (!gameData.value?.zones) return sizingMap;

  const zoneWidth = 196; // 200px width - 4px padding
  const zoneHeight = 80; // 115px height - 35px header
  const maxIconHeight = 45;
  const minIconHeight = 30;
  const iconAspectRatio = 24 / 40;
  const gap = 2;

  for (let i = 0; i < gameData.value.zones.length; i++) {
    const count = zoneIcons.value[i]?.length || 0;
    if (count === 0) continue;

    let rows = 1;
    let iconHeight = maxIconHeight;
    let iconWidth = iconHeight * iconAspectRatio;

    // Try one row, shrinking icons until they fit or hit min height
    let requiredWidth = count * iconWidth + (count - 1) * gap;
    if (requiredWidth > zoneWidth) {
      iconWidth = (zoneWidth - (count - 1) * gap) / count;
      iconHeight = iconWidth / iconAspectRatio;
    }

    // If they are too small on one row, try two rows
    if (iconHeight < minIconHeight) {
      rows = 2;
      iconHeight = Math.min(maxIconHeight, (zoneHeight - gap) / 2);
      iconWidth = iconHeight * iconAspectRatio;
      const iconsPerRow = Math.ceil(count / rows);
      requiredWidth = iconsPerRow * iconWidth + (iconsPerRow - 1) * gap;
      if (requiredWidth > zoneWidth) {
        iconWidth = (zoneWidth - (iconsPerRow - 1) * gap) / iconsPerRow;
        iconHeight = iconWidth / iconAspectRatio;
      }
    }

    // If still too small, go to three rows (final fallback)
    if (count > 15 && iconHeight < minIconHeight) {
      rows = 3;
      iconHeight = Math.min(maxIconHeight, (zoneHeight - 2 * gap) / 3);
      iconWidth = iconHeight * iconAspectRatio;
    }

    sizingMap[i] = {
      width: `${Math.floor(iconWidth)}px`,
      height: `${Math.floor(iconHeight)}px`,
    };
  }
  return sizingMap;
});

const zoneIcons = computed(() => {
  if (!gameData.value?.players || !gameData.value?.zones) return {};
  const zoneIconMap = {};
  for (let i = 0; i < gameData.value.zones.length; i++) { // eslint-disable-line
    const zone = gameData.value.zones[i];
    const icons = [];

    if (zone.hourglass != null) {
      icons.push({ type: 'hourglass', number: zone.hourglass });
    }

    const playersInZone = gameData.value.players.filter((p) => p.zone === i).map((p) => ({ type: 'player', id: p.id, color: getPlayerLogColor(p.color) }));
    const hqsInZone = gameData.value.players.filter((p) => p.hq === i).map((p) => ({ type: 'hq', id: p.id, color: getPlayerLogColor(p.color) }));
    const basesInZone = gameData.value.players.filter((p) => p.bases?.includes(i)).map((p) => ({ type: 'base', id: p.id, color: getPlayerLogColor(p.color) }));
    
    zoneIconMap[i] = [
      ...icons,
      ...playersInZone,
      ...hqsInZone,
      ...basesInZone
    ];
  }
  return zoneIconMap;
});

const zoneRows = computed(() => {
  if (!gameData.value?.zones?.length || gameData.value.zones.length < 10) {
    return [];
  }
  const zones = gameData.value.zones;
  // Groups the flat zones array into a nested array representing the tree structure
  // and adds the original index to correctly map players to zones.
  return [
    zones.slice(0, 1).map((zone, i) => ({ ...zone, originalIndex: i })),
    zones.slice(1, 3).map((zone, i) => ({ ...zone, originalIndex: i + 1 })),
    zones.slice(3, 6).map((zone, i) => ({ ...zone, originalIndex: i + 3 })),
    zones.slice(6, 10).map((zone, i) => ({ ...zone, originalIndex: i + 6 })),
  ];
});

// Watch for prompt changes to clear selection
watch(() => clientPlayer.value?.prompt, (newPrompt) => {
  if (newPrompt !== 'discard-many') {
    discardSelection.value = [];
  }
  if (newPrompt === 'advance' && clientPlayer.value) {
    advancementState.value.pendingCrowns = clientPlayer.value.crowns;
    advancementState.value.advances = [];
    advancementState.value.tempScoreTrack = [...clientPlayer.value.scoreTrack];
  } else {
    advancementState.value.pendingCrowns = 0;
    discardSelection.value = [];
  }
});

// Auto-decline Y2K if no perpetual cards in hand
watch(() => clientPlayer.value?.prompt, async (newPrompt) => {
  if (newPrompt === 'y2k-discard' && localPlayerHand.value) {
    const hasPerpetualCards = localPlayerHand.value.some(card => card.type === 'P');
    if (!hasPerpetualCards) {
      await resolveY2KDiscard(gameData.value.lobbyId, clientPlayer.value.id, { cardIndex: null });
    }
  }
});


/**
 * Creates a watcher callback that auto-scrolls a scrollable element to the bottom,
 * but only if the user was already near the bottom before the new content was added.
 * @param {import('vue').Ref<HTMLElement>} elementRef - A Vue ref pointing to the scrollable DOM element.
 */
const createAutoScroller = (elementRef) => async (newVal, oldVal) => {
  const el = elementRef.value;
  // Don't run on initial load or if nothing changed
  if (!el || !newVal || !oldVal || newVal.length === oldVal.length) return;

  // Check if user is near the bottom before the DOM updates.
  // A buffer of a few pixels helps account for sub-pixel rendering and borders.
  const isScrolledToBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;

  // Wait for the DOM to update with the new message
  await nextTick();

  // If they were at the bottom, scroll to the new bottom.
  if (isScrolledToBottom) {
    el.scrollTop = el.scrollHeight;
  }
};

watch(() => gameData.value?.log, createAutoScroller(logContent), { deep: true });

async function onChangeHistory() {
  await changeHistory(gameData.value.lobbyId, clientPlayer.value.id, clientPlayer.value.zone);
}

async function onDeclineChangeHistory() {
  await declineChangeHistory(gameData.value.lobbyId, clientPlayer.value.id);
}

async function handleZoneClick(zone) {
  const prompt = clientPlayer.value?.prompt;
  if (['visitZone', 'anubisVisit'].includes(prompt) && gameData.value.legalZones?.includes(zone.originalIndex)) {
    await visitZone(gameData.value.lobbyId, clientPlayer.value.id, zone.originalIndex);
  } else if (prompt === 'simulatedChoice' && gameData.value.legalZones?.includes(zone.originalIndex)) {
    await resolveSimulatedParadiseChoice(gameData.value.lobbyId, clientPlayer.value.id, zone.originalIndex);
  } else if (prompt === 'move' && gameData.value.legalZones?.includes(zone.originalIndex)) {
    await resolveMove(gameData.value.lobbyId, clientPlayer.value.id, zone.originalIndex);
  } else if (prompt === 'set-hq' && gameData.value.legalZones?.includes(zone.originalIndex)) {
    await resolveSetHQ(gameData.value.lobbyId, clientPlayer.value.id, zone.originalIndex);
  }
}

async function handleCardClick(card, cardIndex) {
  if (['score', 'alien-contact', 'space-age'].includes(clientPlayer.value?.prompt)) {
    if (clientPlayer.value.scoreableCards?.includes(cardIndex)) {
      await scoreCard(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt === 'discard') {
    if (cardIndex > -1) {
      await discardAndContinue(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt === 'imperial-china') {
    if (cardIndex > -1) {
      await resolveDiscardForMoney(gameData.value.lobbyId, clientPlayer.value.id, cardIndex, 'imperial-china');
    }
  } else if (clientPlayer.value?.prompt === 'inquisition') {
    if (cardIndex > -1) {
      await resolveInquisition(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt === 'gizmo-choice') {
    if (cardIndex > -1) {
      await resolveGizmoChoice(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt === 'discard-many') {
    if (cardIndex > -1) {
      const selectionIndex = discardSelection.value.indexOf(cardIndex);
      if (selectionIndex > -1) {
        discardSelection.value.splice(selectionIndex, 1);
      } else {
        discardSelection.value.push(cardIndex);
      }
    }
  } else if (clientPlayer.value?.prompt === 'discard-n') {
    const selectionIndex = discardSelection.value.indexOf(cardIndex);
    if (selectionIndex > -1) {
      discardSelection.value.splice(selectionIndex, 1);
    } else {
      discardSelection.value.push(cardIndex);
    }
  }
  else if (clientPlayer.value?.prompt === 'play') {
    if (cardIndex > -1) {
      await playCard(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  }
  else if (clientPlayer.value?.prompt === 'cybernetics-hand') {
    if (cardIndex > -1) {
      await selectCyberneticsHandCard(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  }
  else if (clientPlayer.value?.prompt === 'pass-card') {
    if (cardIndex > -1) {
      await selectCardToPass(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt ==='return-card') {
    if (cardIndex > -1) {
      await returnCard(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt === 'greek-america-discard-choice') {
    if (cardIndex > -1) {
      await resolveDiscardForMoney(gameData.value.lobbyId, clientPlayer.value.id, cardIndex, 'greek-america');
    }
  } else if (clientPlayer.value?.prompt === 'y2k-discard') {
    if (cardIndex > -1 && card.type === 'P') {
      await resolveY2KDiscard(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
    }
  } else if (clientPlayer.value?.prompt === 'start-of-turn-choice') {
    if (card.secret) {
      await chooseStartOfTurn(gameData.value.lobbyId, clientPlayer.value.id, {
        choiceId: 'secret-card', secretIndex: cardIndex,
      });
    }
  }
}

async function onResolveInventor(choice) {
  await resolveInventor(gameData.value.lobbyId, clientPlayer.value.id, choice);
}

async function handleToysChoiceClick(cardIndex) {
  await resolveToysChoice(gameData.value.lobbyId, clientPlayer.value.id, cardIndex);
}

async function onResolvePredictTheFuture(choice) {
  await resolvePredictTheFuture(gameData.value.lobbyId, clientPlayer.value.id, choice);
}

async function onResolveChoice(choice, zoneId) {
  await resolveOptionalZone(gameData.value.lobbyId, clientPlayer.value.id, choice, zoneId);
}

async function handleResolveInvestments(choice) {
  await resolveInvestments(gameData.value.lobbyId, clientPlayer.value.id, choice);
}

async function handleResolveTreasureMap(choice) {
  await resolveTreasureMap(gameData.value.lobbyId, clientPlayer.value.id, choice);
}

async function handleResolveSunboat(choice) {
  await resolveSunboat(gameData.value.lobbyId, clientPlayer.value.id, choice);
}

async function handleResolveTradeGoods(choice) {
  await resolveTradeGoods(gameData.value.lobbyId, clientPlayer.value.id, choice);
}


async function onDiscardMany() {
  await discardMany(gameData.value.lobbyId, clientPlayer.value.id, discardSelection.value);
  discardSelection.value = []; // Clear after sending
}

async function onResignClick() {
  showResignConfirm.value = true;
}

async function onConfirmResign(confirmed) {
  if (confirmed) {
    await resignGame(gameData.value.lobbyId, clientPlayer.value.id);
  }
  showResignConfirm.value = false;
}

function onHelpClick() {
  showHelpModal.value = true;
}

function onShowAllCardsClick() {
  showHelpModal.value = false;
  showAllCardsModal.value = true;
}

function onShowAllZonesClick() {
  showHelpModal.value = false;
  showAllZonesModal.value = true;
}

async function onExitLobbyClick() {
  await exitLobby(gameData.value.lobbyId);
}

async function onReplaceWithAI(playerId) {
  await replacePlayerWithAI(gameData.value.lobbyId, playerId);
}

async function onChooseScoreCard() {
  if (clientPlayer.value?.prompt === 'choose') {
    executeChoice(gameData.value.lobbyId, clientPlayer.value.id, "score");
  }
}

async function onChooseDrawCards() {
  if (clientPlayer.value?.prompt === 'choose') {
    executeChoice(gameData.value.lobbyId, clientPlayer.value.id, "draw");
  }
}

async function onChoosePlayCard() {
  if (clientPlayer.value?.prompt === 'choose') {
    executeChoice(gameData.value.lobbyId, clientPlayer.value.id, "play");
  }
}

async function onPerpetualClick(card) {
  if (clientPlayer.value?.prompt === 'cybernetics-perpetual') {
    await selectCyberneticsPerpetual(gameData.value.lobbyId, clientPlayer.value.id, card.id);
  }
}

function togglePlayerPerpetuals(playerId) {
  if (expandedPlayers.value.has(playerId)) {
    expandedPlayers.value.delete(playerId);
  } else {
    expandedPlayers.value.add(playerId);
  }
}

function getDarkerColor(colorName) {
  const colorMap = {
    'red': '#b91c1c',    // Darker Red
    'green': '#166534',  // Darker Green
    'white': '#707070',  // Darker Gray
    'pink': '#ff00ff',   // Magenta
    'yellow': '#b45309'  // Darker Yellow/Amber
  };
  return colorMap[colorName] || colorName;
}

function getPlayerLogColor(colorName) {
  const colorMap = {
    'red': 'red',    // LightCoral
    'green': '#32cd32',  // Lime
    'white': '#E0E0E0',  // Lighter Gray
    'pink': '#ff00ff',   // Magenta
    'yellow': '#FFD700'  // Gold
  };
  return colorMap[colorName] || colorName;
}



function colorToCssClass(color) {
  const map = {
    'red': 'red',
    'green': 'green',
    'white': 'gray',
    'pink': 'pink',
    'yellow': 'yellow'
  };
  return map[color] || 'gray';
}

async function handleScoreTrackClick(color, ageIndex) {
    if (clientPlayer.value?.prompt === 'advance' && clientPlayer.value?.color === color) {
        if (ageIndex < 3 && advancementState.value.tempScoreTrack[ageIndex] > 0 && advancementState.value.pendingCrowns > 0) {
            // Locally plan the advance
            advancementState.value.advances.push(ageIndex);
            advancementState.value.tempScoreTrack[ageIndex]--;
            advancementState.value.tempScoreTrack[ageIndex + 1]++;
            advancementState.value.pendingCrowns--;
        }
    } else if (
        clientPlayer.value?.prompt === 'retreat' &&
        clientPlayer.value?.color === color &&
        ageIndex > 0 && // Can't retreat from Age I
        clientPlayer.value.scoreTrack[ageIndex] > 0
    ) {
        await retreatCrown(gameData.value.lobbyId, clientPlayer.value.id, ageIndex);
    }
}

function resetAdvancement() {
  if (clientPlayer.value) {
    advancementState.value.pendingCrowns = clientPlayer.value.crowns;
    advancementState.value.advances = [];
    advancementState.value.tempScoreTrack = [...clientPlayer.value.scoreTrack];
  }
}

async function confirmAdvancement() {
  await advanceCrown(gameData.value.lobbyId, clientPlayer.value.id, { advances: advancementState.value.advances });
}

function inspectItem(item, type) {
  if (item.id === 'sage') {
    inspectedItem.value = {
      name: 'Sage',
      description: 'When you visit a Zone you rule, first draw a card',
      color: '#d2b48c', // Tan color for Sage
      type: 'token',
    };
    return;
  }
  if (item.id === 'poison-token') {
    inspectedItem.value = {
      name: 'Poison',
      description: 'At the end of your next turn, lose $4 and discard a card.',
      color: 'purple',
      type: 'token',
      id: 'poison-token',
    };
    return;
  }

  const description = (item.description || '').replace(/\*/g, '\n');
  if (type === 'zone') {
    inspectedItem.value = {
      name: item.name, 
      description: description,
      box: item.box,
      color: item.color,
      id: item.id, // Add the zone ID here
      type: 'zone',
    };
  } else if (type === 'card') {
    inspectedItem.value = {
      name: item.name,
      description: description,
      coin: item.coin,
      cost: item.cost,
      score: item.score,
      cardType: item.type,
      type: 'card',
      costForDisplay: item.cost, // Store original cost for display
      scoreInstruction: item['score-instruction'],
      secret: item.secret,
    };
  }
}

function closeInspector() {
  inspectedItem.value = null;
}

function getAssociatedItem(zoneId) {
  if (zoneId === 'scientist-enclave' || zoneId === 'zombie-apocalypse') {
    const card = gameData.value?.allCards?.find(c => c.id === 'gizmo');
    if (card) return { ...card, itemType: 'card' };
  }
  if (zoneId === 'ancient-carthage' || zoneId === 'endless-city') {
    const card = gameData.value?.allCards?.find(c => c.id === 'trade-goods');
    if (card) return { ...card, itemType: 'card' };
  }
  if (zoneId === 'underground-haven') {
    return { id: 'sage', name: 'Sage', itemType: 'token' };
  }
  if (zoneId === 'poison-earth') {
    return { id: 'poison-token', name: 'Poison', itemType: 'token' };
  }
  if (zoneId === 'age-of-atlantis') {
    return { id: 'hq', name: 'HQ', itemType: 'token' };
  }
  if (zoneId === 'greek-america' || zoneId === 'new-france') {
    return { id: 'base', name: 'Base', itemType: 'token' };
  }
  return null;
}

function getCardTypeColor(card, forText = false) {
  if (card.secret) return '#F08080';
  if (card.cardType === 'M') return '#f7ecb9ff';
  if (card.cardType === 'P') return forText ? '#87CEFA' : '#c6d7eaff';
  return '#fff';
}

function getPlayerColorById(playerId) {
    const player = playersById.value[playerId];
    return player ? player.color : 'grey';
}

async function handleBabylonianChoice(choice) {
  await resolveBabylonianChoice(gameData.value.lobbyId, clientPlayer.value.id, { choice });
}

async function handleY2KDecline() {
  await resolveY2KDiscard(gameData.value.lobbyId, clientPlayer.value.id, { cardIndex: null });
}

async function handleInquisitionChoice(cardIndex) {
  await resolveInquisition(gameData.value.lobbyId, clientPlayer.value.id, { cardIndex });
}

async function handleChoosePostVisit(choiceId) {
  await choosePostVisit(gameData.value.lobbyId, clientPlayer.value.id, choiceId);
}

async function handleChooseEndOfTurn(choiceId) {
  await chooseEndOfTurn(gameData.value.lobbyId, clientPlayer.value.id, choiceId);
}

async function handleChooseStartOfTurn(choiceId) {
  await chooseStartOfTurn(gameData.value.lobbyId, clientPlayer.value.id, choiceId);
}

</script>

<template>
  <div class="game-interface">
    <!-- Inspector Modal -->
    <div v-if="inspectedItem" class="inspector-overlay" :style="{ zIndex: (showAllCardsModal || showAllZonesModal) ? 1001 : 1000 }" @click="closeInspector">
      <div class="inspector-modal" @click.stop>
        <button class="close-btn" @click="closeInspector">X</button>
        <div class="inspector-header" :style="{ backgroundColor: inspectedItem.type === 'card' ? getCardTypeColor(inspectedItem) : inspectedItem.color }">
          {{ inspectedItem.name }}
        </div>
        <div class="inspector-body">
          <div v-if="inspectedItem.type === 'card'" class="inspector-coins">
            <CoinIcon :amount="inspectedItem.coin" />
          </div>
          <div class="inspector-content-wrapper" :class="{ 'column-layout': inspectedItem.box || inspectedItem.secret || getAssociatedItem(inspectedItem.id) }">
            <p class="inspector-description">
              <span v-for="(part, index) in inspectedDescriptionParts" :key="index">
                <CoinIcon v-if="part.type === 'coin'" :amount="part.value" class="inline-coin-icon" />
                <CrownIcon v-else-if="part.type === 'crown'" fill="gold" class="inline-crown-icon" />
                <Hourglass v-else-if="part.type === 'hourglass'" class="inline-hourglass-icon" />
                <template v-else>{{ part.value }}</template>
              </span>
            </p>
          <p v-if="inspectedItem.secret" class="inspector-secret-text">
            <span v-for="(part, index) in inspectedSecretParts" :key="index">
              <template v-if="part.type === 'text'">{{ part.value }}</template>
              <!-- You can add icon handling here if secrets can contain icons -->
            </span>
          </p>
            <div v-if="inspectedItem.type === 'zone' && getAssociatedItem(inspectedItem.id)" class="inspector-associated-card-container">
              <template v-if="getAssociatedItem(inspectedItem.id).itemType === 'card'">
                <div class="hand-card" :class="{ 'card-m': getAssociatedItem(inspectedItem.id).type === 'M', 'card-p': getAssociatedItem(inspectedItem.id).type === 'P', 'card-s': getAssociatedItem(inspectedItem.id).type === 'S' }" @contextmenu.prevent="inspectItem(getAssociatedItem(inspectedItem.id), 'card')">
                  <div class="card-header">
                    {{ getAssociatedItem(inspectedItem.id).name }}
                  </div>
                  <div class="card-coins"><CoinIcon :amount="getAssociatedItem(inspectedItem.id).coin" /></div>
                  <div class="card-score"><CoinIcon :amount="getAssociatedItem(inspectedItem.id).cost" class="inline-coin-icon" /> for {{ getAssociatedItem(inspectedItem.id).score }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
                </div>
              </template>
              <template v-else-if="getAssociatedItem(inspectedItem.id).itemType === 'token' && ['hq', 'base'].includes(getAssociatedItem(inspectedItem.id).id)">
                <div class="associated-token-icon-container">
                  <HQIcon v-if="getAssociatedItem(inspectedItem.id).id === 'hq'" fill="#d2b48c" class="associated-token-icon" />
                  <BaseIcon v-if="getAssociatedItem(inspectedItem.id).id === 'base'" fill="#d2b48c" class="associated-token-icon" />
                  <span class="associated-token-name">{{ getAssociatedItem(inspectedItem.id).name }}</span>
                </div>
              </template>
              <template v-else-if="getAssociatedItem(inspectedItem.id).itemType === 'token'">
                <div
                  class="perpetual-card"
                  :class="{
                    'sage-card': getAssociatedItem(inspectedItem.id).id === 'sage',
                    'poison-card': getAssociatedItem(inspectedItem.id).id === 'poison-token',
                  }"
                  @contextmenu.prevent="inspectItem(getAssociatedItem(inspectedItem.id), 'token')"
                >
                  {{ getAssociatedItem(inspectedItem.id).name }}
                </div>
              </template>
            </div>
            <p v-if="inspectedItem.box" class="inspector-box-text">
              <span v-for="(part, index) in inspectedBoxParts" :key="index">
                <CoinIcon v-if="part.type === 'coin'" :amount="part.value" class="inline-coin-icon" />
                <CrownIcon v-else-if="part.type === 'crown'" fill="gold" class="inline-crown-icon" />
                <Hourglass v-else-if="part.type === 'hourglass'" class="inline-hourglass-icon" />
                <template v-else>{{ part.value }}</template>
              </span>
            </p>
          </div>
        </div>
        <div v-if="inspectedItem.type === 'card'" class="inspector-score">
          <div v-if="inspectedItem.scoreInstruction" class="score-instruction-text">
            {{ inspectedItem.scoreInstruction }}
          </div>
          <div class="score-cost-line">
            <CoinIcon :amount="inspectedItem.costForDisplay" class="inline-coin-icon" /> for {{ inspectedItem.score }} <CrownIcon fill="gold" class="inline-crown-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Resign Confirmation Modal -->
    <div v-if="showResignConfirm" class="inspector-overlay" @click="onConfirmResign(false)">
      <div class="inspector-modal" @click.stop>
        <div class="inspector-body">
          <p class="inspector-description" style="line-height: 1.5; padding: 20px;">
            Are you sure you would like to resign the game?
          </p>
        </div>
        <div class="dialog-buttons">
          <button class="option-btn" @click="onConfirmResign(true)">Yes</button>
          <button class="option-btn" @click="onConfirmResign(false)">No</button>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelpModal" class="inspector-overlay" @click="showHelpModal = false">
      <div class="inspector-modal" @click.stop>
        <button class="close-btn" @click="showHelpModal = false">X</button>
        <div class="inspector-header">
          Help
        </div>
        <div class="inspector-body" style="justify-content: space-around;">
          <a href="https://www.riograndegames.com/wp-content/uploads/2014/07/Temporum-Rules.pdf" target="_blank" rel="noopener noreferrer" class="rules-link">
            Rulebook
          </a>
          <a v-if="gameData.alternateRealities" href="https://www.riograndegames.com/wp-content/uploads/2016/07/Temporum-Alternate-Realities-Rules.pdf" target="_blank" rel="noopener noreferrer" class="rules-link">
            Alternate Realities Rulebook
          </a>
          <button class="rules-link" @click="onShowAllCardsClick">See All Cards</button>
          <button class="rules-link" @click="onShowAllZonesClick">See All Zones</button>
        </div>
      </div>
    </div>

    <!-- All Cards Modal -->
    <div v-if="showAllCardsModal" class="inspector-overlay" @click="showAllCardsModal = false">
      <div class="all-cards-modal" @click.stop>
        <button class="close-btn" @click="showAllCardsModal = false">X</button>
        <div class="all-cards-tabs">
          <button class="tab-btn" :class="{ active: allCardsActiveTab === 'base' }" @click="allCardsActiveTab = 'base'">Base Cards</button>
          <button v-if="gameData.alternateRealities" class="tab-btn" :class="{ active: allCardsActiveTab === 'alternate' }" @click="allCardsActiveTab = 'alternate'">Alternate Cards</button>
        </div>
        <input type="text" v-model="cardSearchQuery" class="modal-search-bar" placeholder="Search by name or description...">
        <div class="all-cards-grid">
          <template v-if="allCardsActiveTab === 'base'">
            <div v-for="card in filteredBaseCards" :key="card.id" class="hand-card" :class="{ 'card-m': card.type === 'M' && !card.secret, 'card-p': card.type === 'P', 'card-secret': card.secret }" @contextmenu.prevent="inspectItem(card, 'card')">
              <div class="card-header">{{ card.name }}</div>
              <div class="card-coins"><CoinIcon :amount="card.coin" /></div>
              <div class="card-score"><CoinIcon :amount="card.cost" class="inline-coin-icon" /> for {{ card.score }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
            </div>
          </template>
          <template v-if="allCardsActiveTab === 'alternate'">
            <div v-for="card in filteredAlternateCards" :key="card.id" class="hand-card" :class="{ 'card-m': card.type === 'M' && !card.secret, 'card-p': card.type === 'P', 'card-secret': card.secret }" @contextmenu.prevent="inspectItem(card, 'card')">
              <div class="card-header">{{ card.name }}</div>
              <div class="card-coins"><CoinIcon :amount="card.coin" /></div>
              <div class="card-score"><CoinIcon :amount="card.cost" class="inline-coin-icon" /> for {{ card.score }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- All Zones Modal -->
    <div v-if="showAllZonesModal" class="inspector-overlay" @click="showAllZonesModal = false">
      <div class="all-cards-modal" @click.stop>
        <button class="close-btn" @click="showAllZonesModal = false">X</button>
        <div class="all-cards-tabs">
          <button class="tab-btn" :class="{ active: allZonesActiveTab === 'base' }" @click="allZonesActiveTab = 'base'">Base Zones</button>
          <button v-if="gameData.alternateRealities" class="tab-btn" :class="{ active: allZonesActiveTab === 'alternate' }" @click="allZonesActiveTab = 'alternate'">Alternate Zones</button>
        </div>
        <input type="text" v-model="zoneSearchQuery" class="modal-search-bar" placeholder="Search by name or description...">
        <div class="all-zones-grid">
          <template v-if="allZonesActiveTab === 'base'">
            <div v-for="zone in filteredBaseZones" :key="zone.id" class="zone zone-modal-card" @contextmenu.prevent="inspectItem(zone, 'zone')">
              <div class="zone-header" :style="{ backgroundColor: zone.color }">{{ zone.name }}</div>
              <div class="zone-modal-age">Age {{ zone.age }}</div>
            </div>
          </template>
          <template v-if="allZonesActiveTab === 'alternate'">
            <div v-for="zone in filteredAlternateZones" :key="zone.id" class="zone zone-modal-card" @contextmenu.prevent="inspectItem(zone, 'zone')">
              <div class="zone-header" :style="{ backgroundColor: zone.color }">{{ zone.name }}</div>
              <div class="zone-modal-age">Age {{ zone.age }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- Left Panel - Player Stats -->
    <div class="left-panel">
      <li v-for="player in gameData?.players" :key="player.id">
        <div class="player-card" :class="[colorToCssClass(player.color), { 'active-player': player.active }]" @click="togglePlayerPerpetuals(player.id)">
          <div class="player-name">{{ player.name }} <span v-if="player.id === user?.uid">(You)</span></div>
          <div class="player-stats">
            <div class="player-stat-item">Coins: <CoinIcon :amount="player.coins" class="inline-coin-icon"/></div>
            <div class="player-stat-item">Cards: {{ player.id === user?.uid ? (localPlayerHand?.length ?? 0) : player.handCount }}</div>
            <div v-if="player.gizmoCount > 0" class="player-stat-item">Gizmos: {{ player.gizmoCount }}</div>
            <div v-if="player.tradeGoodsCount > 0" class="player-stat-item">Trade Goods: {{ player.tradeGoodsCount }}</div>
          </div>
        </div>
        <div v-if="expandedPlayers.has(player.id)" class="player-perpetuals-list">
          <h4 class="perpetuals-header">Perpetuals & Tokens:</h4>
          <div v-if="getPerpetualsForPlayer(player).length === 0 && getPoisonTokensForPlayer(player).length === 0" class="no-perpetuals">
            None
          </div>
          <div v-else class="perpetual-scroll-small">
            <div class="perpetual-and-tokens-container">
              <div 
                v-for="card in getPerpetualsForPlayer(player)" 
                :key="card.instanceId || card.id"
                class="perpetual-card" 
                :class="{ 'sage-card': card.id === 'sage' }"
                @contextmenu.prevent="inspectItem(card, 'card')">
                {{ card.name }}
              </div>
              <div 
                v-for="token in getPoisonTokensForPlayer(player)" 
                :key="token.instanceId"
                class="perpetual-card poison-card" 
                @contextmenu.prevent="inspectItem({ id: 'poison-token' }, 'token')">
                {{ token.name }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="gameData.status === 'in-progress' && gameData.ownerId === user?.uid && !player.isAI && player.id !== user.uid && !isPlayerOnline(player)" class="replace-ai-section">
            <button 
              class="replace-ai-btn"
              @click="onReplaceWithAI(player.id)">
              Replace with AI?
            </button>
        </div>
      </li>
      
      <!-- Options -->
      <div class="options">
        <template v-if="clientPlayer?.prompt === 'changeHist'">
          <button class="option-btn" @click="onChangeHistory">Change History</button>
          <button class="option-btn" @click="onDeclineChangeHistory">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'visitZone'">
          <!-- Instruction for the player -->
          <p class="prompt-instruction">Select a highlighted zone to visit.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'anubisVisit'">
          <p class="prompt-instruction">Anubis Statuette: Select any unvisited zone to visit.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'score'">
          <p class="prompt-instruction">Select a card from your hand to score.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'play'">
          <p class="prompt-instruction">Select a card from your hand to play.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'space-age'">
          <p class="prompt-instruction">Space Age: You may score another card.</p>
          <p class="prompt-instruction">(Click a card to score)</p>
          <button class="option-btn" @click="onResolveChoice(false, 'space-age')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'advance'">
          <p class="prompt-instruction">Advancing {{ clientPlayer.crowns }} <CrownIcon fill="gold" class="inline-crown-icon" /></p>
          <p class="prompt-instruction">Click a score track to plan an advancement.</p>
          <p class="prompt-instruction">Remaining: {{ advancementState.pendingCrowns }}</p>
          <div class="dialog-buttons">
            <button class="option-btn" @click="resetAdvancement">Reset</button>
            <button class="option-btn" @click="confirmAdvancement" :disabled="advancementState.pendingCrowns > 0">Confirm</button>
          </div>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'choose'">
          <!-- Instruction for the player -->
          <button class="option-btn" @click="onChooseScoreCard">Score a card</button>
          <button class="option-btn" @click="onChooseDrawCards">Draw 2 cards</button>
          <button class="option-btn" @click="onChoosePlayCard">Play a card</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'ancient-greece'">
          <p class="prompt-instruction">Ancient Greece: Pay <CoinIcon amount="4" class="inline-coin-icon"/> to draw a card?</p>
          <button class="option-btn" @click="onResolveChoice(true,'ancient-greece')" :disabled="clientPlayer.coins < 4">Pay <CoinIcon amount="4" class="inline-coin-icon"/>, Draw 1</button>
          <button class="option-btn" @click="onResolveChoice(false,'ancient-greece')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'cats'">
          <p class="prompt-instruction">Age of Cats: Pay <CoinIcon amount="10" class="inline-coin-icon"/> to score a card for double cost and crowns?</p>
          <button class="option-btn" @click="onResolveChoice(true, 'cats')" :disabled="clientPlayer.coins < 10">Pay <CoinIcon amount="10" class="inline-coin-icon"/> and Score</button>
          <button class="option-btn" @click="onResolveChoice(false, 'cats')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'toys'">
          <p class="prompt-instruction">Age of Toys: Pay <CoinIcon amount="4" class="inline-coin-icon"/> to draw 2 cards, play one, and discard the other?</p>
          <button class="option-btn" @click="onResolveChoice(true, 'toys')" :disabled="clientPlayer.coins < 4">Pay <CoinIcon amount="4" class="inline-coin-icon"/> and Draw</button>
          <button class="option-btn" @click="onResolveChoice(false, 'toys')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'toys-choice'">
          <p class="prompt-instruction">Age of Toys: Select a card to play. The other will be discarded.</p>
          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
            <div 
              v-for="item in toysChoiceCards"
              :key="item.card.id"
        class="hand-card clickable" :class="{ 'card-m': item.card.type === 'M', 'card-p': item.card.type === 'P', 'card-s': item.card.type === 'S' }"
              @click="handleToysChoiceClick(item.index)">
              <div class="card-header">
                {{ item.card.name }}
              </div>
              <div class="card-coins"><CoinIcon :amount="item.card.coin" /></div>
              <div class="card-score"><CoinIcon :amount="item.card.cost" class="inline-coin-icon" /> for {{ item.card.score }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
            </div>
          </div>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'imperial-china'">
          <p class="prompt-instruction">Imperial China: Discard a card for <CoinIcon amount="4" class="inline-coin-icon"/>?</p>
          <p class="prompt-instruction">(Click a card to discard)</p>
          <button class="option-btn" @click="onResolveChoice(false, 'imperial-china')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'greek-america-base-choice'">
          <p class="prompt-instruction">Greek America: Place a Base here?</p>
          <button class="option-btn" @click="onResolveChoice(true, 'greek-america-base-choice')">Place Base</button>
          <button class="option-btn" @click="onResolveChoice(false, 'greek-america-base-choice')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'scientist-enclave'">
          <p class="prompt-instruction">Scientist Enclave: Retreat a <CrownIcon fill="gold" class="inline-crown-icon" /> from Age II to take a Gizmo?</p>
          <button class="option-btn" @click="onResolveChoice(true, 'scientist-enclave')" :disabled="clientPlayer.scoreTrack[1] === 0">Retreat <CrownIcon fill="gold" class="inline-crown-icon" />, Take Gizmo</button>
          <button class="option-btn" @click="onResolveChoice(false, 'scientist-enclave')">Draw 2 cards</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'gizmo-choice'">
          <p class="prompt-instruction">Gizmo: Choose a Momentary card from your hand to play twice.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'singularity-choice'">
          <p class="prompt-instruction">Singularity: Pay <CoinIcon amount="10" class="inline-coin-icon"/> to take 2 extra turns?</p>
          <button class="option-btn" @click="onResolveChoice(true, 'singularity')" :disabled="clientPlayer.coins < 10">Pay <CoinIcon amount="10" class="inline-coin-icon"/>, Get 2 Extra Turns</button>
          <button class="option-btn" @click="onResolveChoice(false, 'singularity')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'trade-goods-choice'">
          <p class="prompt-instruction">Trade Goods: Choose your reward.</p>
          <button class="option-btn" @click="handleResolveTradeGoods('draw')">Draw 2 cards</button>
          <button class="option-btn" @click="handleResolveTradeGoods('gain')">Gain <CoinIcon amount="8" class="inline-coin-icon"/></button>
          <button class="option-btn" @click="handleResolveTradeGoods('draw-gain')">Draw 1 card & Gain <CoinIcon amount="4" class="inline-coin-icon"/></button>
        </template>

        <template v-else-if="clientPlayer?.prompt === 'greek-america-discard-choice'">
          <p class="prompt-instruction">Greek America: Discard a card to gain <CoinIcon amount="6" class="inline-coin-icon"/>?</p>
          <p class="prompt-instruction">(Click a card to discard)</p>
          <button class="option-btn" @click="onResolveChoice(false, 'greek-america-discard-choice')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'inquisition'">
          <p class="prompt-instruction">Inquisition: Discard a card or lose <CoinIcon amount="2" class="inline-coin-icon"/>?</p>
          <p v-if="localPlayerHand?.length > 0" class="prompt-instruction">(Click a card to discard)</p>
          <button v-if="localPlayerHand?.length > 0" class="option-btn" @click="handleInquisitionChoice(null)">Lose <CoinIcon amount="2" class="inline-coin-icon"/></button>
          <button v-else class="option-btn" @click="handleInquisitionChoice(-1)">Discard none</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'investments-choice'">
          <p class="prompt-instruction">Investments: Discard to gain half of money earned this turn?</p>
          <button class="option-btn" @click="handleResolveInvestments(true)">Discard for <CoinIcon :amount="Math.floor((clientPlayer.moneyGainedThisTurn || 0) / 2)" class="inline-coin-icon"/></button>
          <button class="option-btn" @click="handleResolveInvestments(false)">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'sunboat-choice'">
          <p class="prompt-instruction">Sunboat of Ra: Discard to take an extra turn?</p>
          <button class="option-btn" @click="handleResolveSunboat(true)">Discard for Extra Turn</button>
          <button class="option-btn" @click="handleResolveSunboat(false)">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'treasure-map-choice'">
          <p class="prompt-instruction">Treasure Map: Discard to draw 2 cards?</p>
          <button class="option-btn" @click="handleResolveTreasureMap(true)">Discard and Draw</button>
          <button class="option-btn" @click="handleResolveTreasureMap(false)">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'inventor'">
          <p class="prompt-instruction">Inventor: Choose your reward.</p>
          <button class="option-btn" @click="onResolveInventor('draw')">Draw 2 cards</button>
          <button class="option-btn" @click="onResolveInventor('gain')">Gain <CoinIcon amount="8" class="inline-coin-icon"/></button>
          <button class="option-btn" @click="onResolveInventor('advance')">Advance 2 <CrownIcon fill="gold" class="inline-crown-icon" /></button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'feudal-japan'">
          <p class="prompt-instruction">Feudal Japan: Discard your hand to draw the same number of cards?</p>
          <button class="option-btn" @click="onResolveChoice(true,'feudal-japan')">Discard and Draw</button>
          <button class="option-btn" @click="onResolveChoice(false,'feudal-japan')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'industrial-revolution'">
          <p class="prompt-instruction">Industrial Revolution: Return the card you played to your hand?</p>
          <button class="option-btn" @click="onResolveChoice(true, 'industrial-revolution')">Return to Hand</button>
          <button class="option-btn" @click="onResolveChoice(false, 'industrial-revolution')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'retreat'">
          <p class="prompt-instruction">Bureaucracy: Retreat one of your crowns.</p>
          <p class="prompt-instruction">Click a score track (Time II-IV) to retreat a crown.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'predict-the-future'">
          <p class="prompt-instruction">Predict the Future: Change history in this zone?</p>
          <button class="option-btn" @click="onResolvePredictTheFuture(true)">Change History</button>
          <button class="option-btn" @click="onResolvePredictTheFuture(false)">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'age-of-plastic'">
          <p class="prompt-instruction">Age of Plastic: Choose your reward.</p>
          <button v-if="clientPlayer.promptContext.canGainMoney" class="option-btn" @click="onResolveChoice('gain', 'age-of-plastic')">
            Gain <CoinIcon amount="4" class="inline-coin-icon"/>
          </button>
          <button v-if="clientPlayer.promptContext.canDrawCard" class="option-btn" @click="onResolveChoice('draw', 'age-of-plastic')">Draw a Card</button>
          <button v-if="!clientPlayer.promptContext.canGainMoney || !clientPlayer.promptContext.canDrawCard" class="option-btn" @click="onResolveChoice('decline', 'age-of-plastic')">
            Decline
          </button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'discard'">
          <p class="prompt-instruction">Discard a card from your hand.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'discard-many'">
          <p class="prompt-instruction">Select cards to discard.</p>
          <button class="option-btn" @click="onDiscardMany">Discard</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'discard-n'">
          <p class="prompt-instruction">
            {{ clientPlayer.promptContext?.source?.name || 'Action' }}: Select exactly {{ clientPlayer.promptContext?.required || 'N' }} cards to discard.
          </p>
          <button v-if="discardSelection.length === clientPlayer.promptContext?.required" class="option-btn" @click="onDiscardMany">Discard {{ clientPlayer.promptContext?.required }} Cards</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'cybernetics-perpetual'">
          <p class="prompt-instruction">Age of Cybernetics: Select a perpetual card to copy.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'cybernetics-hand'">
          <p class="prompt-instruction">Age of Cybernetics: Select a card from your hand to play as the copied perpetual card.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'pass-card'">
          <p class="prompt-instruction">Age of Cults: Select a card to pass.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'return-card'">
          <p class="prompt-instruction">Bright Ages: Select a card to return to the top of the deck.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'move'">
          <p class="prompt-instruction">Select a highlighted zone to move to.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'simulatedChoice'">
          <p class="prompt-instruction">Simulated Paradise: Select a zone to simulate.</p>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'alien-contact'">
          <p class="prompt-instruction">Alien Contact: You may score the card you drew.</p>
          <div v-if="alienContactCard" style="display: flex; justify-content: center; margin-bottom: 10px;">
            <div
              class="hand-card clickable" 
              :class="{ 
                'card-m': alienContactCard.type === 'M', 
                'card-p': alienContactCard.type === 'P',
                'card-s': alienContactCard.type === 'S',
                'scoreable': clientPlayer.scoreableCards?.includes(clientPlayer.hand.length - 1) 
              }"
              @click="handleCardClick(alienContactCard, localPlayerHand.length - 1)">
              <div class="card-header">
                {{ alienContactCard.name }}
              </div>
              <div class="card-coins"><CoinIcon :amount="alienContactCard.coin" /></div>
              <div class="card-score"><CoinIcon :amount="alienContactCard.cost" class="inline-coin-icon" /> for {{ alienContactCard.score }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
            </div>
          </div>
          <button class="option-btn" @click="onResolveChoice(false, 'alien-contact')">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'babylonian-choice'">
          <p class="prompt-instruction">Babylonian Bazaar: Pay <CoinIcon amount="10" class="inline-coin-icon"/> to draw 2 cards and advance 2 <CrownIcon fill="gold" class="inline-crown-icon" />?</p>
          <button class="option-btn" @click="handleBabylonianChoice(true)" :disabled="clientPlayer.coins < 10">Pay <CoinIcon amount="10" class="inline-coin-icon"/></button>
          <button class="option-btn" @click="handleBabylonianChoice(false)">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'y2k-discard'">
          <p class="prompt-instruction">Y2K: Discard a Perpetual card to gain <CoinIcon amount="12" class="inline-coin-icon"/>?</p>
          <p class="prompt-instruction">(Click a card to discard)</p>
          <button class="option-btn" @click="handleY2KDecline">Decline</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'post-visit-choice'">
          <p class="prompt-instruction">Choose a post-visit effect to resolve:</p>
          <button 
            v-for="choice in clientPlayer.promptContext.choices" 
            :key="choice.id" 
            class="option-btn" 
            @click="handleChoosePostVisit(choice.id)">{{ choice.label }}</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'end-of-turn-choice'">
          <p class="prompt-instruction">Choose an end-of-turn effect to resolve:</p>
          <button 
            v-for="choice in clientPlayer.promptContext.choices" 
            :key="choice.id" 
            class="option-btn" 
            @click="handleChooseEndOfTurn(choice.id)">{{ choice.label }}</button>
        </template>
        <template v-else-if="clientPlayer?.prompt === 'start-of-turn-choice'">
          <p class="prompt-instruction">Choose a start-of-turn effect to resolve, or play a Secret card from your hand.</p>
          <button 
            v-for="choice in clientPlayer.promptContext.choices" 
            :key="choice.id" 
            class="option-btn" 
            @click="handleChooseStartOfTurn({choiceId: choice.id})">{{ choice.label }}</button>
        </template>
      </div>
    </div>
    
    <!-- Center Panel - Game Tree -->
  <div class="center-panel">
    <!-- Define SVG markers once, hidden from layout -->
    <svg style="width:0;height:0;position:absolute;">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
    </svg>

    <!-- Top Card Display -->
    <div v-if="gameData?.topCard" class="top-card-display">
      <div class="top-card-label">Top of Deck:</div>
      <div class="hand-card" :class="{ 'card-m': gameData.topCard.type === 'M', 'card-p': gameData.topCard.type === 'P', 'card-s': gameData.topCard.type === 'S' }" @contextmenu.prevent="inspectItem(gameData.topCard, 'card')">
        <div class="card-header">{{ gameData.topCard.name }}</div>
        <div class="card-coins"><CoinIcon :amount="gameData.topCard.coin" /></div>
        <div class="card-score"><CoinIcon :amount="gameData.topCard.cost" class="inline-coin-icon" /> for {{ gameData.topCard.score }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
      </div>
    </div>

    <template v-if="zoneRows.length > 0">
      <div v-for="(row, rowIndex) in zoneRows" :key="rowIndex">
        <div class="tree-row" :class="`row-${rowIndex + 1}`">
          <div v-for="zone in row" :key="zone.id" class="zone"
            :class="{ 'real-zone': gameData.realZones?.includes(zone.originalIndex),
                      'clickable': (['visitZone', 'anubisVisit'].includes(clientPlayer?.prompt) && gameData.legalZones?.includes(zone.originalIndex)),
                      'move-targetable': (clientPlayer?.prompt === 'move' && gameData.legalZones?.includes(zone.originalIndex)),
                      'sim-targetable': (clientPlayer?.prompt === 'simulatedChoice' && gameData.legalZones?.includes(zone.originalIndex)),
                      'set-hq-targetable': (clientPlayer?.prompt === 'set-hq' && gameData.legalZones?.includes(zone.originalIndex))
                    }"
            @click="handleZoneClick(zone)"
            @contextmenu.prevent="inspectItem(zone, 'zone')"
          >
            <div class="zone-header" :style="{ backgroundColor: zone.color, height: (zone.id === 'simulated-paradise' && simulatedZoneObject) ? '25px' : '35px' }"> {{ zone.name }} </div>
            <div v-if="zone.id === 'simulated-paradise' && simulatedZoneObject"
                 class="zone-header simulated-zone-header"
                 :style="{ backgroundColor: simulatedZoneObject.color }">
              {{ simulatedZoneObject.name }}
            </div>
            <div class="zone-icons">
              <div v-if="zoneIcons[zone.originalIndex]" class="icon-container">
                <div v-for="icon in zoneIcons[zone.originalIndex]" :key="`${icon.type}-${icon.id}`" class="icon-wrapper" :style="iconSizing[zone.originalIndex]">
                  <template v-if="icon.type === 'player'">
                    <PlayerIcon :fill="icon.color" class="player-symbol" :style="iconSizing[zone.originalIndex]" />
                  </template>
                  <template v-else-if="icon.type === 'hq'">
                    <HQIcon :fill="icon.color" class="hq-symbol" :style="iconSizing[zone.originalIndex]" />
                  </template>
                  <template v-else-if="icon.type === 'base'">
                    <BaseIcon :fill="icon.color" class="base-symbol" :style="iconSizing[zone.originalIndex]" />
                  </template>
                  <template v-else-if="icon.type === 'hourglass'">
                    <Hourglass :number="icon.number" class="hourglass-symbol" :style="iconSizing[zone.originalIndex]" />
                  </template>
                </div>
              </div>
              <div v-if="zone.has_coin" class="zone-coin-container"><CoinIcon :amount="2" class="zone-coin-icon"/></div>
            </div>
          </div>
        </div>

        <div v-if="rowIndex === 0" class="connections">
          <svg class="connection-svg">
            <line v-if="(gameData?.arrows[0] != true)" x1="150" y1="10" x2="50" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[0] == true)" x1="150" y1="10" x2="250" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
          </svg>
        </div>
        <div v-else-if="rowIndex === 1" class="connections">
          <svg class="connection-svg">
            <line v-if="(gameData?.arrows[1] != true)" x1="100" y1="10" x2="0" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[1] == true)" x1="100" y1="10" x2="200" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[2] != true)" x1="340" y1="10" x2="240" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[2] == true)" x1="340" y1="10" x2="440" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
          </svg>
        </div>
        <div v-else-if="rowIndex === 2" class="connections">
          <svg class="connection-svg">
            <line v-if="(gameData?.arrows[3] != true)" x1="100" y1="10" x2="0" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[3] == true)" x1="100" y1="10" x2="200" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[4] != true)" x1="340" y1="10" x2="240" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[4] == true)" x1="340" y1="10" x2="440" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[5] != true)" x1="580" y1="10" x2="480" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line v-if="(gameData?.arrows[5] == true)" x1="580" y1="10" x2="680" y2="100%" stroke="black" stroke-width="2" marker-end="url(#arrowhead)"/>
          </svg>
        </div>
      </div>
    </template>
  </div>
    
    <!-- Right Panel -->
    <div class="right-panel">
      <!-- Color Strips -->
      <div class="color-strips">
        <div v-for="color in ['red', 'green', 'white', 'pink', 'yellow']" :key="color" class="color-strip">
          <template v-if="playersByColor[color]">
            <!-- Determine which score track to display -->
            <template v-if="clientPlayer?.prompt === 'advance' && clientPlayer?.color === color">
              <div v-for="ageIndex in 4" :key="ageIndex" class="color-section" :class="[colorToCssClass(color), { 'advance-interactive': (ageIndex - 1) < 3 && advancementState.tempScoreTrack[ageIndex - 1] > 0 }]" @click="handleScoreTrackClick(color, ageIndex - 1)">
                <div class="crown-container">
                  <CrownIcon v-for="n in advancementState.tempScoreTrack[ageIndex - 1]" :key="n" :fill="getPlayerLogColor(color)" class="crown-symbol" />
                </div>
              </div>
            </template>
            <template v-else>
            <div v-for="ageIndex in 4" :key="ageIndex" 
                class="color-section"
                :class="[colorToCssClass(color), { 'retreat-interactive': clientPlayer?.prompt === 'retreat' && clientPlayer?.color === color && (ageIndex - 1) > 0 && playersByColor[color].scoreTrack[ageIndex - 1] > 0 }]"
                @click="handleScoreTrackClick(color, ageIndex - 1)">
              <div class="crown-container">
                <CrownIcon v-for="n in playersByColor[color].scoreTrack[ageIndex - 1]" :key="n" :fill="getPlayerLogColor(color)" class="crown-symbol" />
              </div>
            </div>
            </template>
          </template>
          <template v-else>
            <!-- Render empty sections if color is not used -->
            <div v-for="ageIndex in 4" :key="ageIndex" class="color-section" :class="[colorToCssClass(color)]"></div>
          </template>
        </div>
      </div>
      
      <!-- Info Panels -->
      <div class="info-panels">
        <!-- Log Section -->
        <div class="log-section">
          <div class="section-header">Log</div>
          <div class="log-content" ref="logContent">
            <div v-for="(message, index) in gameData?.log" :key="index" class="log-message" :class="`log-${message.type}`" >
              <span v-for="(part, pIndex) in parseLogMessage(message)" :key="pIndex">
                <CoinIcon v-if="part.type === 'coin'" :amount="part.value" class="inline-coin-icon" />
                <CrownIcon v-else-if="part.type === 'crown'" fill="gold" class="inline-crown-icon" />
                <span v-else :style="part.style" style="white-space: pre-wrap;">{{ part.value }}</span>
              </span>
            </div>
          </div>
        </div>
        <div class="game-actions-bar">
          <button v-if="gameData?.status === 'in-progress' && clientPlayer && !clientPlayer.isAI" class="action-bar-btn" @click="onResignClick">Resign</button>
          <button v-if="gameData?.status === 'finished' || !clientPlayer" class="action-bar-btn" @click="onExitLobbyClick">Exit Lobby</button>
          <button class="action-bar-btn" @click="onHelpClick">Help</button>
        </div>
        <div v-if="gameData?.status === 'finished'" class="winner-declaration">
          Game Over!
          <div class="winner-name">{{ gameData.winner }} wins!</div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Panel - Cards -->
    <div class="bottom-panel">
      <!-- Hand Cards Scrollable -->
      <div v-if="clientPlayer"  class="hand-scroll">
        <li v-for="(card, index) in handForDisplay" :key="card.instanceId">
          <div 
            class="hand-card" 
            :class="{ 
              'card-m': card.type === 'M' && !card.secret,
              'card-p': card.type === 'P',
              'card-secret': card.secret, 'scoreable': ['score', 'space-age', 'alien-contact'].includes(clientPlayer.prompt) && clientPlayer.scoreableCards?.includes(index),
              'discardable': ['discard', 'imperial-china', 'inquisition', 'pass-card', 'greek-america-discard-choice', 'return-card'].includes(clientPlayer.prompt),
              'discard-selected': clientPlayer.prompt === 'discard-many' && discardSelection.includes(index),
              'discard-n-selected': clientPlayer.prompt === 'discard-n' && discardSelection.includes(index),
              'playable': clientPlayer.prompt === 'play',
              'cybernetics-playable': clientPlayer.prompt === 'cybernetics-hand',
              'y2k-discardable': clientPlayer.prompt === 'y2k-discard' && card.type === 'P',
              'gizmo-playable': clientPlayer.prompt === 'gizmo-choice' && card.type === 'M' && card.id !== 'gizmo',
              'clickable': ['score', 'space-age', 'alien-contact', 'discard', 'discard-many', 'imperial-china', 'inquisition', 'play', 'cybernetics-hand', 'pass-card', 'greek-america-discard-choice', 'return-card', 'y2k-discard'].includes(clientPlayer.prompt) ||
                           (clientPlayer.prompt === 'start-of-turn-choice' && card.secret),
              'card-secret-clickable': clientPlayer.prompt === 'start-of-turn-choice' && card.secret
            }"
            @click="handleCardClick(card, index)"
            @contextmenu.prevent="inspectItem(card, 'card')"
          >
            <div class="card-header">
              {{ card.name }}
            </div>
            
            <div class="card-coins"><CoinIcon :amount="card.coin" /></div>
            <div class="card-score">
              <template v-if="typeof card.displayCost === 'number'">
                <CoinIcon :amount="card.displayCost" class="inline-coin-icon" /> for
              </template>
              <template v-else>{{ card.displayCost }} for</template>
              {{ card.displayScore }} <CrownIcon fill="gold" class="inline-crown-icon" /></div>
          </div>
          </li>
      </div>
      

      <!-- Perpetual Cards Scrollable -->
      <div v-if="clientPlayer"  class="perpetual-scroll">
        <div 
          v-for="card in clientPlayerPerpetuals" 
          :key="card.instanceId || card.id" 
          class="perpetual-card" 
          :class="{ 
            'cybernetics-perpetual-selectable': clientPlayer.prompt === 'cybernetics-perpetual',
            'sage-card': card.id === 'sage',
          }"
          @contextmenu.prevent="inspectItem(card, 'card')"
          @click="onPerpetualClick(card)">
          {{ card.name }}
        </div>
        <div 
          v-for="token in getPoisonTokensForPlayer(clientPlayer)" 
          :key="token.instanceId"
          class="perpetual-card poison-card" 
          @contextmenu.prevent="inspectItem({ id: 'poison-token' }, 'token')">
          {{ token.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-crown-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  display: inline-block;
  margin: 0 0.1em;
}

.inline-coin-icon {
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.2em;
  display: inline-block;
  margin: 0 0.1em;
}

.inline-hourglass-icon {
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.2em;
  display: inline-block;
  margin: 0 0.1em;
}

.game-interface {
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  display: grid;
  grid-template-columns: minmax(250px, 15%) minmax(1000px, 1fr) minmax(450px, 30%);
  grid-template-rows: minmax(600px, 1fr) 260px;
  grid-template-areas: 
    "left center right"
    "bottom bottom bottom";
  height: 100vh;
  min-height: 860px;
  min-width: 1620px;
  width: 100%;
  background-color: #666;
  font-family: Arial, sans-serif;
  font-size: 12px;
  position: absolute;
  top: 0;
  left: 0;
  margin: 0 !important;
  padding: 0 !important;
}

/* Wrapper for scrolling */
body {
  overflow-x: auto;
  overflow-y: hidden;
}

/* Left Panel */
.left-panel {
  grid-area: left;
  padding: 10px;
  background-color: #3a3a3a;
  overflow-y: auto;
}

.player-card {
  margin-bottom: 0;
  padding: 8px;
  border: 1px solid black;
  color: #ddd;
  text-align: left;
  cursor: pointer;
}

.player-card.active-player {
  outline: 3px solid #c5b358; /* Gold color */
  outline-offset: -3px;
}

.player-card.red { background-color: #ff0000; }
.player-card.green { background-color: #00ff00; }
.player-card.gray { background-color: #cccccc; }
.player-card.pink { background-color: #ff00ff; }
.player-card.yellow { background-color: #ffff00; }

.player-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #222;
}

.player-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #222;
}

.replace-ai-section {
  padding: 5px 8px;
  background-color: #555;
  border: 1px solid black;
  border-top: none;
}

.replace-ai-btn {
  width: 100%;
  padding: 6px;
  background-color: #ffc107;
  border: 1px solid black;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  cursor: pointer;
}

.player-stat-item {
  display: flex;
  align-items: center;
  gap: 0.3em;
  margin-bottom: 2px;
  color: #222;
}

.player-stat-item .inline-coin-icon {
  width: 1.4em;
  height: 1.4em;
}

.options {
  margin-top: 20px;
}

.option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
  margin: 5px 0;
  padding: 10px 15px;
  font-size: 1em;
  font-weight: bold;
  border: 1px solid #222;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #5a5a5a;
  color: #ddd;
  width: 100%;
}

.option-btn:hover {
  background-color: #6a6a6a;
  border-color: #444;
}

.winner-declaration {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  text-align: center;
  font-size: 16px;
}
.winner-name { font-weight: bold; font-size: 18px; margin-top: 5px; }


.prompt-instruction {
  color: white;
  text-align: center;
  margin-bottom: 5px;
  padding: 10px;
  background-color: rgba(0,0,0,0.3);
  border-radius: 8px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.2em;
}

/* Center Panel */
.center-panel {
  grid-area: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 20px;
  position: relative;
  overflow: visible;
  min-height: 600px;
}

.top-card-display {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.top-card-label {
  font-weight: bold;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  text-shadow: 1px 1px 2px black;
}

.tree-row {
  display: flex;
  gap: 40px;
  z-index: 2;
  justify-content: center;
  height: auto; /* Change from fixed height */
  flex-grow: 1; /* Add this to make rows expand */
  flex-shrink: 0; /* Ensures they don't shrink below content size */
  align-items: center;
}

.zone {
  width: 200px;
  height: 115px;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  background-color: #444;
  position: relative;
}

.zone.real-zone {
  box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.8);
}

.zone.clickable {
  outline: 3px solid lightgreen;
  cursor: pointer;
}

.zone.sim-targetable {
  outline: 3px solid #da70d6; /* Orchid Purple */
  cursor: pointer;
}

.zone.move-targetable {
  outline: 3px solid #42a5f5; /* Blue outline for move targets */
  cursor: pointer;
}

.zone.set-hq-targetable {
  outline: 3px solid yellow; /* Yellow outline for HQ targets */
  cursor: pointer;
}

/* For zones that are both real and clickable */
.zone.real-zone.clickable {
  box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.8);
  outline: 3px solid limegreen;
  cursor: pointer;
}

.zone-header {
  background-color: #ffff00;
  border-bottom: 1px solid black;
  padding: 8px;
  font-weight: bold;
  text-align: center;
  font-size: 11px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  width: 100%;
}

.simulated-zone-header {
  height: 25px; /* Smaller height for the nested header */
  font-size: 10px;
}

.crown-symbol {
  width: 20px;
  height: 15px;
  flex-shrink: 0;
}

.connections {
  height: 25px;
  position: relative;
  z-index: 1;
  width: 100%;
  flex-shrink: 0;
}

.connection-svg {
  width: 100%;
  height: 100%;
}


.zone-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding: 2px;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.icon-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-symbol, .hq-symbol, .base-symbol, .hourglass-symbol {
  transition: width 0.2s, height 0.2s;
  width: 100%;
  height: 100%;
}

/* Size tier 1: 1-5 icons, full size */
.zone-icons-size-1 .icon-wrapper {
  height: 40px;
}
.zone-icons-size-1 .player-symbol, .zone-icons-size-1 .hq-symbol, .zone-icons-size-1 .base-symbol, .zone-icons-size-1 .hourglass-symbol {
  width: 24px;
  height: 40px;
}

/* Size tier 2: 6-8 icons, slightly smaller */
.zone-icons-size-2 .icon-wrapper {
  height: 34px;
}
.zone-icons-size-2 .player-symbol, .zone-icons-size-2 .hq-symbol, .zone-icons-size-2 .base-symbol, .zone-icons-size-2 .hourglass-symbol {
  width: 20px;
  height: 34px;
}

/* Size tier 3: 9-10 icons, smaller, wraps to 2 rows */
.zone-icons-size-3 .icon-container {
  align-content: center;
}
.zone-icons-size-3 .icon-wrapper {
  height: 30px;
}
.zone-icons-size-3 .player-symbol, .zone-icons-size-3 .hq-symbol, .zone-icons-size-3 .base-symbol, .zone-icons-size-3 .hourglass-symbol {
  width: 18px;
  height: 30px;
}

/* Size tier 4: 11-15 icons, smaller still, 2-3 rows */
.zone-icons-size-4 .icon-container {
  align-content: center;
}
.zone-icons-size-4 .icon-wrapper {
  height: 25px;
}
.zone-icons-size-4 .player-symbol, .zone-icons-size-4 .hq-symbol, .zone-icons-size-4 .base-symbol, .zone-icons-size-4 .hourglass-symbol {
  width: 15px;
  height: 25px;
}

/* Size tier 5: 16+ icons, very small, 3 rows */
.zone-icons-size-5 .icon-container {
  align-content: center;
}
.zone-icons-size-5 .icon-wrapper {
  height: 20px;
}
.zone-icons-size-5 .player-symbol, .zone-icons-size-5 .hq-symbol, .zone-icons-size-5 .base-symbol, .zone-icons-size-5 .hourglass-symbol {
  width: 12px;
  height: 20px;
}


/* Right Panel */
.right-panel {
  grid-area: right;
  display: flex;
  background-color: #3a3a3a;
  gap: 5px;
  padding: 5px;
  flex-direction: row;
  height: 100%;
  min-height: 600px;
}

.color-strips {
  display: flex;
  gap: 2px;
  height: 100%;
  min-height: 600px;
}

.color-strip {
  display: flex;
  flex-direction: column;
  width: 40px;
  height: 100%;
  min-height: 600px;
  justify-content: space-evenly;
}

.color-section {
  border: 1px solid black;
  margin: 1px 0;
  flex: 1;
  min-height: 140px;
}

.info-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  height: 100%;
  min-height: 600px;
}

.crown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.color-section.red { 
  background: linear-gradient(to bottom, #b91c1c 0%, #ffcccc 50%, #b91c1c 100%); 
}
.color-section.green { 
  background: linear-gradient(to bottom, #166534 0%, #ccffcc 50%, #166534 100%); 
}
.color-section.gray { 
  background: linear-gradient(to bottom, #707070 0%, #f0f0f0 50%, #707070 100%); 
}
.color-section.pink { 
  background: linear-gradient(to bottom, #821caf 0%, #ffccff 50%, #821caf 100%); 
}
.color-section.yellow { 
  background: linear-gradient(to bottom, #888800 0%, #ffffcc 50%, #888800 100%); 
}

.log-section {
  background-color: #424242;
  border: 1px solid #222;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  text-align: left;
}

.section-header {
  background-color: #2a2a2a;
  padding: 5px;
  border-bottom: 1px solid #222;
  font-weight: bold;
  color: #c5b358;
  width: 100%;
}

.game-actions-bar {
  display: flex;
  gap: 10px;
  padding: 5px;
  border-top: 1px solid black;
}

.action-bar-btn {
  flex: 1;
  padding: 10px 15px;
  font-size: 1em;
  font-weight: bold;
  border: 1px solid #222;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #5a5a5a;
  color: #ddd;
}

.action-bar-btn:hover {
  background-color: #6a6a6a;
  border-color: #444;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
  min-width: 0;
  word-wrap: break-word;
  color: white;
}

.log-message {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 2px 0;
  border-bottom: 1px solid #555;
}

.log-part {
  white-space:normal;
}

.log-message.log-turn-start {
  font-weight: bold;
}

.input-section {
  display: flex;
  padding: 5px;
  border-top: 1px solid black;
  min-width: 0;
}

.send-btn {
  margin-left: 5px;
  padding: 2px 8px;
  border: 1px solid black;
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  color: black;
}

/* Bottom Panel */
.bottom-panel {
  grid-area: bottom;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: #2a2a2a;
  border-top: 2px solid #111;
  gap: 10px; /* Reduced gap for more card space */
  height: 260px; /* Matches the grid row height */
}

.hand-scroll {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
  flex: 2;
  align-items: flex-start;
}

.hand-scroll li {
  list-style-type: none;
}

.perpetual-scroll {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
  flex: 1;
  align-items: flex-start;
}


.hand-card {
  border: 2px solid black;
  text-align: center;
  min-width: 100px;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.hand-card.card-m { background-color: #e6d8ad; } /* Soft Gold */
.hand-card.card-p { background-color: #c6d7ea; } /* Light Blue/Grey */
.hand-card.card-secret { background-color: #F08080; } /* Light Red for Secret cards */

.hand-card.scoreable {
  outline: 3px solid purple;
  cursor: pointer;
}

.hand-card.discardable {
  outline: 3px solid red;
  outline-offset: -2px;
  cursor: pointer;
}

.hand-card.discard-selected {
  outline: 3px solid red;
  outline-offset: -2px;
}

.hand-card.discard-n-selected {
  outline: 3px solid #ff4500; /* OrangeRed */
  outline-offset: -2px;
}

.hand-card.playable {
  outline: 3px solid yellow;
  outline-offset: -2px;
  cursor: pointer;
}

.hand-card.gizmo-playable {
  outline: 3px solid #00FFFF; /* Cyan */
  outline-offset: -2px;
  cursor: pointer;
}

.hand-card.y2k-discardable {
  outline: 3px solid #0D9488; /* Teal */
  outline-offset: -2px;
  cursor: pointer;
}

.hand-card.card-secret-clickable {
  outline: 3px solid #F08080; /* Light Red */
  box-shadow: 0 0 10px 3px #F08080;
  cursor: pointer;
}

.hand-card.clickable {
  cursor: pointer;
}

.hand-card.cybernetics-playable {
  outline: 3px solid cyan;
  outline-offset: -2px;
}

.color-section.advance-interactive {
  cursor: pointer;
  outline: 2px solid cyan;
  outline-offset: -2px;
}

.color-section.retreat-interactive {
  cursor: pointer;
  outline: 2px solid orange;
  outline-offset: -2px;
}

.hand-card.play-selected {
  outline: 3px solid yellow;
  outline-offset: -2px;
  cursor: pointer;
}

.card-header {
  padding: 6px;
  font-size: 11px;
  font-weight: bold;
  color: black;
  width: 100%;
  gap: 0.25em;
  text-align: center;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-coins .coin-icon {
  width: 2em;
  height: 2em;
}

.card-coins {
  font-size: 18px;
  font-weight: bold;
  color: black;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-score {
  background-color: #b999c0ff;
  border-top: 1px solid black;
  padding: 6px;
  font-size: 11px;
  font-weight: bold;
  color: black;
  width: 100%;
  text-align: center;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
}

.card-score .inline-coin-icon {
  width: 1.5em;
  height: 1.5em;
}

.perpetual-card {
  background-color: #c6d7ea;
  border: 1px solid black;
  padding: 10px 15px;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
  white-space: nowrap;
  color: black;
  height: fit-content;
}

.perpetual-card.sage-card {
  background-color: #d2b48c; /* Tan/Brown color for Sage */
  color: black;
}
.perpetual-card.poison-card {
  background-color: purple;
  color: white;
  cursor: pointer;
}

.zone-coin-icon {
  width: 30px;
  height: 30px;
}

.perpetual-card.cybernetics-perpetual-selectable {
  cursor: pointer;
  outline: 3px solid cyan;
}

.player-perpetuals-list {
  background-color: #444;
  color: white;
  padding: 10px;
  margin-top: -1px;
  border: 1px solid black;
  border-top: none;
  text-align: left;
}

.perpetuals-header {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
  border-bottom: 1px solid #777;
  padding-bottom: 4px;
}

.no-perpetuals {
  font-style: italic;
  color: #aaa;
  font-size: 12px;
}

.perpetual-scroll-small {
  max-height: 150px;
  overflow-y: auto;
  padding-right: 5px;
}

.perpetual-and-tokens-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.perpetual-scroll-small .perpetual-card {
  width: 100%;
  white-space: normal;
  text-align: left;
  padding: 5px 8px;
  cursor: pointer;
}

.perpetual-scroll-small::-webkit-scrollbar {
  width: 6px;
}
.perpetual-scroll-small::-webkit-scrollbar-track {
  background: #555;
}
.perpetual-scroll-small::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
.perpetual-scroll-small::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* Scrollbar styling for webkit browsers */
.hand-scroll::-webkit-scrollbar,
.perpetual-scroll::-webkit-scrollbar {
  height: 8px;
}

.hand-scroll::-webkit-scrollbar-track,
.perpetual-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.hand-scroll::-webkit-scrollbar-thumb,
.perpetual-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.hand-scroll::-webkit-scrollbar-thumb:hover,
.perpetual-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.inspector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.inspector-modal {
  background: #3a3a3a;
  border: 2px solid #c5b358;
  width: 300px;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  position: relative;
  color: #ddd;
}

.inspector-modal .close-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border: 2px solid black;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.inspector-header {
  border-bottom: 2px solid black;
  padding: 12px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: #222;
}

.inspector-body {
  flex-grow: 1;
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.inspector-body {
  padding-bottom: 5px; /* Reduce padding to give space to score area */
}

.inspector-coins {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.inspector-coins .coin-icon {
  width: 1.5em;
  height: 1.5em;
}

.inspector-description {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.inspector-box-text {
  background-color: #d3d3d3; /* Light grey */
  color: black;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
}

.inspector-secret-text {
  background-color: #F08080; /* Light Red */
  color: black;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
  font-style: italic;
}


.inspector-score {
  background-color: #b999c0ff;
  border-top: 2px solid black;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
  color: #222;
}

.inspector-score {
  flex-direction: column;
  padding: 8px;
  gap: 5px;
  justify-content: center;
}

.score-instruction-text {
  font-size: 13px;
  font-style: italic;
  color: #222;
}

.score-cost-line {
  display: flex;
  align-items: center;
  gap: 0.25em;
}
.dialog-buttons {
  display: flex;
  gap: 10px;
  padding: 15px;
  justify-content: center;
}

.rules-link {
  display: inline-block;
  padding: 10px 20px;
  font-size: 1em;
  font-weight: bold;
  border: 1px solid #222;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #5a5a5a;
  color: #ddd;
  text-decoration: none;
}

.all-cards-modal {
  background: #3a3a3a;
  border: 2px solid #c5b358;
  width: 90vw;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  color: #ddd;
}

.all-cards-tabs {
  display: flex;
  border-bottom: 2px solid #c5b358;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: #444;
  color: #ccc;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.tab-btn.active {
  background: #3a3a3a;
  color: #c5b358;
}

.modal-search-bar {
  width: calc(100% - 40px);
  margin: 10px 20px;
  padding: 10px;
  font-size: 16px;
  background-color: #222;
  border: 1px solid #555;
  color: #ddd;
  border-radius: 4px;
}
.modal-search-bar:focus {
  outline: none;
  border-color: #c5b358;
}

.all-cards-grid {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  align-content: flex-start;
}

.all-zones-grid {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-content: flex-start;
}

.zone-modal-card {
  height: auto;
  min-height: 100px;
}

.zone-modal-age {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #444; /* Match zone background */
  color: #ddd; /* Light text color */
  font-size: 1.1em;
  font-weight: bold;
}

.inspector-content-wrapper {
  display: flex;
  align-items: stretch; /* Changed from center to stretch */
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.inspector-content-wrapper.column-layout {
  flex-direction: column;
  align-items: center; /* Center items when in a column */
}

.associated-token-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background-color: #4f4f4f;
  border-radius: 8px;
}

.associated-token-icon {
  width: 50px;
  height: 50px;
}

.associated-token-name {
  font-weight: bold;
  color: #e0e0e0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.inspector-description {
  flex: 1;
  text-align: left;
}

.inspector-associated-card-container {
  flex-shrink: 0;
}

.rules-link:hover {
  background-color: #6a6a6a;
  border-color: #444;
}

/* Global styles to remove default margins/padding */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100dvw;
  overflow: hidden;
}
</style>