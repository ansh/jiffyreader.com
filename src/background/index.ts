import { Storage } from '@plasmohq/storage';

import { defaultPrefs } from '../services/preferences';
import Logger from '../services/Logger';
import TabHelper from '../services/TabHelper';

export { };

const PREF_STORE_KEY = 'prefStore';

const BACKGROUND_LOG_STYLE = 'background: brown; color:white';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const UPDATE_NOTIFICATION_ID = 'jiffy-reader-updated';

const NOTIFICATION_URLS = [
  'https://github.com/ansh/jiffyreader.com#FAQ',
  'https://jiffyreader.com',
];

const getAssetUrl = (rawUrl: string, runner = runTimeHandler) => {
  return runner.runtime.getURL(rawUrl) as string;
};

const setBadgeText = (badgeTextDetails: chrome.action.BadgeTextDetails, runner = chrome) => {
  return (
    chrome?.action?.setBadgeText(badgeTextDetails) ||
    browser.browserAction.setBadgeText(badgeTextDetails)
  );
};

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  Logger.logInfo('notifications.onButtonClicked', notificationId);

  if (notificationId !== 'jiffy-reader-updated') {
    return;
  }

  chrome.tabs.create({ active: true, url: NOTIFICATION_URLS[buttonIndex] });
});

const getUpdateNotificationConfig = (runner: string /**chrome or firefix */) => {
  let config = {
    title: 'Jiffy Reader: update installed',
    iconUrl: getAssetUrl('assets/icon512.png'),
    message: 'Pin the JiffyReader icon for quick access, click the icon to open the config panel',
    type: 'basic',
  };

  if (/chrome/i.test(runner)) {
    config['buttons'] = [
      {
        title: 'See FAQS and ReadMe',
        iconUrl: getAssetUrl('assets/icon512.png'),
      },
      {
        title: 'JiffyReader.com',
        iconUrl: getAssetUrl('assets/icon512.png'),
      },
    ];
  }

  return config;
};

const showNotificationInstanceId = (browserLabel: string) => {
  return (notificationInstanceId) =>
    Logger.logInfo(
      `Update notification created for ${browserLabel} with id:`,
      notificationInstanceId,
    );
};

const fireUpdateNotification = () => {
  const browserLabel = !!chrome?.action ? 'chrome' : 'firefox';

  if (/chrome/i.test(browserLabel)) {
    runTimeHandler.notifications.create(
      UPDATE_NOTIFICATION_ID,
      getUpdateNotificationConfig(browserLabel),
      showNotificationInstanceId(browserLabel),
    );
  } else {
    runTimeHandler.notifications
      .create(UPDATE_NOTIFICATION_ID, getUpdateNotificationConfig(browserLabel))
      .then(showNotificationInstanceId(browserLabel));
  }
};

const initializeStorage = async (target = process.env.TARGET) => {
  const area = ((target as string).includes('firefox') && 'local') || 'sync';

  const storage = new Storage({ area });

  try {
    const prefStore = await storage.get(PREF_STORE_KEY);
    Logger.logInfo('background: prefStore install value', prefStore);

    if (!prefStore) {
      await storage.set(PREF_STORE_KEY, { global: defaultPrefs, local: {} });
      Logger.logInfo(
        'background: prefStore initialization processed',
        await storage.get(PREF_STORE_KEY),
      );
    } else {
      Logger.logInfo('background: prefStore initialization skipped', prefStore);
    }
  } catch (error) {
    Logger.logError(error);
  } finally {
    Logger.logInfo('prefInitial value', await storage.get(PREF_STORE_KEY));
  }
};

const listener = (request, sender, sendResponse) => {
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

chrome.runtime.onInstalled.addListener((event) => {
  const date = new Date(Date.now());
  Logger.logInfo('install success', event.reason, { install_timestamp: date.toISOString() });
  initializeStorage();

  chrome.storage.local.set({ install_timestamp: date.toISOString() }, () => {
    Logger.logInfo('background set time');
    Logger.logError();
  });

  if (event.reason === 'install' || process.env.NODE_ENV === 'production') {
    fireUpdateNotification();
  }
});

chrome?.commands?.onCommand?.addListener(commandListener);

runTimeHandler.runtime.onMessage.addListener(listener);
