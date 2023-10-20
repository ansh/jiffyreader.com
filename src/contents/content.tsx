import { useStorage } from '@plasmohq/storage';
import contentStyle from 'data-text:./../styles/contentStyle.scss';
import type { TabSession } from 'index';
import type { PlasmoContentScript } from 'plasmo';
import { useEffect, useState } from 'react';

import Logger from '~services/Logger';
import documentParser from '~services/documentParser';
import overrides from '~services/siteOverrides';
import usePrefs from '~services/usePrefs';

export const config: PlasmoContentScript = {
	matches: ['<all_urls>'],
	all_frames: true,
	run_at: 'document_end',
};

const { setAttribute, setProperty, setSaccadesStyle, getAttribute } = documentParser.makeHandlers(document);

const contentLogStyle = 'background-color: pink';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const OVERLAY_STYLE = {
	position: 'fixed' as 'fixed',
	bottom: '40px',
	left: '40px',
	display: 'flex',
	background: 'white',
	padding: '15px',
	flexDirection: 'column' as 'row',
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

	injectPassiveStyleOverides(document);
});

const isTopmostWindowContext = () => window.self === window.top;

const IndexContent = () => {
	const [prefs] = usePrefs(async () => window.location.origin, false);

	const [tabSession, setTabSession] = useState<TabSession | null>(null);

	const [isExpanded, setExpanded] = useStorage({ area: 'local', key: 'show_debug_overlay' }, async (previous) =>
		typeof previous !== 'boolean' ? false : previous,
	);

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
	}, [prefs, tabSession]);

	useEffect(() => {
		Logger.logInfo('%cregister chrome|browser messageListener', contentLogStyle, { tabSession });
		runTimeHandler.runtime.onMessage.addListener(chromeRuntimeMessageHandler);
	}, []);

	const toggleExpandeHandler = () => setExpanded(!isExpanded);

	const getCollapseExpandBtn = () => <button onClick={toggleExpandeHandler}> {isExpanded ? 'Collapse' : 'Expand'}</button>;

	const showDebugOverLay = (show) => {
		if (!show) return;

		return (
			<div className="[ br-overlay ]" style={OVERLAY_STYLE}>
				<span>
					<strong style={{ paddingRight: '15px' }}>Target {process.env.TARGET}</strong>
					{getCollapseExpandBtn()}
				</span>
				<div className="flex flex-column">
					<span>{!prefs || !tabSession ? 'Loading... or broken but probably loading' : 'JiffyReady to the moon'}</span>
				</div>
				<span>{JSON.stringify(tabSession)}</span>
				<span>
					{isExpanded &&
						prefs &&
						Object.entries(prefs).map(([key, val], index) => (
							<p className="prefsEntry" key={'prefs_item' + index}>
								<span className="prefsKey">{key}:: </span>
								<span className="prefsValue">{typeof val === 'boolean' ? (val === true ? 'true' : 'false') : val}</span>
							</p>
						))}
				</span>
				{getCollapseExpandBtn()}
			</div>
		);
	};

	return showDebugOverLay(process.env.NODE_ENV !== 'production');
};

export default IndexContent;
