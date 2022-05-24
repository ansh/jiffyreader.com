// background.js

const color = '#3aa757';
const DEFAULT_SACCADE = 2; // value can be changed to 1 also

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ color, saccades: DEFAULT_SACCADE });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.sync.get(['toggleOnDefault', 'saccades'], ({ toggleOnDefault, saccades }) => {
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
          function: (_saccades) => { document.body.setAttribute('saccades', _saccades); return _saccades; }, // set saccades on body element and return it to be saved in storage.sync
          args: [saccades ?? DEFAULT_SACCADE],
        },
        ([activeFrame]) => {
        // save the current/Default_saccades in storage.sync
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
