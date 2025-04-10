import { useStorage } from '@plasmohq/storage';
import contentStyle from 'data-text:./../styles/contentStyle.scss';
import type { TabSession } from 'index';
import type { PlasmoContentScript } from 'plasmo';
import { useEffect, useState } from 'react';

import documentParser from '~services/documentParser';
import { envService } from '~services/envService';
import Logger from '~services/Logger';
import overrides from '~services/siteOverrides';
import usePrefs from '~services/usePrefs';

export const config: PlasmoContentScript = {
	matches: ['<all_urls>'],
	all_frames: true,
	run_at: 'document_end',
};

export const getRootContainer = () => {
	const rootContainer = document.createElement('div');
	document.querySelector('html').appendChild(rootContainer);
	['position:absolute', 'bottom:0px', 'left:0px', 'height:0px', 'z-index:5'].map((style) => style.split(':')).forEach(([key, val]) => (rootContainer.style[key] = val));
	return createShadowRoot(rootContainer);
};

export const createShadowRoot = (shadowHost) => {
	return shadowHost.attachShadow({ mode: 'open' });
};

const { setAttribute, setProperty, setSaccadesStyle, getAttribute, amendClasses, removeProperty } = documentParser.makeHandlers(document);

const contentLogStyle = 'background-color: pink';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const OVERLAY_STYLE = {
	position: 'fixed' as 'fixed',
	bottom: '40px',
	left: '40px',
	display: 'flex',
	background: '#3c2020',
	padding: '15px',
	flexDirection: 'column' as 'row',
	text: 'light',
};

const injectPassiveStyleOverides = (document: Document) => {
	try {
		setTimeout(() => {
			//inject passiveOverride styles
			const overrideStyle = overrides.getPassiveOverride(window.location.href);
			let style = document.querySelector('style');
			if (!style) {
				style = document.createElement('style');
				document.body.append(style);
			}

			style.textContent += ' ' + overrideStyle;
			Logger.logInfo('div:has( + body ) ammended');
		}, 500);
	} catch (error) {
		Logger.logError(error);
	}
};

window.addEventListener('load', () => {
	Logger.logInfo('content script loaded');

	// injectPassiveStyleOverides(document);
});

const isTopmostWindowContext = () => window.self === window.top;

const IndexContent = () => {
	const [prefs] = usePrefs(async () => window.location.origin, false);

	const [tabSession, setTabSession] = useState<TabSession | null>(null);

	const [isExpanded, setExpanded] = useStorage({ area: 'local', key: 'show_debug_overlay' }, async (previous) => (typeof previous !== 'boolean' ? false : previous));

	const chromeRuntimeMessageHandler = (message, sender, _sendResponse) => {
		const sendResponse = (response) => {
			if (isTopmostWindowContext()) {
				_sendResponse(response);
			}
		};
		Logger.logInfo('%cchromeRuntimMessageHandler.fired', contentLogStyle);
		switch (message.type) {
			case 'getOrigin': {
				Logger.logInfo('reply to origin request');
				sendResponse({ data: window.location.origin });
				break;
			}
			case 'setReadingMode': {
				setTabSession((prevTabSession) => {
					const newTabSession = { brMode: message?.data ?? !prevTabSession.brMode };
					sendResponse({ data: newTabSession });
					Logger.logInfo('%ctabsession', contentLogStyle, { prevTabSession, newTabSession });
					return newTabSession;
				});
				break;
			}
			case 'getReadingMode': {
				sendResponse({ data: getAttribute('br-mode') == 'on' });
				break;
			}
			default:
				break;
		}
		return true;
	};

	useEffect(() => {
		Logger.logInfo(
			'%cTabSession same: %s   prefs same:%s',
			contentLogStyle,
			document.body.dataset.tabsession === JSON.stringify(tabSession),
			document.body.dataset.prefs === JSON.stringify(prefs),
		);

		if (prefs && !tabSession) {
			const hasLatex = prefs.onPageLoad && documentParser.hasLatex(document.body.textContent);
			const delay = hasLatex ? prefs.autoOnDelay : 0;
			Logger.logInfo({ hasLatex, delay });
			setTimeout(() => {
				setTabSession((prevTabSession) => {
					const newValue = prevTabSession || { brMode: prefs.onPageLoad };
					Logger.logInfo('%cInitializeTabsession', contentLogStyle, { prevTabSession, newValue });
					return newValue;
				});
			}, delay);
		}

		if (!prefs || !tabSession) return;

		Logger.logInfo('content.tsx.useEffect', { prefs, tabSession });

		runTimeHandler.runtime.sendMessage(
			{
				message: 'setIconBadgeText',
				data: tabSession.brMode,
				tabID: tabSession.tabID,
			},
			() => Logger.LogLastError(),
		);

		documentParser.setReadingMode(tabSession.brMode, document, contentStyle);
		setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%');
		setProperty('--br-line-height', prefs.lineHeight);
		setSaccadesStyle(prefs.saccadesStyle);
		setAttribute('saccades-color', prefs.saccadesColor);
		setAttribute('fixation-strength', prefs.fixationStrength);
		setAttribute('saccades-interval', prefs.saccadesInterval);

		// Set color overrides
		if (prefs.saccadesColor === 'custom') {
			prefs.saccadesColorOverides.forEach((color, index) => {
				setProperty(`--saccadesColorOveride-${index + 1}`, color);
			});
		} else {
			// Reset to default or remove the properties
			Array(prefs.MAX_FIXATION_PARTS).forEach((index) => {
				removeProperty(`--saccadesColorOveride-${index + 1}`);
			});
		}

		const getPrefsClasses = (addedOrRemoved: boolean) =>
			Object.entries(prefs.symanticTags)
				.filter(([, value]) => value === addedOrRemoved)
				.map(([element]) => `br-exclusions-${element}`);

		amendClasses('add', getPrefsClasses(false));
		amendClasses('remove', getPrefsClasses(true));
	}, [prefs, tabSession]);

	useEffect(() => {
		Logger.logInfo('%cregister chrome|browser messageListener', contentLogStyle, { tabSession });
		runTimeHandler.runtime.onMessage.addListener(chromeRuntimeMessageHandler);
	}, []);

	const toggleExpandeHandler = () => setExpanded(!isExpanded);

	const getCollapseExpandBtn = () => <button onClick={toggleExpandeHandler}> {isExpanded ? 'Collapse' : 'Expand'}</button>;

	const showDebugOverLay = () => {
		if (envService.isProduction) return;

		return (
			<div className="[ br-overlay ]" style={OVERLAY_STYLE}>
				<span>
					<strong style={{ paddingRight: '15px' }}>Target {envService.PLASMO_PUBLIC_TARGET}</strong>
					{getCollapseExpandBtn()}
				</span>
				<div className="flex flex-column">
					<span>{!prefs || !tabSession ? 'Loading... or broken but probably loading' : 'JiffyReady to the moon'}</span>
				</div>
				<span>{isExpanded && <pre>{JSON.stringify({ tabSession, prefs }, null, 2)}</pre>}</span>
				{getCollapseExpandBtn()}
			</div>
		);
	};

	return !!prefs?.showContentDebugOverlay && showDebugOverLay();
};

export default IndexContent;
