import Preferences from '../Preferences';
import documentParser from './documentParser';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const setSaccadesIntervalInDOM = (data) => {
  const saccadesInterval = data == null ? 0 : data;
  document.body.setAttribute('saccades-interval', saccadesInterval);
};

const setFixationStrength = (data) => {
  document.body.setAttribute('fixation-strength', data);
};

const setLineHeight = (lineHeight) => {
  document.body.style.setProperty('--br-line-height', lineHeight);
};

const onChromeRuntimeMessage = (message, sender, sendResponse) => {
  switch (message.type) {
    case 'setFixationStrength': {
      setFixationStrength(message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setReadingMode': {
      documentParser.setReadingMode(message.data, document);
      break;
    }
    case 'setSaccadesIntervalInDOM': {
      setSaccadesIntervalInDOM(message.data);
      break;
    }
    case 'setLineHeight': {
      setLineHeight(message.data);
      break;
    }
    case 'getOrigin': {
      sendResponse({ data: window.location.origin });
      break;
    }
    case 'getReadingMode': {
      sendResponse({ data: document.body.classList.contains('br-bold') });
      break;
    }

    default:
      break;
  }
};

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === 'complete'
    || document.readyState === 'interactive'
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

docReady(async () => {
  runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);

  const { start } = Preferences.init({
    getOrigin: async () => new Promise((resolve, _) => {
      resolve(window.location.origin);
    }),
    subscribe: (prefs) => {
      if (!prefs.onPageLoad) {
        return;
      }
      setReadingMode(prefs.onPageLoad);
      setSaccadesIntervalInDOM(prefs.saccadesInterval);
      setFixationStrength(prefs.fixationStrength);
      setLineHeight(prefs.lineHeight);
    },
  });

  start();
});
