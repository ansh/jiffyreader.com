import { Storage } from '@plasmohq/storage';

import Logger from '~services/Logger';
import TabHelper from '~services/TabHelper';
import defaultPrefs from '~services/preferences';
import { STORAGE_AREA, USER_PREF_STORE_KEY, APP_PREFS_STORE_KEY, DisplayColorMode } from '~services/config';

export {};

const BACKGROUND_LOG_STYLE = 'background: brown; color:white';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;


const storage = new Storage({ area: STORAGE_AREA });

const getAssetUrl = (rawUrl: string, runner = runTimeHandler) => {
  return runner.runtime.getURL(rawUrl) as string;
};

const setBadgeText = (badgeTextDetails: chrome.action.BadgeTextDetails, runner = chrome) => {
  return (
    chrome?.action?.setBadgeText(badgeTextDetails) ||
    browser.browserAction.setBadgeText(badgeTextDetails)
  );
};

const fireUpdateNotification = async () => {
  if (await storage.get(USER_PREF_STORE_KEY)) {
    return;
  }

  chrome.tabs.create({
    active: true,
    url: 'https://github.com/ansh/jiffyreader.com#first-installation-welcome',
  });
};

const initializeUserPrefStorage = async () => {
  try {
    const prefStore = await storage.get(USER_PREF_STORE_KEY);
    Logger.logInfo('background: prefStore install value', prefStore);

    if (!prefStore) {
      await storage.set(USER_PREF_STORE_KEY, { global: defaultPrefs, local: {} });
      Logger.logInfo(
        'background: prefStore initialization processed',
        await storage.get(USER_PREF_STORE_KEY),
      );
    } else {
      Logger.logInfo('background: prefStore initialization skipped', prefStore);
    }
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

  Logger.logInfo('%cbackground.initializeAppPref', BACKGROUND_LOG_STYLE)

  return await storage.set(APP_PREFS_STORE_KEY, { displayColorMode: DisplayColorMode.LIGHT });
};

const messageListener = (request, sender, sendResponse) => {
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

function onInstallHandler(event: chrome.runtime.InstalledDetails) {
  const date = new Date(Date.now());
  Logger.logInfo('install success', event.reason, { install_timestamp: date.toISOString() });
  initializeUserPrefStorage();

  chrome.storage.local.set({ install_timestamp: date.toISOString() }, () => {
    Logger.logInfo('background set time');
    Logger.logError();
  });

  if (event.reason === 'install' || process.env.NODE_ENV === 'production') {
    fireUpdateNotification();
  }

  initializeAppPref()
}

// register and call functions below

chrome.runtime.onInstalled.addListener(onInstallHandler);

chrome?.commands?.onCommand?.addListener(commandListener);

runTimeHandler.runtime.onMessage.addListener(messageListener);
