import Logger from '../Logger';
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

const setSaccadesColor = (color = '') => {
  document.body.setAttribute('saccades-color', color);
};

const setFixationStemOpacity = (opacity) => {
  document.body.setAttribute('fixation-stem-opacity', opacity);
};

const setSaccadesStyle = (style) => {
  Logger.logInfo(style);

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
  documentParser.setReadingMode(readingMode, document);
  chrome.runtime.sendMessage(
    { message: 'setIconBadgeText', data: readingMode ? 'On' : 'Off' },
    (response) => {
      const { lastError } = chrome.runtime;
      if (lastError) Logger.logError(lastError);
    },
  );
};

const onChromeRuntimeMessage = (message, sender, sendResponse) => new Promise((res, _) => {
  switch (message.type) {
    case 'setFixationStrength': {
      setFixationStrength(message.data);
      res({ success: true });
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
      res({ data: window.location.origin });
      break;
    }
    case 'getReadingMode': {
      res({ data: document.body.getAttribute('br-mode') === 'on' });
      break;
    }
    case 'getSaccadesColor': {
      res({ data: document.body.getAttribute('saccades-color') });
      break;
    }
    case 'setSaccadesColor': {
      setSaccadesColor(message.data);
      res({ success: true });
      break;
    }
    case 'setSaccadesStyle': {
      setSaccadesStyle(message.data);
      res({ success: true });
      break;
    }
    case 'setFixationStemOpacity': {
      setFixationStemOpacity(message.data);
      break;
    }

    default:
      break;
  }
});

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
      setFixationStemOpacity(prefs.fixationStemOpacity ?? defaultPrefs().fixationStemOpacity);
    },
  });

  start();
});
