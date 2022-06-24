/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

/* eslint-disable no-console */
const isProductionEnv = () => process.env.NODE_ENV === 'production';

const makeError = (isProduction) => (isProduction ? () => {} : console.error);

const makeInfo = (isProduction) => (isProduction ? () => {} : console.log);

/**
 *
 * @param {String} label
 * @returns {Function} end and display time when called in non production environment
 */
const logTime = (label) => {
  if (isProductionEnv()) {
    return () => {
      // no-op}
    };
  }
  console.time(label);
  return () => console.timeEnd(label);
};

const logInfo = makeInfo(isProductionEnv());
const logError = makeError(isProductionEnv());
const LogLastError = ({ lastError } = chrome.runtime) => (lastError ? logError(lastError) : null);
const Logger = {
  logTime,
  logInfo,
  logError,
  LogLastError,
};

export default Logger;
