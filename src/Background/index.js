import TabHelper from '../TabHelper';
import Logger from '../Logger';
import Preferences from '../Preferences';
import StorageHelper from '../StorageHelper';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const { getPrefs } = Preferences.init({
  getOrigin: async () => TabHelper.getActiveTab().then(TabHelper.getTabOrigin),
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
    default:
      break;
  }
};

const commandListener = async (command) => {
  Logger.logInfo('commmand fired', command);

  if (command === 'toggle-bionic') {
    const activeTab = await TabHelper.getActiveTab();

    const [{ data: tabBrMode }, getReadingModeError] = await new Promise((res, _) => {
      chrome.tabs.sendMessage(
        activeTab.id,
        { type: 'getReadingMode' },
        ((response) => {
          res([response, chrome.runtime?.lastError]);
        }),
      );
    });

    if (getReadingModeError) throw Logger.logError(getReadingModeError);

    // set prefs to global if local is not present or local[scope] == 'global'
    const prefs = await getPrefs();

    const intentedTabBrMode = !tabBrMode;
    chrome.tabs.sendMessage(activeTab.id, { type: 'setReadingMode', data: intentedTabBrMode });

    if (intentedTabBrMode) {
      chrome.tabs.sendMessage(activeTab.id, { type: 'setSaccadesIntervalInDOM', data: prefs.saccadesInterval });
      chrome.tabs.sendMessage(activeTab.id, { type: 'setLineHeight', data: prefs.lineHeight });
      chrome.tabs.sendMessage(activeTab.id, { type: 'setFixationStrength', data: prefs.fixationStrength });
    }
  }
};

chrome.commands.onCommand.addListener(commandListener);

runTimeHandler.runtime.onMessage.addListener(listener);
