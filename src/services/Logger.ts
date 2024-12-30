/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

import { envService } from './envService';

/**
 * @description stateMachine of debug to cantDebug states
 */
const debugStates = new Map([
	['true', false],
	['false', true],
]);

const cantDebug = (shouldDebug: boolean = false) => !shouldDebug;

const nullCallback = () => null;

const maker = <T>(fn: T): T => (envService.PLASMO_PUBLIC_DEBUG ? nullCallback : fn) as T;

/**
 *
 * @param {String} label
 * @returns {Function} end and display time when called in non production environment
 */
const logTime = (label) => {
	if (cantDebug(envService.PLASMO_PUBLIC_DEBUG)) return () => nullCallback;

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
