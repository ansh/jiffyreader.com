import documentParser from '../ContentScript/documentParser';
import Logger from '../Logger';
import { defaultPrefs } from '../Preferences';

const {
  saccadesInterval, fixationStrength, saccadesColor, saccadesStyle, fixationEdgeOpacity,
} = {
  ...defaultPrefs,
};
function writeInitialConfigsToDom() {
  setAttribute('saccades-interval', getAttribute('saccades-interval') ?? saccadesInterval);
  setAttribute('fixation-strength', getAttribute('fixation-strength') ?? fixationStrength);
  setAttribute('saccades-color', getAttribute('saccades-color') ?? saccadesColor);

  // console.log(saccadesStyle);
  if (/bold/i.test(saccadesStyle)) {
    const [, value] = saccadesStyle.split('-');
    const oldValue = getProperty('--br-boldness');
    const nextValue = !Number.isNaN(oldValue) && oldValue !== '' ? oldValue : value;
    setProperty('--br-boldness', nextValue);
  }

  if (/line/i.test(saccadesStyle)) {
    const [value] = saccadesStyle.split('-');
    const oldValue = getProperty('--br-line-style');
    const nextValue = !Number.isNaN(oldValue) && oldValue !== '' ? oldValue : value;
    setProperty('--br-line-style', nextValue);
  }

  setProperty(
    '--fixation-edge-opacity',
    getProperty('--fixation-edge-opacity') ?? `${fixationEdgeOpacity}%`,
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
    [3, 4],
    [4, 1],
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
  '--fixation-edge-opacity': [
    [null, '25%'],
    ['', '25%'],
    ['25%', '50%'],
    ['50%', '75%'],
    ['75%', '100%'],
    ['80%', '25%'],
    ['100%', '25%'],
  ],
};

/**
 * @param {string} stateTransitionKey
 * @param {string|null} currentActiveState
 * @returns {[targetState,nextState]}
 */
function getStateTransitionEntry(stateTransitionKey, currentActiveState) {
  return stateTransitions[stateTransitionKey].find(
    ([state]) => `${state}` === `${currentActiveState}`,
  );
}

function toggleStateEngine(
  stateTransitionKey,
  /** @type {(property, value)} */ callbackSetter = setAttribute,
  /** @type {(identified) => string}  */ callbackGetter = getAttribute,
) {
  const currentActiveState = callbackGetter(stateTransitionKey);

  const [, nextState] = getStateTransitionEntry(stateTransitionKey, currentActiveState);

  Logger.logInfo(
    'stateTransitionKey',
    stateTransitionKey,
    'currentActiveState',
    currentActiveState,
    'nextState',
    nextState,
    stateTransitions[stateTransitionKey],
  );
  callbackSetter(stateTransitionKey, nextState);

  if (document.body.getAttribute('br-mode') !== 'on') {
    toggleReadingMode();
  }
}

const setProperty = (property, value) => {
  Logger.logInfo({ setProperty, property, value });
  document.body.style.setProperty(property, value);
};
const setAttribute = (attribute, value) => document.body.setAttribute(attribute, value);
const getProperty = (property) => document.body.style.getPropertyValue(property);
const getAttribute = (attribute) => document.body.getAttribute(attribute);

const callableActions = {
  fireReadingToggle: toggleReadingMode,
  fireFixationStrengthTransition: () => toggleStateEngine('fixation-strength'),
  fireSaccadesIntervalTransition: () => toggleStateEngine('saccades-interval'),
  fireSaccadesColorTransition: () => toggleStateEngine('saccades-color'),
  firefixationEdgeOpacityTransition: () => toggleStateEngine('--fixation-edge-opacity', setProperty, getProperty),
};

const actionToFire = 'ACTION_TO_FIRE';

Logger.logInfo('actionToFire', actionToFire, callableActions);

callableActions[actionToFire]();

function init() {
  writeInitialConfigsToDom();
}

init();
