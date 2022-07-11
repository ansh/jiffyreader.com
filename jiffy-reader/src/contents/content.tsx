import { useEffect } from 'react';

import { useStorage } from '@plasmohq/storage';

import usePrefs from '~usePrefs';
import useTabSession from '~useTabSession';

import Logger from '../../../src/Logger';
import TabHelper from '../../../src/TabHelper';

const init = () => {
	Logger.logInfo('content working');
};

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const onChromeRuntimeMessage = (message /**sender, sendResponse*/) =>
	new Promise((sendResponse, rej) => {
		switch (message.type) {
			case 'getOrigin': {
				Logger.logInfo('reply to origin request');
				sendResponse({ data: window.location.origin });
				break;
			}

			default:
				break;
		}
	});

function docReady(fn) {
	// see if DOM is already available
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

docReady(async () => {
	
});

window.addEventListener('load', () => {
	Logger.logInfo('content script loaded');
	runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);

});

// Idea for an UI API, for popup, notification badge, or mounting UI
// Idea for static mount
// Idea for styling injection support (inline or with custom emotion cache)

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

	useEffect(() => {
		if (!prefs || !tabSession) return;
		Logger.logInfo('content.tsx.useEffect', { prefs, tabSession });

		runTimeHandler.runtime.sendMessage({ message: 'setIconBadgeText', data: tabSession.brMode,tabID: tabSession.tabID }, () => Logger.LogLastError());
	}, [prefs, tabSession]);

	useEffect(() => {
		Logger.logInfo(
			'register chrome|browser messageListener',
			runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage)
		);

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
