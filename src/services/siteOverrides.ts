/**
 * provide style overrides by domain
 *
 */
import Logger from '~services/Logger';

const siteOverrides = {
	'play.google.com': `[br-mode=on] reader-rendered-page { overflow: auto !important; }`,
};

/**
 * @description overrides to engage when a page is loaded
 * this is to counter the effects of plasmo injecting a div to hold the shadow dom
 */
const sitePassiveOverrides = {
	'twitter.com': 'div:has(+ body) { position: absolute; z-index: -1; } iframe + div + body{ position: absolute: z-index: 1 }',
	'youtube.com/embed': 'div:has( + body) { position: absolute; z-index: -1; }',
};

const getSiteOverride = (url: string, defs: Record<string, string> = siteOverrides) => {
	Logger.logInfo('siteOverrides check url:', url);
	return Object.entries(defs)
		.filter(([domain]) => RegExp(domain, 'i').test(url))
		.map(([, style]) => style)
		.join('');
};

const getPassiveOverride = (url: string) => getSiteOverride(url, sitePassiveOverrides);

export default {
	getSiteOverride,
	getPassiveOverride,
};
