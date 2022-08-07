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
const cantDebug = (debugState: string = 'false') => {
  const key = debugState.toLowerCase();
  return debugStates.has(key) && debugStates.get(key);
};

const nullCallback = () => null;

const maker = <T>(fn: T): T => (cantDebug(process.env.DEBUG) ? nullCallback : fn) as T;

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
