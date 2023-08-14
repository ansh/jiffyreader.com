import Logger from '~services/Logger';

const siteElementExclusions = {
	'play.google.com': ['.mat-icon-button', 'mat-icon-button', '.scrubber-container', 'header>nav>a'],
	'app.grammarly.com': ['.editor-editorContainer'],
	'notion.so': ['.notion-frame'],
	'.': ['[contenteditable]', '[role=textbox]', 'input', 'textarea'], //disable input containers for all domains
};

export const makeExcluder = (/** @type string */ origin) => {
	Logger.logInfo('makeExcluder', origin);

	const [, exclusions] = Object.entries(siteElementExclusions).find(([domain]) => new RegExp(domain, 'i').test(origin)) ?? [null, []];
	return (element: HTMLElement) => {
		const result = exclusions.some((exclusion) => element.closest(exclusion));
		return result;
	};
};

export default {
	makeExcluder,
};
