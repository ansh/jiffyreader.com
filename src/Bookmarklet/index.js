import documentParser from '../ContentScript/documentParser';
import Logger from '../Logger';
import { defaultPrefs } from '../Preferences';

const {
  saccadesInterval, fixationStrength, saccadesColor, saccadesStyle, fixationStemOpacity,
} = {
  ...defaultPrefs,
};
function writeInitialConfigsToDom() {
  document.body.setAttribute(
    'saccades-interval',
    document.body.getAttribute('saccades-interval') ?? saccadesInterval,
  );
  document.body.setAttribute(
    'fixation-strength',
    document.body.getAttribute('fixation-strength') ?? fixationStrength,
  );
  document.body.setAttribute(
    'saccades-color',
    document.body.getAttribute('saccades-color') ?? saccadesColor,
  );

  // console.log(saccadesStyle);
  if (/bold/i.test(saccadesStyle)) {
    const [, value] = saccadesStyle.split('-');
    const oldValue = document.body.style.getPropertyValue('--br-boldness');
    const nextValue = !Number.isNaN(oldValue) && oldValue !== '' ? oldValue : value;
    document.body.style.setProperty('--br-boldness', nextValue);
  }

  if (/line/i.test(saccadesStyle)) {
    const [value] = saccadesStyle.split('-');
    const oldValue = document.body.style.getPropertyValue('--br-line-style');
    const nextValue = !Number.isNaN(oldValue) && oldValue !== '' ? oldValue : value;
    document.body.style.setProperty('--br-line-style', nextValue);
  }

  document.body.setAttribute(
    'fixation-stem-opacity',
    document.body.getAttribute('fixation-stem-opacity') ?? fixationStemOpacity,
  );
}

function toggleReadingMode() {
  Logger.logInfo('called');
  documentParser.setReadingMode(document.body.getAttribute('br-mode') !== 'on', document);
}

const stateTransitions = {
  'fixation-strength': [
    [null, 1],
    ['', 1],
    [1, 2],
    [2, 3],
    [3, 1],
  ],
  'saccades-interval': [
    [null, 1],
    ['', 1],
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
  ],
  'saccades-color': [
    [null, 'light'],
    ['', 'light'],
    ['light', 'light-100'],
    ['light-100', 'dark'],
    ['dark', 'dark-100'],
    ['dark-100', ''],
  ],
  'fixation-stem-opacity': [
    [null, '100'],
    [0, 100],
    [100, 80],
    [80, 40],
    [40, 0],
  ],
};

/**
 * @param {string} stateTransitionKey
 * @param {string|null} currentActiveState
 * @returns {[targetState,nextState]}
 */
function getStateTransitionEntry(stateTransitionKey, currentActiveState) {
  return stateTransitions[stateTransitionKey].find(([state]) => `${state}` === `${currentActiveState}`);
}

function toggleStateEngine(stateTransitionKey, /** @type {(property, value)} */ callback) {
  const currentActiveState = document.body.getAttribute(stateTransitionKey);
  Logger.logInfo('stateTransitionKey', stateTransitionKey, 'currentActiveState', currentActiveState, 'nextState', stateTransitions[stateTransitionKey]);

  let updateCallback;

  if (!updateCallback) {
    updateCallback = (attribute, value) => document.body.setAttribute(attribute, value);
  } else {
    updateCallback = callback;
  }

  const [, nextState] = getStateTransitionEntry(stateTransitionKey, currentActiveState);

  updateCallback(stateTransitionKey, nextState);

  if (document.body.getAttribute('br-mode') !== 'on') {
    toggleReadingMode();
  }
}

const callableActions = {
  fireReadingToggle: toggleReadingMode,
  fireFixationStrengthTransition: () => toggleStateEngine('fixation-strength'),
  fireSaccadesIntervalTransition: () => toggleStateEngine('saccades-interval'),
  fireSaccadesColorTransition: () => toggleStateEngine('saccades-color'),
  fireFixationStemOpacityTransition: () => toggleStateEngine('fixation-stem-opacity'),
};

const actionToFire = 'ACTION_TO_FIRE';

Logger.logInfo('actionToFire', actionToFire, callableActions);

callableActions[actionToFire]();

function init() {
  writeInitialConfigsToDom();
}

init();
