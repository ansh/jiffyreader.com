/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

/* eslint-disable no-console */

const isProductionEnv = () => process.env.NODE_ENV === 'production';

export const logError = (error) => {
  if (isProductionEnv) return;
  console.error(error);
};

/**
 *
 * @param  {...any} data
 * @returns {void}
 */
export const logInfo = (...data) => {
  if (isProductionEnv) return;

  console.log(...data);
};

/**
 *
 * @param {String} label
 * @returns {Function} end and display time when called in non production environment
 */
export const logTime = (label) => {
  if (isProductionEnv()) {
    return () => {
      // no-op}
    };
  }
  console.time(label);
  return () => console.timeEnd(label);
};
