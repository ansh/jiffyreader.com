/**
 *
 * provide development utility functions for reporting errors, logging data and logging time
 */

import { envService } from './envService';

const nullCallback = function () {};

const maker = <T>(fn: T, debug = envService.showDebugInfo): T => (debug ? nullCallback : fn) as T;

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

const loggerProxy = new Proxy(() => {}, {
	get(target, propKey) {
		console.log('loggerProxy.get.fired', { propKey });
		if (envService.PLASMO_PUBLIC_DEBUG) {
			return () => nullCallback;
		}
		return loggerProxy;
	},
	apply(targer, _this, args) {
		console.log('logerProxy.apply.fired');
		if (cantDebug()) {
			return () => loggerProxy(...args);
		}
		return logger[target].call(...args);
	},
});

export default logger;
