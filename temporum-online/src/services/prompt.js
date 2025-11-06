import { dispatchAction } from "./lobbyService";

export async function changeHistory(lobbyId, playerId, zoneIndex) {
  await dispatchAction(lobbyId, "CHANGE_HISTORY", { zoneIndex }, playerId);
}

export async function declineChangeHistory(lobbyId, playerId) {
  await dispatchAction(lobbyId, "DECLINE_CHANGE_HISTORY", {}, playerId);
}

export async function resolveBabylonianChoice(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "RESOLVE_BABYLONIAN_CHOICE", choice, playerId);
}

export async function resolveToysChoice(lobbyId, playerId, chosenCardIndex) {
  await dispatchAction(
    lobbyId,
    "RESOLVE_TOYS_CHOICE",
    { chosenCardIndex },
    playerId
  );
}

export async function resolveGizmoChoice(lobbyId, playerId, cardIndex) {
  await dispatchAction(lobbyId, "RESOLVE_GIZMO_CHOICE", { cardIndex }, playerId);
}

export async function returnCard(lobbyId, playerId, cardIndex) {
  await dispatchAction(lobbyId, "RETURN_CARD", { cardIndex }, playerId);
}

export async function scoreCard(lobbyId, playerId, cardIndex) {
  await dispatchAction(lobbyId, "SCORE_CARD", { cardIndex }, playerId);
}

export async function playCard(lobbyId, playerId, cardIndex) {
  await dispatchAction(lobbyId, "PLAY_CARD", { cardIndex }, playerId);
}

export async function advanceCrown(lobbyId, playerId, ageIndex) {
  await dispatchAction(lobbyId, "ADVANCE_CROWN", { ageIndex }, playerId);
}

export async function discardAndContinue(lobbyId, playerId, cardIndex) {
  await dispatchAction(
    lobbyId,
    "DISCARD_AND_CONTINUE",
    { cardIndex },
    playerId
  );
}

export async function discardMany(lobbyId, playerId, discardArray) {
  await dispatchAction(lobbyId, "DISCARD_MANY", { discardArray }, playerId);
}

export async function resolveDiscardForMoney(lobbyId, playerId, cardIndex, sourceZoneId) {
  await dispatchAction(
    lobbyId,
    "RESOLVE_DISCARD_FOR_MONEY",
    { cardIndex, sourceZoneId },
    playerId
  );
}

export async function resolveInquisition(lobbyId, playerId, cardIndex) {
  await dispatchAction(
    lobbyId,
    "RESOLVE_INQUISITION",
    { cardIndex },
    playerId
  );
}

export async function resolveY2KDiscard(lobbyId, playerId, cardIndex) {
  await dispatchAction(
    lobbyId,
    "RESOLVE_Y2K_DISCARD",
    { cardIndex },
    playerId
  );
}

export async function resolveInventor(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "RESOLVE_INVENTOR", { choice }, playerId);
}

export async function resolvePredictTheFuture(lobbyId, playerId, choice) {
  await dispatchAction(
    lobbyId,
    "RESOLVE_PREDICT_THE_FUTURE",
    { choice },
    playerId
  );
}

export async function selectCardToPass(lobbyId, playerId, cardIndex) {
  await dispatchAction(lobbyId, "SELECT_CARD_TO_PASS", { cardIndex }, playerId);
}

export async function retreatCrown(lobbyId, playerId, ageIndex) {
  await dispatchAction(lobbyId, "RETREAT_CROWN", { ageIndex }, playerId);
}

export async function selectCyberneticsPerpetual(
  lobbyId,
  playerId,
  perpetualCardId
) {
  await dispatchAction(
    lobbyId,
    "SELECT_CYBERNETICS_PERPETUAL",
    { perpetualCardId },
    playerId
  );
}

export async function selectCyberneticsHandCard(
  lobbyId,
  playerId,
  handCardIndex
) {
  await dispatchAction(
    lobbyId,
    "SELECT_CYBERNETICS_HAND_CARD",
    { handCardIndex },
    playerId
  );
}

export async function resolveInvestments(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "RESOLVE_INVESTMENTS", { choice }, playerId);
}

export async function resolveTreasureMap(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "RESOLVE_TREASURE_MAP", { choice }, playerId);
}

export async function resolveSunboat(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "RESOLVE_SUNBOAT", { choice }, playerId);
}

export async function resolveTradeGoods(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "RESOLVE_TRADE_GOODS", { choice }, playerId);
}

export async function executeChoice(lobbyId, playerId, choice) {
  await dispatchAction(lobbyId, "CHOOSE_ACTION", { choice }, playerId);
}

export async function resolveOptionalZone(lobbyId, playerId, choice, zoneId) {
  await dispatchAction(
    lobbyId,
    "RESOLVE_OPTIONAL_ZONE",
    { choice, zoneId },
    playerId
  );
}

export async function resolveSimulatedParadiseChoice(lobbyId, playerId, zoneIndex) {
  await dispatchAction(lobbyId, "RESOLVE_SIMULATED_PARADISE_CHOICE", { zoneIndex }, playerId);
}

export async function resolveMove(lobbyId, playerId, zoneIndex) {
  await dispatchAction(lobbyId, "RESOLVE_MOVE", { zoneIndex }, playerId);
}

export async function resolveSetHQ(lobbyId, playerId, zoneIndex) {
  await dispatchAction(lobbyId, "RESOLVE_SET_HQ", { zoneIndex }, playerId);
}

export async function visitZone(lobbyId, playerId, zoneIndex) {
  await dispatchAction(lobbyId, "VISIT_ZONE", { zoneIndex }, playerId);
}

export async function choosePostVisit(lobbyId, playerId, choiceId) {
  await dispatchAction(lobbyId, "CHOOSE_POST_VISIT", { choiceId }, playerId);
}

export async function chooseEndOfTurn(lobbyId, playerId, choiceId) {
  await dispatchAction(lobbyId, "CHOOSE_END_OF_TURN", { choiceId }, playerId);
}

export async function chooseStartOfTurn(lobbyId, playerId, prompt) {
  await dispatchAction(lobbyId, "CHOOSE_START_OF_TURN", prompt, playerId);
}