import Preferences from '../Preferences';
import Logger from '../Logger';
import NodeObserver from './observer';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const FIXATION_BREAK_RATIO = 0.33;
const FIXATION_LOWER_BOUND = 0;
const DEFAULT_SACCADES_INTERVAL = 0;
const DEFAULT_FIXATION_STRENGTH = 3;
const BR_WORD_STEM_PERCENTAGE = 0.6;

// which tag's content should be ignored from bolded
const IGNORE_NODE_TAGS = ['STYLE', 'SCRIPT', 'BR-SPAN', 'BR-FIXATION', 'BR-BOLD', 'SVG'];
const MUTATION_TYPES = ['childList', 'characterData'];

/** @type {NodeObserver} */
let observer;

// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .replace(/\p{L}+/gu, (word) => {
      const { length } = word;
      let brWordStemWidth = 1;
      if (length > 3) brWordStemWidth = Math.round(length * BR_WORD_STEM_PERCENTAGE);
      const firstHalf = word.slice(0, brWordStemWidth);
      const secondHalf = word.slice(brWordStemWidth);
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
  if (!node?.parentElement?.tagName || IGNORE_NODE_TAGS.includes(node.parentElement.tagName)) {
    return;
  }

  if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
    try {
      const brSpan = document.createElement('br-span');

      brSpan.innerHTML = highlightText(node.nodeValue);

      if (brSpan.childElementCount === 0) return;

      // to avoid duplicates of brSpan, check it if
      // this current textNode has a left sibling of br span
      // we know that is possible because
      // we will specifically insert the br-span
      // on the left of a text node, and keep
      // the text node alive later. so if we get to
      // this text node again. that means that the
      // text node was updated and the br span is now stale
      // so remove that if exist
      if (node.previousSibling?.tagName === 'BR-SPAN') {
        node.parentElement.removeChild(node.previousSibling);
      }

      // dont replace for now, cause we're keeping it alive
      // below
      // node.parentElement.replaceChild(brSpan, node);

      // keep the textNode alive in the dom, but
      // empty it's contents
      // and insert the brSpan just before it
      // we need the text node alive because
      // youtube has some reference for it internally
      // and we want to listen to it when it changes
      node.parentElement.insertBefore(brSpan, node);
      node.textContent = '';
    } catch (error) {
      // no-op
    }
    return;
  }

  if (node.hasChildNodes()) [...node.childNodes].forEach(parseNode);
}

const setReadingMode = (enableReading) => {
  const endTimer = Logger.logTime('ToggleReading-Time');
  try {
    if (enableReading) {
      const boldedElements = document.getElementsByTagName('br-bold');

      // makes sure to only run once regadless of how many times
      // setReadingMode(true) is called, consecutively
      if (boldedElements.length < 1) {
        addStyles();
      }
      /**
       * add .br-bold if it was not present or if enableReading is true
       * enableReading = true means add .br-bold to document.body when a page loads
       */
      document.body.classList.add('br-bold');
      [...document.body.children].forEach(parseNode);

      /** make an observer if one does not exist and .br-bold is present on body/active */
      if (!observer) {
        observer = new NodeObserver(document.body, null, mutationCallback);
        observer.observe();
      }
    } else {
      document.body.classList.remove('br-bold');
      if (observer) {
        observer.destroy();
        observer = null;
      }
    }
  } catch (error) {
    Logger.logError(error);
  } finally {
    endTimer();
  }
};

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

function mutationCallback(/** @type MutationRecord[] */ mutationRecords) {
  Logger.logInfo('mutationCallback fired ', mutationRecords.length);
  mutationRecords.forEach(({ type, addedNodes, target }) => {
    if (!MUTATION_TYPES.includes(type)) {
      return;
    }

    addedNodes?.forEach(parseNode);
    // Some changes don't add nodes
    // but values are changed
    // To account for that,
    // recursively parse the target node as well
    parseNode(target);
  });
}

const onChromeRuntimeMessage = (message, sender, sendResponse) => {

      console.log(message);
  switch (message.type) {
    case 'setFixationStrength': {
      setFixationStrength(message.data);
      sendResponse({ success: true });
      break;
    }
    case 'setReadingMode': {
      setReadingMode(message.data);
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
