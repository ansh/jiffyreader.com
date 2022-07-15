/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

/**
 * @description stateMachine of debug to cantDebug states
 */
const debugStates = new Map([
  ['true', false],
  ['false', true],
]);

/* eslint-disable no-console */
const cantDebug = (debugState: string) => {
  const result = debugStates.get(debugState);

  !result && console.log(debugState, typeof debugState, {
    cantDebug: result,
    debugStates: [...debugStates],
  });
  return result;
};

const nullCallback = () => {
  /** no-op */
};

/**
 * @template T
 * @return {T}
 */
const maker = (/** @type {T} */ fn) => (cantDebug(process.env.DEBUG) ? nullCallback : fn);

/**
 *
 * @param {String} label
 * @returns {Function} end and display time when called in non production environment
 */
const logTime = (label) => {
  if (cantDebug(process.env.DEBUG)) return () => nullCallback;

  console.time(label);
  return () => console.timeEnd(label);
};

const logInfo = maker(console.log);
const logError = maker(console.trace);
const LogLastError = ({ lastError = null } = chrome.runtime) => lastError && logError(lastError);

export default {
  logTime,
  logInfo,
  logError,
  LogLastError: maker(LogLastError),
  LogTable: maker(console.table),
};
