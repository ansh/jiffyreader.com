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
    const [activeTab, activeTabError] = await new Promise((res, _) => {
      chrome.tabs.query({ active: true }, ([tab]) => {
        if (Number.isNaN(tab?.id)) throw new Error('Error: tab is undefined');
        res([tab, chrome.rumetime?.lastError]);
      });
    });

    if (activeTabError) throw Logger.logError(activeTabError);

    const [{ data }, getReadingModeError] = await new Promise((res, _) => {
      chrome.tabs.sendMessage(
        activeTab.id,
        { type: 'getReadingMode' },
        ((response) => {
          res([response, chrome.runtime?.lastError]);
        }),
      );
    });

    if (getReadingModeError) throw Logger.logError(getReadingModeError);

    chrome.tabs.sendMessage(activeTab.id, { type: 'setReadingMode', data: !data });
  }
};

chrome.commands.onCommand.addListener(commandListener);

runTimeHandler.runtime.onMessage.addListener(listener);
