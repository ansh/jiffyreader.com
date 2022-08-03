import Logger from '../jiffy-reader/src/services/Logger';

function storePrefs(action, data) {
  try {
    const key = `preferences_${action}`;
    const prefsJSONStr = JSON.stringify(data);
    Logger.logInfo({ key, prefsJSONStr });
    chrome.storage.local.set('storageHelper.storePrefs', { key: prefsJSONStr }, () => Logger.logError());
    return { success: true };
  } catch (err) {
    Logger.logError(err);
    return { success: false, error: err };
  }
}

function retrievePrefs(/** @type {string} 'local'|'global' */ action) {
  const key = `preferences_${action}`;
  // const prefsJSONStr = localStorage.getItem(key);

  // /** @type {Promise<Prefs[]>|Promise<Prefs>} */
  // const prefs = JSON.parse(prefsJSONStr);

  // return { data: prefs };

  return new Promise((res, rej) => {
    try {
      chrome.storage.local.get([key], (result) => {
        Logger.logInfo('Value currently is', result[key], result);

        res({ data: result });
      });
    } catch (err) {
      Logger.logError(err);
      rej(err);
    }
  });
}

export default {
  storePrefs,
  retrievePrefs,
};
