import Logger from '../Logger';
import Preferences from '../Preferences';
import documentParser from './documentParser';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const setSaccadesIntervalInDOM = (data) => {
  Logger.logInfo('saccades-interval', data);
  const saccadesInterval = data == null ? 0 : data;
  document.body.setAttribute('saccades-interval', saccadesInterval);
};

const setFixationStrength = (strength) => {
  Logger.logInfo('fixation-strength', strength);
  document.body.setAttribute('fixation-strength', strength);
};

const setLineHeight = (lineHeight) => {
  Logger.logInfo('lineHeight', lineHeight);
  document.body.style.setProperty('--br-line-height', lineHeight);
};

const setSaccadesColor = (color = '') => {
  Logger.logInfo('saccades-color', color);
  document.body.setAttribute('saccades-color', color);
};

const setFixationEdgeOpacity = (opacity) => {
  Logger.logInfo('fixation-edge-opacity', `${opacity}%`);
  document.body.style.setProperty('--fixation-edge-opacity', `${opacity}%`);
};

const setSaccadesStyle = (style) => {
  Logger.logInfo('saccades-style', style);

  if (/bold/i.test(style)) {
    const [, value] = style.split('-');
    document.body.style.setProperty('--br-boldness', value);
    document.body.style.setProperty('--br-line-style', '');
  }

  if (/line$/i.test(style)) {
    const [value] = style.split('-');
    document.body.style.setProperty('--br-line-style', value);
    document.body.style.setProperty('--br-boldness', '');
  }
};

const setReadingMode = (
  /** @type{ boolean } */ readingMode,
  /** @type {HTMLDocument} */ document,
) => {
  Logger.logInfo('reading-mode', readingMode);
  documentParser.setReadingMode(readingMode, document);
  chrome.runtime.sendMessage({ message: 'setIconBadgeText', data: readingMode }, (response) => Logger.LogLastError());
};

const onChromeRuntimeMessage = (message, sender, sendResponse) => {
  switch (message.type) {
    case 'setFixationStrength': {
      setFixationStrength(message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setReadingMode': {
      setReadingMode(message.data, document);
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
      sendResponse({ data: document.body.getAttribute('br-mode') === 'on' });
      break;
    }
    case 'getSaccadesColor': {
      sendResponse({ data: document.body.getAttribute('saccades-color') });
      break;
    }
    case 'setSaccadesColor': {
      setSaccadesColor(message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setSaccadesStyle': {
      setSaccadesStyle(message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setFixationEdgeOpacity': {
      setFixationEdgeOpacity(message.data);
      break;
    }

    default:
      break;
  }
};

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

docReady(async () => {
  runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);

  const { start, defaultPrefs } = Preferences.init({
    getOrigin: async () => new Promise((resolve, _) => {
      resolve(window.location.origin);
    }),
    subscribe: (prefs) => {
      if (!prefs.onPageLoad) {
        return;
      }
      setReadingMode(prefs.onPageLoad, document);
      setSaccadesIntervalInDOM(prefs.saccadesInterval);
      setFixationStrength(prefs.fixationStrength);
      setLineHeight(prefs.lineHeight);
      setSaccadesColor(prefs.saccadesColor);
      setSaccadesStyle(prefs.saccadesStyle);
      setFixationEdgeOpacity(prefs.fixationEdgeOpacity ?? defaultPrefs().fixationEdgeOpacity);
    },
    onStartup: (prefs) => {
      chrome.runtime.sendMessage({ message: 'setIconBadgeText', data: prefs.onPageLoad }, () => Logger.LogLastError());
    },
  });

  start();
});
