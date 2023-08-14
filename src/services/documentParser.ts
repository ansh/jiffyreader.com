import Logger from '~services/Logger';
import defaultPrefs from '~services/preferences';

import NodeObserver from './observer';
import { makeExcluder } from './siteElementExclusions';
import siteOverrides from './siteOverrides';

const { MAX_FIXATION_PARTS, FIXATION_LOWER_BOUND, BR_WORD_STEM_PERCENTAGE } = defaultPrefs;

// which tag's content should be ignored from bolded
const IGNORE_NODE_TAGS = ['STYLE', 'SCRIPT', 'BR-SPAN', 'BR-FIXATION', 'BR-BOLD', 'BR-EDGE', 'SVG', 'INPUT', 'TEXTAREA'];
const MUTATION_TYPES = ['childList', 'characterData'];

const IGNORE_MUTATIONS_ATTRIBUTES = ['br-ignore-on-mutation'];

/** @type {NodeObserver} */
let observer;

/** @type {string} */
let origin = '';

let excludeByOrigin: ReturnType<typeof makeExcluder>;

// making half of the letters in a word bold
function highlightText(sentenceText) {
	return sentenceText.replace(/\p{L}+/gu, (word) => {
		const { length } = word;

		const brWordStemWidth = length > 3 ? Math.round(length * BR_WORD_STEM_PERCENTAGE) : length;

		const firstHalf = word.slice(0, brWordStemWidth);
		const secondHalf = word.slice(brWordStemWidth);
		const htmlWord = `<br-bold>${makeFixations(firstHalf)}</br-bold>${secondHalf.length ? `<br-edge>${secondHalf}</br-edge>` : ''}`;
		return htmlWord;
	});
}

function hasLatex(sentence: string) {
	const result = /((\\)([\(\[]|begin))+/.test(sentence);
	// Logger.logInfo({ node: sentence, result });
	return result;
}

function makeFixations(textContent: string) {
	const COMPUTED_MAX_FIXATION_PARTS = textContent.length >= MAX_FIXATION_PARTS ? MAX_FIXATION_PARTS : textContent.length;

	const fixationWidth = Math.ceil(textContent.length * (1 / COMPUTED_MAX_FIXATION_PARTS));

	if (fixationWidth === FIXATION_LOWER_BOUND) {
		return `<br-fixation fixation-strength="1">${textContent}</br-fixation>`;
	}

	const fixationsSplits = new Array(COMPUTED_MAX_FIXATION_PARTS).fill(null).map((item, index) => {
		const wordStartBoundary = index * fixationWidth;
		const wordEndBoundary = wordStartBoundary + fixationWidth > textContent.length ? textContent.length : wordStartBoundary + fixationWidth;

		return `<br-fixation fixation-strength="${index + 1}">${textContent.slice(wordStartBoundary, wordEndBoundary)}</br-fixation>`;
	});

	return fixationsSplits.join('');
}

function isTextNodeWithLatex(node: Node) {
	const result = node.nodeType === Node.TEXT_NODE && hasLatex(node.textContent);
	// Logger.logInfo('found text_node with latex', result);
	return result;
}

function parseNode(node: Node) {
	// some websites add <style>, <script> tags in the <body>, ignore these tags
	if (!node?.parentElement?.tagName || IGNORE_NODE_TAGS.includes(node.parentElement.tagName)) {
		return;
	}

	if (node?.parentElement?.closest('body') && excludeByOrigin(node?.parentElement)) {
		node.parentElement.setAttribute('br-ignore-on-mutation', 'true');
		Logger.logInfo('found node to exclude', node, node.parentElement);
		return;
	}

	if (ignoreOnMutation(node)) {
		Logger.logInfo('found br-ignore-on-mutation', 'skipping');
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
			Logger.logError(error);
		}
		return;
	}

	if (node.hasChildNodes()) [...node.childNodes].forEach(parseNode);
}

const setReadingMode = (enableReading, /** @type {Document} */ document, contentStyle) => {
	const endTimer = Logger.logTime('ToggleReading-Time');
	origin = document?.URL ?? '';
	excludeByOrigin = makeExcluder(origin);

	try {
		if (enableReading) {
			const boldedElements = document.getElementsByTagName('br-bold');

			// makes sure to only run once regadless of how many times
			// setReadingMode(true) is called, consecutively
			if (boldedElements.length < 1) {
				addStyles(contentStyle, document);
			}

			document.body.setAttribute('br-mode', 'on');
			[...document.body.childNodes].forEach(parseNode);

			/** make an observer if one does not exist and body[br-mode=on] */
			if (!observer) {
				observer = new NodeObserver(document.body, null, mutationCallback);
				observer.observe();
			}
		} else {
			document.body.setAttribute('br-mode', 'off');
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

function ignoreOnMutation(node) {
	return node?.parentElement?.closest('[br-ignore-on-mutation]');
}

function mutationCallback(mutationRecords: MutationRecord[]) {
	const body = mutationRecords[0]?.target?.parentElement?.closest('body');
	if (body && ['textarea:focus', 'input:focus'].filter((query) => body?.querySelector(query)).length) {
		Logger.logInfo('focused or active input found, exiting mutationCallback');
		return;
	}

	Logger.logInfo('mutationCallback fired ', mutationRecords.length, mutationRecords);
	mutationRecords.forEach(({ type, addedNodes, target }) => {
		if (!MUTATION_TYPES.includes(type)) {
			return;
		}

		// Some changes don't add nodes
		// but values are changed
		// To account for that,
		// recursively parse the target node as well
		// parseNode(target);
		[...addedNodes, target]?.filter((node) => !ignoreOnMutation(node))?.forEach(parseNode);
	});
}

function addStyles(styleText, document) {
	const style = document.createElement('style');
	style.setAttribute('br-style', '');
	style.textContent = styleText + siteOverrides.getSiteOverride(document?.URL);
	Logger.logInfo('contentStyle', style.textContent);
	document.head.appendChild(style);
}

const setAttribute = (documentRef) => (attribute, value) => {
	documentRef.body.setAttribute(attribute, value);
};
const getAttribute = (documentRef) => (attribute) => documentRef.body.getAttribute(attribute);

const setProperty = (documentRef) => (property, value) => {
	documentRef.body.style.setProperty(property, value);
};

const getProperty = (documentRef) => (property) => documentRef.body.style.getPropertyValue(property);

const setSaccadesStyle = (documentRef) => (style) => {
	Logger.logInfo('saccades-style', style);

	if (/bold/i.test(style)) {
		const [, value] = style.split('-');
		setProperty(documentRef)('--br-boldness', value);
		setProperty(documentRef)('--br-line-style', '');
	}

	if (/line$/i.test(style)) {
		const [value] = style.split('-');
		setProperty(documentRef)('--br-line-style', value);
		setProperty(documentRef)('--br-boldness', '');
	}
};

export default {
	setReadingMode,
	makeHandlers: (documentRef) => ({
		setAttribute: setAttribute(documentRef),
		getAttribute: getAttribute(documentRef),
		setProperty: setProperty(documentRef),
		getProperty: getProperty(documentRef),
		setSaccadesStyle: setSaccadesStyle(documentRef),
	}),
	hasLatex,
};
