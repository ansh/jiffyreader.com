const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const FIXATION_BREAK_RATIO = 0.33;
const FIXATION_LOWER_BOUND = 0;
const DEFAULT_SACCADES_INTERVAL = 0;
const DEFAULT_FIXATION_STRENGTH = 3;
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
  if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
    try {
      const brSpan = document.createElement('br-span');

      brSpan.innerHTML = highlightText(node.nodeValue);

      if (brSpan.childElementCount === 0) return;

      node.parentElement.replaceChild(brSpan, node);
    } catch (error) {

    }
    return;
  }

  if (node.hasChildNodes()) [...node.childNodes].forEach(parseNode);
}

const ToggleReading = (enableReading) => {
  console.time('ToggleReading-Time');
  const boldedElements = document.getElementsByTagName('br-bold');

  if (boldedElements.length < 1) {
    addStyles();
    [...document.body.children].flatMap((child) => [...child.childNodes]).forEach(parseNode);
  }

  if (document.body.classList.contains('br-bold') || enableReading === false) {
    document.body.classList.remove('br-bold');
    console.timeEnd('ToggleReading-Time');
    return;
  }

  if (!document.body.classList.contains('br-bold')) {
    document.body.classList.add('br-bold');
  }

  if (enableReading) document.body.classList.add('br-bold');

  console.timeEnd('ToggleReading-Time');
};

const onChromeRuntimeMessage = (message, sender, sendResponse) => {
  switch (message.type) {
    case 'getBrMode':
      sendResponse({ data: document.body.classList.contains('br-bold') });
      break;
    case 'toggleReadingMode': {
      ToggleReading();
      break;
    }
    case 'getFixationStrength': {
      sendResponse({ data: document.body.getAttribute('fixation-strength') });
      break;
    }
    case 'setFixationStrength': {
      document.body.setAttribute('fixation-strength', message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setReadingMode': {
      ToggleReading(message.data);
      break;
    }
    case 'setSaccadesIntervalInDOM': {
      const saccadesInterval = message.data == null ? 0 : message.data;
      document.body.setAttribute('saccades-interval', saccadesInterval);
      break;
    }
    case 'setlineHeight': {
      const { action } = message;
      const { step } = message;
      const LINE_HEIGHT_KEY = '--br-line-height';
      let currentHeight = document.body.style.getPropertyValue(LINE_HEIGHT_KEY);
      switch (action) {
        case 'lineHeightdecrease':
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

  chrome.runtime.sendMessage(
    { message: 'getToggleOnDefault' },
    (response) => {
      if (!['true', true].includes(response.data)) return;
      ToggleReading(response.data === 'true');
    },
  );
  chrome.runtime.sendMessage(
    { message: 'getSaccadesInterval' },
    (response) => {
      const saccadesInterval = response === undefined || response.data == null
        ? DEFAULT_SACCADES_INTERVAL : response.data;
      document.body.setAttribute('saccades-interval', saccadesInterval);
    },
  );

  chrome.runtime.sendMessage(
    { message: 'getFixationStrength' },
    (response) => {
      const fixationStrength = response === undefined || response.data == null
        ? DEFAULT_FIXATION_STRENGTH : response.data;
      document.body.setAttribute('fixation-strength', fixationStrength);
    },
  );
});
