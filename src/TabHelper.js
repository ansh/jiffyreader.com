const getActiveTab = () => new Promise((res, _) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => res(activeTab));
});

const getTabOrigin = (tab) => new Promise((res, _) => {
  chrome.tabs.sendMessage(tab.id, { type: 'getOrigin' }, ({ data }) => {
    const originError = chrome.runtime?.lastError;
    if (originError) throw originError;

    res(data);
  });
});

export default { getActiveTab, getTabOrigin };
