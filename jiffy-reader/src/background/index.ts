import Logger from '../../../src/Logger';
import Preferences from '../../../src/Preferences';
import StorageHelper from '../../../src/StorageHelper';
import TabHelper from '../../../src/TabHelper';

export {};

Logger.logInfo('plasmo background');
const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const { getPrefs, defaultPrefs, start } = Preferences.init({
	getOrigin: async () => TabHelper.getTabOrigin()
});

const listener = (request, sender, sendResponse) => {
	Logger.logInfo('background listener called');
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
			TabHelper.getActiveTab().then((tab) => {
				chrome.browserAction.setBadgeText({
					text: request.data ? 'On' : 'Off',
					tabId: tab.id
				});
				sendResponse();
			});
			break;
		}

		case 'getActiveTab': {
            try {
                    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
                      Logger.logInfo(activeTab);
                      sendResponse({data:activeTab});
                    });
                  } catch (err) {
                    Logger.logError(err)
                  }
                
            return true
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
		const activeTab = await TabHelper.getActiveTab();

		const [{ data: tabBrMode }, getReadingModeError] = await new Promise((res, _) => {
			chrome.tabs.sendMessage(activeTab.id, { type: 'getReadingMode' }, (response) => {
				Logger.logInfo({ activeTab, response });
				res([response, chrome.runtime?.lastError]);
			});
		});

		if (getReadingModeError) throw Logger.logError(getReadingModeError);

		// set prefs to global if local is not present or local[scope] == 'global'
		const prefs = await getPrefs();

		const intentedTabBrMode = !tabBrMode;
		chrome.tabs.sendMessage(activeTab.id, { type: 'setReadingMode', data: intentedTabBrMode }, () => Logger.LogLastError());

		if (intentedTabBrMode) {
			Logger.logInfo(prefs);

			chrome.tabs.sendMessage(
				activeTab.id,
				{
					type: 'setSaccadesIntervalInDOM',
					data: prefs.saccadesInterval
				},
				() => Logger.LogLastError()
			);
			chrome.tabs.sendMessage(activeTab.id, {
				type: 'setLineHeight',
				data: prefs.lineHeight
			});
			chrome.tabs.sendMessage(
				activeTab.id,
				{
					type: 'setFixationStrength',
					data: prefs.fixationStrength
				},
				() => Logger.LogLastError()
			);
			chrome.tabs.sendMessage(
				activeTab.id,
				{
					type: 'setFixationEdgeOpacity',
					data: prefs.fixationEdgeOpacity
				},
				() => Logger.LogLastError()
			);
			chrome.tabs.sendMessage(
				activeTab.id,
				{
					type: 'setSaccadesStyle',
					data: prefs.saccadesStyle
				},
				() => Logger.LogLastError()
			);
		}
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
