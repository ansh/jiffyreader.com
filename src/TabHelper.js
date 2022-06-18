/** @returns {Promise<chrome.tabs.Tab>} */
const getActiveTab = () => new Promise((res, _) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => res(activeTab));
});

/**
 * @params {chrome.tabs.Tab} [tab = getActiveTab()]
 * @returns {Promise<string>} -
 * the origin of the tab provided or the origin of the active tab if tab is null
 */
const getTabOrigin = async (tab) => {
  const tempTab = tab ?? (await getActiveTab());
  return new Promise((res, _) => {
    chrome.tabs.sendMessage(tempTab.id, { type: 'getOrigin' }, (/** @type {{data: string}} */ { data }) => {
      const originError = chrome.runtime?.lastError;
      if (originError) throw originError;

      res(data);
    });
  });
};

export default { getActiveTab, getTabOrigin };
