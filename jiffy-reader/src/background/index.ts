import Logger from '../features/Logger';
import StorageHelper from '../../../src/StorageHelper';
import TabHelper from '../../../src/TabHelper';

export {};

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const listener = (request, sender, sendResponse) => {
	Logger.logInfo('background listener called', { request });
	switch (request.message) {
		case 'storePrefs': {
			sendResponse(StorageHelper.storePrefs(request.action, request.data));
			break;
		}
		case 'retrievePrefs': {
			StorageHelper.retrievePrefs(request.action).then((res) => sendResponse(res));
			return true;
			break;
		}
		case 'setIconBadgeText': {
			(async () => {
				const tabID = request?.tabID ?? (await TabHelper.getActiveTab(true)).id;
				Logger.logInfo('setIconBadgeText', { tabID });
				chrome.action.setBadgeText({
					text: request.data ? 'On' : 'Off',
					tabId: tabID
				});
			})();
			sendResponse({ data: true });
			break;
		}

		case 'getActiveTab': {
			try {
				chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
					Logger.LogTable({ activeTab });
					sendResponse({ data: activeTab });
				});
				return true;
			} catch (err) {
				Logger.logError(err);
			}

			return true;
			break;
		}
		default:
			sendResponse(false);
			break;
	}
};

const commandListener = async (command) => {
	Logger.logInfo('commmand fired', command);

	if (command === 'toggle-bionic') {
		// const activeTab = await TabHelper.getActiveTab(true);
		chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
			Logger.logInfo(activeTab);

			chrome.tabs.sendMessage(activeTab.id, { type: 'setReadingMode' }, () => Logger.logError());
		});
	}
};

chrome.runtime.onInstalled.addListener((event) => {
	const date = new Date(Date.now());
	Logger.logInfo('install success', event.reason, { install_timestamp: date.toISOString() });

	chrome.storage.local.set({ install_timestamp: date.toISOString() }, () => {
		Logger.logInfo('background set time');
		Logger.logError();
	});

	if (event.reason === 'install' || process.env.NODE_ENV === 'production') {
		chrome.tabs.create({
			active: true,
			url: 'https://github.com/ansh/jiffyreader.com#FAQ'
		});
	}
});

chrome?.commands?.onCommand?.addListener(commandListener);

runTimeHandler.runtime.onMessage.addListener(listener);

// start()
