import contentStyle from '~/styles/contentStyle.scss';
import documentParser from '~services/documentParser';
import Logger from '~services/Logger';
import defaultPrefs from '~services/preferences';

const { saccadesInterval, fixationStrength, saccadesColor, saccadesStyle, fixationEdgeOpacity } = {
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

	setProperty('--fixation-edge-opacity', getProperty('--fixation-edge-opacity') ?? `${fixationEdgeOpacity}%`);
}

function toggleReadingMode() {
	Logger.logInfo('called');
	documentParser.setReadingMode(document.body.getAttribute('br-mode') !== 'on', document, contentStyle);
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
} as const;

/**
 * @param {string} stateTransitionKey
 * @param {string|null} currentActiveState
 * @returns {[targetState,nextState]}
 */
function getStateTransitionEntry<TKey extends keyof typeof stateTransitions>(
	stateTransitionKey: TKey,
	currentActiveState: (typeof stateTransitions)[TKey][number][number],
	stateEntries = stateTransitions,
) {
	return stateEntries[stateTransitionKey].find(([state]) => `${state}` === `${currentActiveState}`) as (typeof stateTransitions)[TKey][number];
}

function toggleStateEngine<
	T extends keyof typeof stateTransitions,
	G extends (input: T) => (typeof stateTransitions)[T][number][number],
	S extends (input: T, value: (typeof stateTransitions)[T][number][number]) => void,
>(
	stateTransitionKey: T,
	setter: S = (stateTransitionKey === '--fixation-edge-opacity' ? setProperty : setAttribute) as any,
	getter: G = (stateTransitionKey === '--fixation-edge-opacity' ? getProperty : getAttribute) as any,
) {
	const currentActiveState = getter(stateTransitionKey);

	const [, nextState] = getStateTransitionEntry(stateTransitionKey, currentActiveState);

	Logger.logInfo('stateTransitionKey', stateTransitionKey, 'currentActiveState', currentActiveState, 'nextState', nextState, stateTransitions[stateTransitionKey]);
	setter(stateTransitionKey, nextState);

	if (document.body.getAttribute('br-mode') !== 'on') {
		toggleReadingMode();
	}
}

const setProperty = (property: string, value: string | null) => {
	Logger.logInfo({ setProperty, property, value });
	document.body.style.setProperty(property, value);
};
const setAttribute = (attribute: string, value: any) => document.body.setAttribute(attribute, value);
const getProperty = (property: string) => document.body.style.getPropertyValue(property);
const getAttribute = (attribute: string) => document.body.getAttribute(attribute);

const callableActions = {
	fireReadingToggle: toggleReadingMode,
	fireFixationStrengthTransition: () => toggleStateEngine('fixation-strength'),
	fireSaccadesIntervalTransition: () => toggleStateEngine('saccades-interval'),
	fireSaccadesColorTransition: () => toggleStateEngine('saccades-color'),
	firefixationEdgeOpacityTransition: () => toggleStateEngine('--fixation-edge-opacity'),
};

const actionToFire = 'ACTION_TO_FIRE' as keyof typeof callableActions;

Logger.logInfo('actionToFire', actionToFire, callableActions);

callableActions[actionToFire]();

function init() {
	writeInitialConfigsToDom();
}

init();
