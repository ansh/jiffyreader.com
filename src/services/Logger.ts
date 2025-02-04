/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

import { envService } from './envService';

const nullCallback = () => nullCallback;

const maker = <T>(fn: T, debug = envService.showDebugInfo): T => (debug ? fn : nullCallback) as T;

/**
 *
 * @param {string} label
 * @returns {Function} end and display time when called in non production environment
 */
const logTime = maker((label: string) => {
	console.time(label);
	return () => console.timeEnd(label);
});

const logInfo = maker(console.log);
const logError = maker(console.trace);
const LogLastError = ({ lastError = null } = chrome.runtime) => lastError && logError(lastError);

const logger = {
	logTime,
	logInfo,
	logError,
	LogLastError: maker(LogLastError),
	LogTable: maker(console.table),
};

export default logger;
