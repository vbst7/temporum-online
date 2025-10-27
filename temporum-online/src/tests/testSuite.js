// /home/valerie-brown/Documents/Temporum/temporum-online/src/tests/testSuite.js

import { allTests } from './testDefinitions.js';

// This file selects which tests to run from the master list in testDefinitions.js.
// To add or remove tests from a run, simply add or remove their `testId`
// from the `activeTestIds` array below.

const activeTestIds = [

];

// Filter the full list of tests to get only the active ones.
const activeTestSuite = allTests.filter(test => activeTestIds.includes(test.testId));

export default activeTestSuite;
