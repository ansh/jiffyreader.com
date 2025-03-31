import { Storage } from '@plasmohq/storage';
import type { PrefStore } from 'index';
import M from 'mellowtel';

import { CONFIG_KEY, DISABLE_LOGS } from '~constants';
import { APP_PREFS_STORE_KEY, DisplayColorMode, STORAGE_AREA, USER_PREF_STORE_KEY } from '~services/config';
import { envService } from '~services/envService';
import Logger from '~services/Logger';
import defaultPrefs from '~services/preferences';
import runTimeHandler from '~services/runTimeHandler';
import TabHelper from '~services/TabHelper';
import TrackEventService, { EventCategory } from '~services/TrackEventService';

export {};

let m: M;

(async () => {
	m = new M(CONFIG_KEY, {
		disableLogs: DISABLE_LOGS,
	});
	await m.initBackground();
})();

const BACKGROUND_LOG_STYLE = 'background: brown; color:white';

const storage = new Storage({ area: STORAGE_AREA });

const getAssetUrl = (rawUrl: string, runner = runTimeHandler) => {
	return runner.runtime.getURL(rawUrl) as string;
};

const setBadgeText = (badgeTextDetails: chrome.action.BadgeTextDetails, runner = chrome) => {
	return chrome?.action?.setBadgeText(badgeTextDetails) || browser.browserAction.setBadgeText(badgeTextDetails);
};

const openInstallationWelcomePage = async (eventReason: chrome.runtime.OnInstalledReason, browserTargetName: string = envService.PLASMO_PUBLIC_TARGET) => {
	// if (await storage.get(USER_PREF_STORE_KEY)) {
	// 	return;
	// }

	chrome.tabs.create({
		active: true,
		url: `https://jiffyreader.com/welcome?browser=${browserTargetName}&event=${eventReason}&version=${envService.PLASMO_PUBLIC_VERSION}`,
	});
};

const initializeUserPrefStorage = async () => {
	try {
		const prefStore: PrefStore = (await storage.get(USER_PREF_STORE_KEY)) ?? ({ global: {}, local: {} } as PrefStore);
		Logger.logInfo('background: prefStore install value', prefStore);

		const newPrefs = {
			global: { ...defaultPrefs, ...prefStore?.global },
			local: { ...prefStore?.local },
		};

		Logger.logInfo('initializeUserPrefStorage', { newPrefs });

		await storage.set(USER_PREF_STORE_KEY, newPrefs);
	} catch (error) {
		Logger.logError(error);
	} finally {
		Logger.logInfo('prefInitial value', await storage.get(USER_PREF_STORE_KEY));
	}
};

const initializeAppPref = async () => {
	const appPrefStore = await storage.get(APP_PREFS_STORE_KEY);

	if (appPrefStore) {
		return;
	}

	Logger.logInfo('%cbackground.initializeAppPref', BACKGROUND_LOG_STYLE);

	return await storage.set(APP_PREFS_STORE_KEY, { displayColorMode: DisplayColorMode.LIGHT });
};

const messageListener = (request, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
	Logger.logInfo('background listener called', { request });
	switch (request.message) {
		case 'setIconBadgeText': {
			(async () => {
				const tabID = request?.tabID ?? (await TabHelper.getActiveTab(true)).id;
				Logger.logInfo('setIconBadgeText', { tabID });
				setBadgeText({
					text: request.data ? 'On' : 'Off',
					tabId: tabID,
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
		case 'getShortcut': {
			runTimeHandler.commands
				.getAll()
				.then((commands) => {
					const [commandEntry = undefined] = commands.filter(({ name }) => /toggle-bionic/.test(name));
					const shortcutResponse = commandEntry?.shortcut;
					Logger.logInfo('shorcutResponse', { response: shortcutResponse });
					sendResponse((shortcutResponse ?? '').length ? shortcutResponse : undefined);
				})
				.catch(Logger.logError);
			return true;
			break;
		}
	}
	return true;
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

async function onInstallHandler(event: chrome.runtime.InstalledDetails) {
	const date = new Date(Date.now());
	Logger.logInfo('install success', event.reason, { install_timestamp: date.toISOString() });
	initializeUserPrefStorage();

	chrome.storage.local.set({ install_timestamp: date.toISOString() }, () => {
		Logger.logInfo('background set time');
		Logger.logError();
	});

	const eventReason = event.reason;

	const newVersion = envService.PLASMO_PUBLIC_VERSION;
	const { previousVersion } = event;
	const isNewVersion = previousVersion !== newVersion;
	Logger.logInfo({ newVersion, previousVersion, isNewVersion });

	TrackEventService.trackEvent({
		eventCategory: EventCategory.APP_EVENT,
		eventName: 'install',
		eventType: eventReason,
		newVersion,
		previousVersion,
	});

	if (isNewVersion && /install/i.test(eventReason) && envService.NODE_ENV === 'production') {
		openInstallationWelcomePage(eventReason);
	} else if (isNewVersion && /update/i.test(eventReason) && (await m.getBrowser()) === 'firefox') {
		await m.generateAndOpenUpdateLink();
	}

	// Set up uninstall feedback URL
	if (envService.NODE_ENV === 'production') {
		const uninstallURL = await m.generateFeedbackLink();
		chrome.runtime.setUninstallURL(uninstallURL);
	}

	initializeAppPref();
}

// register and call functions below

chrome.runtime.onInstalled.addListener(onInstallHandler);

runTimeHandler.commands.onCommand?.addListener(commandListener);

(runTimeHandler as typeof chrome).runtime.onMessage.addListener(messageListener);
