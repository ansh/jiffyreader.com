import documentParser from '../ContentScript/documentParser';
import Logger from '../Logger';
import { defaultPrefs } from '../Preferences';

const {
  saccadesInterval, fixationStrength, saccadesColor, fixationStemOpacity,
} = {
  ...defaultPrefs,
  fixationStrength: 3,
};
function writeAttributesToDom() {
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

  document.body.setAttribute('fixation-stem-opacity', document.body.getAttribute('fixation-stem-opacity') ?? fixationStemOpacity);
}

writeAttributesToDom();

function toggleReadingMode() {
  Logger.logInfo('called');
  documentParser.setReadingMode(!document.body.classList.contains('br-bold'), document);
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
    [null, '20'],
    [0, 20],
    [20, 40],
    [40, 60],
    [60, 80],
    [80, 100],
    [100, 0],
  ],
};

/**
 * @param {string} stateTransitionKey
 * @param {string|null} currentActiveState
 * @returns {[targetState,nextState]}
 */
function getStateTransitionEntry(stateTransitionKey, currentActiveState) {
  return stateTransitions[stateTransitionKey].find(([state]) => `${state}` === currentActiveState);
}

function toggleStateEngine(stateTransitionKey) {
  const currentActiveState = document.body.getAttribute(stateTransitionKey);
  Logger.logInfo(
    'stateTransitionKey',
    stateTransitionKey,
    'currentActiveState',
    currentActiveState,
    stateTransitions[stateTransitionKey],
  );

  const [, nextState] = getStateTransitionEntry(stateTransitionKey, currentActiveState);

  document.body.setAttribute(stateTransitionKey, nextState);

  if (!document.body.classList.contains('br-bold')) toggleReadingMode();
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
