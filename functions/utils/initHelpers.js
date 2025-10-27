const gameLogicHelpers = require("./gameLogicHelpers");
const promptingHelpers = require("./promptingHelpers");
const turnManagementHelpers = require("./turnManagementHelpers");
const followUpHelpers = require("./followUpHelpers");

/**
 * Initializes circular dependencies between helper modules.
 * This function should be called once at application startup
 * (e.g., in index.js).
 */
function initializeHelpers() {
  gameLogicHelpers.setPromptScore(promptingHelpers.promptScore);
  gameLogicHelpers.setPromptPlay(promptingHelpers.promptPlay); // eslint-disable-line max-len
  gameLogicHelpers.setPromptDiscard(promptingHelpers.promptDiscard);
  gameLogicHelpers.setPromptVisit(promptingHelpers.promptVisit);
  gameLogicHelpers.setExecuteCardFollowUp(followUpHelpers.executeCardFollowUp);
  gameLogicHelpers.setExecuteZoneFollowUp(
      followUpHelpers.executeZoneFollowUp);
  gameLogicHelpers.setCheckAnubisAndEndTurn( // eslint-disable-line max-len
      turnManagementHelpers.checkAnubisAndEndTurn);
  gameLogicHelpers.setDeclareWinner(turnManagementHelpers.declareWinner);
  gameLogicHelpers.setStartTurn(turnManagementHelpers.startTurn);
  gameLogicHelpers.setEndTurn(turnManagementHelpers.endTurn);
  gameLogicHelpers.setVisitSpecificZone(promptingHelpers.visitSpecificZone);

  promptingHelpers.setExecuteZoneFollowUp(followUpHelpers.executeZoneFollowUp);
  promptingHelpers.setExecuteCardFollowUp(followUpHelpers.executeCardFollowUp); // eslint-disable-line max-len
  promptingHelpers.setExecuteChangeHistoryHelper(
      gameLogicHelpers.executeChangeHistoryHelper);
  promptingHelpers.setCheckAnubisAndEndTurn(
      turnManagementHelpers.checkAnubisAndEndTurn);
  promptingHelpers.setRemoveHourglass(
      gameLogicHelpers.removeHourglass);
  promptingHelpers.setPromptPlay(promptingHelpers.promptPlay);
  promptingHelpers.setPromptDiscard(promptingHelpers.promptDiscard);
  promptingHelpers.setVisitSpecificZone(promptingHelpers.visitSpecificZone);
  promptingHelpers.setPromptScore(promptingHelpers.promptScore);
  promptingHelpers.setPromptVisit(promptingHelpers.promptVisit);

  // turnManagementHelpers needs promptingHelpers, gameLogicHelpers,
  // followUpHelpers, and self-references
  turnManagementHelpers.setPromptVisit(promptingHelpers.promptVisit);
  turnManagementHelpers.setExecuteChangeHistoryHelper(
      gameLogicHelpers.executeChangeHistoryHelper,
  );
  turnManagementHelpers.setExecuteZoneFollowUp(
      followUpHelpers.executeZoneFollowUp,
  );
  turnManagementHelpers.setExecuteCardFollowUp(
      followUpHelpers.executeCardFollowUp,
  );
  turnManagementHelpers.setPromptPlay(promptingHelpers.promptPlay);
  turnManagementHelpers.setPromptScore(promptingHelpers.promptScore);
  turnManagementHelpers.setDeclareWinner(turnManagementHelpers.declareWinner);
  turnManagementHelpers.setCheckAnubisAndEndTurn(
      turnManagementHelpers.checkAnubisAndEndTurn,
  );
  turnManagementHelpers.setStartTurn(turnManagementHelpers.startTurn);
  turnManagementHelpers.setEndTurn(turnManagementHelpers.endTurn);

  followUpHelpers.setCheckAnubisAndEndTurn(
      turnManagementHelpers.checkAnubisAndEndTurn,
  );
  followUpHelpers.setPromptDiscard(promptingHelpers.promptDiscard);
  followUpHelpers.setPromptScore(promptingHelpers.promptScore);
  followUpHelpers.setPromptPlay(promptingHelpers.promptPlay);
  followUpHelpers.setPromptVisit(promptingHelpers.promptVisit);
  followUpHelpers.setVisitSpecificZone(promptingHelpers.visitSpecificZone); // eslint-disable-line max-len
  followUpHelpers.setExecuteCardFollowUp(
      followUpHelpers.executeCardFollowUp,
  );
  followUpHelpers.setExecuteZoneFollowUp(followUpHelpers.executeZoneFollowUp);
}

exports.initializeHelpers = initializeHelpers;
