import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage';

import Logger from '../../src/Logger';

function useTabSession(
	getOrigin: () => Promise<string>,
	getTab: () => Promise<chrome.tabs.Tab>,
	prefs: Prefs,
	context: string = null
): [TabSession, (UpdateCallback) => Promise<void>, removeTabSession] {
	const [tabSessions, setTabSessionsPrivate] = useStorage<Record<string, TabSession>>(
		{ key: 'tabSession', area: 'local' },
		(prevSession) => prevSession ?? {}
	);

	const [tabId, setTabId] = useState(null);

	const removeTabSession = async (getTab: () => Promise<chrome.tabs.Tab>) => {
		let tempTabSessions = { ...tabSessions };
		delete tempTabSessions[await (await getTab()).id];
		setTabSessionsPrivate(tempTabSessions);
	};

	useEffect(() => {
		Logger.logInfo('initializing useTabSession', { tabSessions });

		(async () => {
			const newTabID = (await getTab()).id;
			if (!prefs || !newTabID) return;

			setTabId(newTabID);

			let newTabSessions = tabSessions;
			newTabSessions[newTabID] = /content.tsx/i.test(context)
				? {
						brMode: prefs.onPageLoad,
						origin: await getOrigin(),
						tabID: newTabID
				  }
				: newTabSessions[newTabID];
			setTabSessionsPrivate(newTabSessions);

			Logger.logInfo('useTabsession.effect', await getOrigin(), { prefs, tabSessions, newTabID });
		})();
	}, [prefs]);

	const updateTabSession = (updateCallback: UpdateCallback) => {
		const newTabSessions = updateCallback(tabSessions);
		return setTabSessionsPrivate(newTabSessions);
	};

	return [prefs && tabId ? tabSessions[tabId] : null, updateTabSession, removeTabSession];
}

export default useTabSession;
