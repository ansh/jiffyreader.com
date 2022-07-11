import { useEffect } from 'react';

import { useStorage } from '@plasmohq/storage';

import usePrefs from '~usePrefs';
import useTabSession from '~useTabSession';

import documentParser from '../../../src/ContentScript/documentParser';
import Logger from '../../../src/Logger';
import TabHelper from '../../../src/TabHelper';

const init = () => {
	Logger.logInfo('content working');
};

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

window.addEventListener('load', () => {
	Logger.logInfo('content script loaded');
});

// Idea for an UI API, for popup, notification badge, or mounting UI
// Idea for static mount
// Idea for styling injection support (inline or with custom emotion cache)

const setAttribute = (attribute, value, doc = document) => document.body.setAttribute(attribute, value);
const getAttribute = (attribute, doc = document) => document.body.getAttribute(attribute);
const setProperty = (property, value, doc = document) => document.body.style.setProperty(property, value);
const getProperty = (property, doc = document) => document.body.style.getPropertyValue(property);

const setSaccadesStyle = (style) => {
	Logger.logInfo('saccades-style', style);

	if (/bold/i.test(style)) {
		const [, value] = style.split('-');
		setProperty('--br-boldness', value);
		setProperty('--br-line-style', '');
	}

	if (/line$/i.test(style)) {
		const [value] = style.split('-');
		setProperty('--br-line-style', value);
		setProperty('--br-boldness', '');
	}
};

export const getRootContainer = () => {
	let child = document.createElement('div');
	child.setAttribute('br-mount-point', '');

	document.querySelector('body').appendChild(child);
	return document.querySelector('[br-mount-point]');
};

const PlasmoOverlay = () => {
	const [openCount] = useStorage({ key: 'open-count', area: 'managed' }, async (openCount) =>
		openCount === undefined ? 1 : openCount + 1
	);
	const [prefs] = usePrefs(async () => origin);

	const [tabSession, setTabSession, removeTabSession] = useTabSession(
		async () => origin,
		async () => await TabHelper.getActiveTab(),
		prefs
	);
	const [checked] = useStorage<boolean>('checked');
	const [serialNumber] = useStorage<string>('serial-number');

	const onChromeRuntimeMessage = (message /**sender, sendResponse*/) =>
		new Promise((sendResponse, rej) => {
			switch (message.type) {
				case 'getOrigin': {
					Logger.logInfo('reply to origin request');
					sendResponse({ data: window.location.origin });
					break;
				}
				case 'toggleReadingMode': {
					(async () => {
						const tab = await TabHelper.getActiveTab();
						Logger.logInfo('toggleReadingMode.called');
						setTabSession((oldTabSessions: PrefRecords) => {
							let newTabSessions = { ...oldTabSessions };
							newTabSessions[tab.id].brMode = !newTabSessions[tab.id].brMode;
							return newTabSessions;
						});
					})();
					return true;
					break;
				}

				default:
					break;
			}
		});

	useEffect(() => {
		if (!prefs || !tabSession) return;
		Logger.logInfo('content.tsx.useEffect', { prefs, tabSession });

		runTimeHandler.runtime.sendMessage({ message: 'setIconBadgeText', data: tabSession.brMode, tabID: tabSession.tabID }, () =>
			Logger.LogLastError()
		);

		documentParser.setReadingMode(tabSession.brMode, document);
		setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%'), document;
		setProperty('--br-line-height', prefs.lineHeight);
		setSaccadesStyle(prefs.saccadesStyle);
		setAttribute('saccades-color', prefs.saccadesColor, document);
		setAttribute('fixation-strength', prefs.fixationStrength);
		setAttribute('saccades-interval', prefs.saccadesInterval, document);

		
	}, [prefs, tabSession]);

	useEffect(() => {
		Logger.logInfo('register chrome|browser messageListener');
		runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);

		return () => {
			alert('closing context');
			removeTabSession(async () => TabHelper.getActiveTab());
		};
	}, []);

	return (
		<span style={{ padding: 12, position: 'fixed', top: '40px', left: '20px', zIndex: '20' }}>
			{!prefs || !tabSession ? (
				<div className="flex flex-column">Loading</div>
			) : (
				<>
					<h1>HELLO WORLD ROOT CONTAINER</h1>
					<input type={'checkbox'} readOnly checked={checked} />
					<p>
						Open: {JSON.stringify(openCount)} {JSON.stringify(prefs)} {JSON.stringify(tabSession)}
						<i>#{serialNumber}</i>
					</p>
					<p>TabSession {JSON.stringify(tabSession)}</p>
				</>
			)}
		</span>
	);
};

export default PlasmoOverlay;
