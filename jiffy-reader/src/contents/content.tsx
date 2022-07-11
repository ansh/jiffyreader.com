import type { PlasmoContentScript } from 'plasmo';
import { useEffect } from 'react';

import { useStorage } from '@plasmohq/storage';

import usePrefs from '~usePrefs';
import useTabSession from '~useTabSession';

import documentParser from '../../../src/ContentScript/documentParser';
import Logger from '../../../src/Logger';
import Preferences from '../../../src/Preferences';
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
	runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);

	//   const { start, defaultPrefs } = Preferences.init({
	//     getOrigin: async () =>
	//       new Promise((resolve, _) => {
	//         resolve(window.location.origin)
	//       }),
	//     subscribe: (prefs) => {
	//       if (!prefs.onPageLoad) {
	//         return
	//       }
	//       setReadingMode(prefs.onPageLoad, document)
	//       setSaccadesIntervalInDOM(prefs.saccadesInterval)
	//       setFixationStrength(prefs.fixationStrength)
	//       setLineHeight(prefs.lineHeight)
	//       setSaccadesColor(prefs.saccadesColor)
	//       setSaccadesStyle(prefs.saccadesStyle)
	//       setFixationEdgeOpacity(
	//         prefs.fixationEdgeOpacity ?? defaultPrefs().fixationEdgeOpacity
	//       )
	//     },
	//     onStartup: (prefs) => {
	//       chrome.runtime.sendMessage(
	//         { message: "setIconBadgeText", data: prefs.onPageLoad },
	//         () => Logger.LogLastError()
	//       )
	//     }
	//   })

	//   start()
});

window.addEventListener('load', () => {
	console.log('content script loaded');

	init();
});

// Idea for an UI API, for popup, notification badge, or mounting UI
// Idea for static mount
// Idea for styling injection support (inline or with custom emotion cache)

let child = document.createElement('div');
child.setAttribute('br-mount-point', '');
// child.style.setProperty('position','fixed')
// child.style.setProperty('left','20px')
// child.style.setProperty('top','20px')
document.querySelector('body').appendChild(child);
export const getRootContainer = () => {
	return document.querySelector('[br-mount-point]');
};

// const origin = window.location.origin;

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
		if (!prefs || tabSession) return;
		Logger.logInfo('content.tsx.useEffect', { prefs, tabSession });

		runTimeHandler.runtime.sendMessage({ message: 'setIconBadgeText', data: prefs.onPageLoad }, () => Logger.LogLastError());
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
