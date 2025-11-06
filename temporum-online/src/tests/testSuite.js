// /home/valerie-brown/Documents/Temporum/temporum-online/src/tests/testSuite.js

import { allTests } from './testDefinitions.js';

// This file selects which tests to run from the master list in testDefinitions.js.
// To add or remove tests from a run, simply add or remove their `testId`
// from the `activeTestIds` array below.

const activeTestIds = [
  "EndlessCity_1",
  "EndlessCity_2",
  "MafiaCityStates_1",
  "MafiaCityStates_2",
  "Sage_1",
  "UndergroundHaven_1",
  "UndergroundHaven_2",
  "UndergroundHaven_3",


  "AnubisStatuette_2",
  "AnubisStatuette_3",
  "Artist_2",
  "BagOfLoot_1",
  "BarbarianHorde_1",
  "BarbarianHorde_2",
  "BarbarianHorde_3",
  "BlackMarket_1",
  "Conspiracy_1",
  "CrownJewels_1",
  "CrownJewels_2",
  "CrownJewels_3",
  "Engineer_1",
  "Engineer_2",
  "Explorer_1",
  "FriendsInOldPlaces_1",
  "GangOfPickpockets_1",
  "GladiatorsGladius_1",
  "GoldenGoose_1",
  "InfectedRat_1",
  "InfectedRat_2",
  "InfectedRat_3",
  "Inventor_1",
  "Inventor_2",
  "Inventor_3",
  "Investments_1",
  "KillYourGrandfather_2",
  "KillYourGrandfather_3",
  "KingsSword_1",
  "MayanRitualKnife_1",
  "PapalTiara_1",
  "PapalTiara_2",
  "PapalTiara_3",
  "PredictTheFuture_1",
  "PrimeRealEstate_1",
  "SecretSociety_1",
  "Settlers_1",
  "ShogunsKatana_1",
  "StepOnAButterfly_1",
  "ThinkTank_1",
  "Trinket_1",
  "Trinket_2",
  "TulipStocks_1",
  "TulipStocks_2",
  "GoldenApple_1",
  "MeetYoungerSelf_1",
  "MeetYoungerSelf_2",
  "Visionary_1",
  "Visionary_2",
  "Visionary_BM",
  "Visionary_GoP",
  "Pilgrims_1",
  "Pilgrims_2",
  "Pilgrims_3",

  "Perpetual_BlackMarket_1",
  "Perpetual_Conspiracy_1",
  "Perpetual_Explorer_1",
  "Perpetual_FioP_1",
  "Perpetual_FioP_Cats",
  "Perpetual_GoP_1",
  "Perpetual_Investments_1",
  "Perpetual_Investments_2",
  "Perpetual_PRE_1",
  "Perpetual_SecretSociety_1",
  "Perpetual_SecretSociety_2",
  "Perpetual_SecretSociety_Cats",
  "Perpetual_SecretSociety_Scrapyard",
  "Perpetual_SecretSociety_FloatingCities",
  "Perpetual_SecretSociety_AlienContact",
  "Perpetual_SecretSociety_SpaceAge",
  "Perpetual_SecretSociety_ImperialChina",

  "Gizmo_1",
  "Gizmo_2",
  "Gizmo_3",

];

// Filter the full list of tests to get only the active ones.
const activeTestSuite = allTests.filter(test => activeTestIds.includes(test.testId));

export default activeTestSuite;
