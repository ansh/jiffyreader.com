/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

/* eslint-disable no-console */
export default class Logger {
  static #isProductionEnv = () => process.env.NODE_ENV === 'production';

  static logError = (error) => {
    if (this.#isProductionEnv()) return;
    console.error(error);
  };

  /**
 *
 * @param  {...any} data
 * @returns {void}
 */
  static logInfo = (...data) => {
    if (this.#isProductionEnv()) return;

    console.log(...data);
  };

  /**
 *
 * @param {String} label
 * @returns {Function} end and display time when called in non production environment
 */
  static logTime = (label) => {
    if (this.#isProductionEnv()) {
      return () => {
      // no-op}
      };
    }
    console.time(label);
    return () => console.timeEnd(label);
  };
}
