import Logger from '~services/Logger';

const isBackgroundScript = () => {
	if (typeof chrome?.extension?.getBackgroundPage === 'function') {
		// https://stackoverflow.com/questions/16267668/can-js-code-in-chrome-extension-detect-that-its-executed-as-content-script
		// detect where code is running from, is it content script, popup or background?
		// thats important to know if all 3 context call the same functions, that shared function has
		// to know the context so it can work properly based on the context

		// we know we are on background script if getBackgroundPage === window
		return chrome.extension.getBackgroundPage() === window;
	}
	return false;
};

const getActiveTab = (isBgScript): Promise<chrome.tabs.Tab> =>
	new Promise((res, rej) => {
		try {
			if (isBgScript) {
				chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
					Logger.logInfo(activeTab);
					res(activeTab);
				});
			} else {
				chrome.runtime.sendMessage({ message: 'getActiveTab' }, ({ /** @type {chrome.tabs.Tab} */ data }) => {
					res(data);
				});
			}
		} catch (error) {
			rej(error);
			Logger.logError(error);
		}
	});

/**
 * @params {chrome.tabs.Tab} [tab = getActiveTab()]
 * the origin of the tab provided or the origin of the active tab if tab is null
 */
const getTabOrigin = async (/** @type {chrome.tabs.Tab} */ tab): Promise<string> =>
	new Promise((res, rej) => {
		try {
			chrome.tabs.sendMessage(tab.id, { type: 'getOrigin' }, (/** @type {{data: string}} */ { data }) => {
				const originError = chrome.runtime?.lastError;
				if (originError) throw originError;

				res(data);
			});
		} catch (err) {
			Logger.LogLastError(err);
			rej(err);
		}
	});

export default { getActiveTab, getTabOrigin, isBackgroundScript };
