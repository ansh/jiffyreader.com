import TabHelper from '../TabHelper';
import Logger from '../Logger';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const listener = (request, sender, sendResponse) => {
  switch (request.message) {
    case 'storePrefs': {
      try {
        const key = `preferences_${request.action}`;
        const prefsJSONStr = JSON.stringify(request.data);
        localStorage.setItem(key, prefsJSONStr);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err });
      }
      break;
    }
    case 'retrievePrefs': {
      const key = `preferences_${request.action}`;
      const prefsJSONStr = localStorage.getItem(key);
      try {
        const prefs = JSON.parse(prefsJSONStr);
        sendResponse({ data: prefs });
      } catch (err) {
        sendResponse({ data: null, error: err });
      }
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

    const origin = await TabHelper.getActiveTab().then(TabHelper.getTabOrigin);
    const localPrefs = JSON.parse(localStorage.getItem('preferences_local'))[origin];

    // set prefs to global if local is not present or local[scope] == 'global'
    const prefs = localPrefs?.scope === 'local' ? localPrefs : JSON.parse(localStorage.getItem('preferences_global'));

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
