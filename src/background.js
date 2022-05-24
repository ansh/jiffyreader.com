// background.js

const color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.sync.get('toggleOnDefault', ({ toggleOnDefault }) => {
      if (!toggleOnDefault) {
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['src/convert.js'],
      });
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
