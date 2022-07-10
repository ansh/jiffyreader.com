import Logger from './Logger';

/** @returns {Promise<chrome.tabs.Tab>} */
const getActiveTab = () => new Promise((res, rej) => {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      Logger.logInfo(activeTab);
      res(activeTab);
    });
  } catch (err) {
    rej(err);
  }
});

/**
 * @params {chrome.tabs.Tab} [tab = getActiveTab()]
 * @returns {Promise<string>} -
 * the origin of the tab provided or the origin of the active tab if tab is null
 */
const getTabOrigin = async (tab) => {
  const tempTab = tab ?? (await getActiveTab());
  return new Promise((res, rej) => {
    try {
      chrome.tabs.sendMessage(
        tempTab.id,
        { type: 'getOrigin' },
        (/** @type {{data: string}} */ { data }) => {
          const originError = chrome.runtime?.lastError;
          if (originError) throw originError;

          res(data);
        },
      );
    } catch (err) {
      rej(err);
    }
  });
};

export default { getActiveTab, getTabOrigin };
