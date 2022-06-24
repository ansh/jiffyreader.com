import TabHelper from '../TabHelper';
import Logger from '../Logger';
import Preferences from '../Preferences';
import StorageHelper from '../StorageHelper';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const { getPrefs, defaultPrefs } = Preferences.init({
  getOrigin: async () => TabHelper.getTabOrigin(),
});

const listener = (request, sender, sendResponse) => {
  switch (request.message) {
    case 'storePrefs': {
      sendResponse(StorageHelper.storePrefs(request.action, request.data));
      break;
    }
    case 'retrievePrefs': {
      sendResponse(StorageHelper.retrievePrefs(request.action));
      break;
    }
    case 'setIconBadgeText': {
      TabHelper.getActiveTab().then((tab) => {
        chrome.browserAction.setBadgeText({ text: request.data ? 'On' : 'Off', tabId: tab.id });
        sendResponse(true);
      });
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
          data: prefs.saccadesInterval,
        },
        () => Logger.LogLastError(),
      );
      chrome.tabs.sendMessage(activeTab.id, { type: 'setLineHeight', data: prefs.lineHeight });
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          type: 'setFixationStrength',
          data: prefs.fixationStrength,
        },
        () => Logger.LogLastError(),
      );
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          type: 'setFixationStemOpacity',
          data: prefs.fixationStemOpacity,
        },
        () => Logger.LogLastError(),
      );
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          type: 'setSaccadesStyle',
          data: prefs.saccadesStyle,
        },
        () => Logger.LogLastError(),
      );
    }
  }
};

chrome.commands.onCommand.addListener(commandListener);

runTimeHandler.runtime.onMessage.addListener(listener);
