/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

/* eslint-disable no-console */
const isProductionEnv = () => process.env.NODE_ENV === 'production';

const nullCallback = () => {
  /** no-op */
};

/**
 * @template T
 * @return {T}
 */
const maker = (/** @type {T} */ fn) => (isProductionEnv() && nullCallback) || fn;

/**
 *
 * @param {String} label
 * @returns {Function} end and display time when called in non production environment
 */
const logTime = maker((label) => {
  console.time(label);
  return () => console.timeEnd(label);
});

const logInfo = maker(console.log);
const logError = maker(console.trace);
const LogLastError = ({ lastError } = chrome.runtime) => (lastError ? logError(lastError) : null);

export default {
  logTime,
  logInfo,
  logError,
  LogLastError: maker(LogLastError),
  LogTable: maker(console.table),
};
