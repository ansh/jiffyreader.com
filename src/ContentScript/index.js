import Preferences from '../Preferences';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const FIXATION_BREAK_RATIO = 0.33;
const FIXATION_LOWER_BOUND = 0;
const DEFAULT_SACCADES_INTERVAL = 0;
const DEFAULT_FIXATION_STRENGTH = 3;

// which tag's content should be ignored from bolded
const IGNORE_NODE_TAGS = ['STYLE', 'SCRIPT'];

// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .replace(/\p{L}+/gu, (word) => {
      const { length } = word;
      let midPoint = 1;
      if (length > 3) midPoint = Math.round(length / 2);
      const firstHalf = word.slice(0, midPoint);
      const secondHalf = word.slice(midPoint);
      const htmlWord = `<br-bold class="br-bold">${makeFixations(firstHalf)}</br-bold>${secondHalf}`;
      return htmlWord;
    });
}

function makeFixations(/** @type string */ textContent) {
  const fixationWidth = Math.round(textContent.length * FIXATION_BREAK_RATIO);

  if (fixationWidth === FIXATION_LOWER_BOUND) return `<br-fixation fixation-strength="1">${textContent}</br-fixation>`;

  const start = textContent.substring(0, fixationWidth);
  const end = textContent.substring((textContent.length) - fixationWidth, textContent.length);

  const weakFixation = `<br-fixation fixation-strength="1">${start}</br-fixation>`;
  const strongFixation = `<br-fixation fixation-strength="3">${end}</br-fixation>`;
  const mildFixation = ((textContent.length - (fixationWidth * 2)) > 0)
    ? `<br-fixation fixation-strength="2">${textContent.substring(fixationWidth, (textContent.length) - fixationWidth)}</br-fixation>` : '';

  return weakFixation + mildFixation + strongFixation;
}

function parseNode(/** @type Element */ node) {
  // some websites add <style>, <script> tags in the <body>, ignore these tags
  if (IGNORE_NODE_TAGS.includes(node.parentElement.tagName)) {
    return;
  }

  if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
    try {
      const brSpan = document.createElement('br-span');

      brSpan.innerHTML = highlightText(node.nodeValue);

      if (brSpan.childElementCount === 0) return;

      node.parentElement.replaceChild(brSpan, node);
    } catch (error) {
      // no-op
    }
    return;
  }

  if (node.hasChildNodes()) [...node.childNodes].forEach(parseNode);
}

const SetReadingMode = (enableReading) => {
  const boldedElements = document.getElementsByTagName('br-bold');

  if (boldedElements.length < 1) {
    addStyles();
    [...document.body.children].forEach(parseNode);
  }

  if (enableReading) {
    document.body.classList.add('br-bold');
  } else {
    document.body.classList.remove('br-bold');
  }
};

const setSaccadesIntervalInDOM = (data) => {
  const saccadesInterval = data == null ? 0 : data;
  document.body.setAttribute('saccades-interval', saccadesInterval);
};

const setFixationStrength = (data) => {
  document.body.setAttribute('fixation-strength', data);
};

const onChromeRuntimeMessage = (message, sender, sendResponse) => {
  switch (message.type) {
    case 'getBrMode':
      sendResponse({ data: document.body.classList.contains('br-bold') });
      break;
    case 'getFixationStrength': {
      sendResponse({ data: document.body.getAttribute('fixation-strength') });
      break;
    }
    case 'setFixationStrength': {
      setFixationStrength(message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setReadingMode': {
      SetReadingMode(message.data);
      break;
    }
    case 'setSaccadesIntervalInDOM': {
      setSaccadesIntervalInDOM(message.data);
      break;
    }
    case 'getOrigin': {
      sendResponse({ data: window.location.origin });
      break;
    }
    case 'setlineHeight': {
      const { action } = message;
      const { step } = message;
      const LINE_HEIGHT_KEY = '--br-line-height';
      let currentHeight = document.body.style.getPropertyValue(LINE_HEIGHT_KEY);
      switch (action) {
        case 'lineHeightDecrease':
          currentHeight = /\d+/.test(currentHeight) && currentHeight > 1 ? Number(currentHeight) - step : currentHeight;
          break;

        case 'lineHeightIncrease':
          currentHeight = /\d+/.test(currentHeight) ? Number(currentHeight) : 1;
          currentHeight += step;
          break;

        case 'lineHeightReset':
          currentHeight = '';
          break;

        default:
          break;
      }
      if (/\d+/.test(currentHeight)) {
        document.body.style.setProperty(LINE_HEIGHT_KEY, currentHeight);
      } else {
        document.body.style.removeProperty(LINE_HEIGHT_KEY);
      }
      sendResponse({ data: currentHeight });
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

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .br-bold[fixation-strength="1"] :is(
      [saccades-interval="0"] br-bold [fixation-strength="1"], 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1) [fixation-strength="1"],
      [saccades-interval="2"] br-bold:nth-of-type(3n+1) [fixation-strength="1"],
      [saccades-interval="3"] br-bold:nth-of-type(4n+1) [fixation-strength="1"],
      [saccades-interval="4"] br-bold:nth-of-type(5n+1) [fixation-strength="1"]
      ) { 
      font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); 
    }

    .br-bold[fixation-strength="2"] :is(
      [saccades-interval="0"] br-bold [fixation-strength="1"], 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1) [fixation-strength="1"],
      [saccades-interval="2"] br-bold:nth-of-type(3n+1) [fixation-strength="1"],
      [saccades-interval="3"] br-bold:nth-of-type(4n+1) [fixation-strength="1"],
      [saccades-interval="4"] br-bold:nth-of-type(5n+1) [fixation-strength="1"],

      [saccades-interval="0"] br-bold [fixation-strength="2"], 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1) [fixation-strength="2"],
      [saccades-interval="2"] br-bold:nth-of-type(3n+1) [fixation-strength="2"],
      [saccades-interval="3"] br-bold:nth-of-type(4n+1) [fixation-strength="2"],
      [saccades-interval="4"] br-bold:nth-of-type(5n+1) [fixation-strength="2"]
      ) { 
      font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); 
    }

    .br-bold[fixation-strength="3"] :is(

      [saccades-interval="0"] br-bold [fixation-strength="1"], 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1) [fixation-strength="1"],
      [saccades-interval="2"] br-bold:nth-of-type(3n+1) [fixation-strength="1"],
      [saccades-interval="3"] br-bold:nth-of-type(4n+1) [fixation-strength="1"],
      [saccades-interval="4"] br-bold:nth-of-type(5n+1) [fixation-strength="1"],
      
      [saccades-interval="0"] br-bold [fixation-strength="2"], 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1) [fixation-strength="2"],
      [saccades-interval="2"] br-bold:nth-of-type(3n+1) [fixation-strength="2"],
      [saccades-interval="3"] br-bold:nth-of-type(4n+1) [fixation-strength="2"],
      [saccades-interval="4"] br-bold:nth-of-type(5n+1) [fixation-strength="2"]
      ,
      [saccades-interval="0"] br-bold [fixation-strength="3"], 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1) [fixation-strength="3"],
      [saccades-interval="2"] br-bold:nth-of-type(3n+1) [fixation-strength="3"],
      [saccades-interval="3"] br-bold:nth-of-type(4n+1) [fixation-strength="3"],
      [saccades-interval="4"] br-bold:nth-of-type(5n+1) [fixation-strength="3"]
      ) { 
      font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); 
    }
    `;
  document.head.appendChild(style);
}

docReady(async () => {
  runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);

  const { start, setPrefs, defaultPrefs } = Preferences.init({
    getOrigin: async () => new Promise((resolve, _) => {
      resolve(window.location.origin);
    }),
    subscribe: (prefs) => {
      if (!prefs.onPageLoad) {
        return;
      }
      setSaccadesIntervalInDOM(prefs.saccadesInterval);
      SetReadingMode(prefs.enabled);
      setFixationStrength(prefs.fixationStrength);
      // onLineHeight(prefs.lineHeight);
    },
  });

  start();
});
