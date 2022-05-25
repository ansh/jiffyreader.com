// background.js

const DEFAULT_SACCADE_INTERVAL = 0;

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ saccades: DEFAULT_SACCADE_INTERVAL });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.sync.get(['toggleOnDefault', 'saccadesInterval'], ({ toggleOnDefault, saccadesInterval }) => {
      if (!toggleOnDefault) {
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['src/convert.js'],
      });

      // set default saccades on install
      chrome.scripting.executeScript(
        {
          target: { tabId, allFrames: true },
          function: (_saccadesInterval) => { document.body.setAttribute('saccades-interval', _saccadesInterval); return _saccadesInterval; }, // set saccades on body element and return it to be saved in storage.sync
          args: [saccadesInterval ?? DEFAULT_SACCADE_INTERVAL],
        },
        ([activeFrame]) => {
        // save the current/Default_saccade_INTERVALs in storage.sync
          chrome.storage.sync.set({ saccades: activeFrame.result });
        },
      );
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-bionic') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ['src/convert.js'],
    });
  }
});
