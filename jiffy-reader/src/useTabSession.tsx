import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage';

import Logger from '../../src/Logger';

function useTabSession(
	getOrigin: () => Promise<string>,
	getTab: () => Promise<chrome.tabs.Tab>,
	prefs: Prefs
): [TabSession, (UpdateCallback) => Promise<void>] {
	const [tabSessions, setTabSessionsPrivate] = useStorage<TabSession[]>(
		{ key: 'tabSession', area: 'local' },
		(prevSession) => prevSession ?? []
	);

	const [tabId, setTabId] = useState(null);

	const removeTab = (tabId) => setTabSessionsPrivate(tabSessions.filter((_, instanceId) => instanceId !== tabId));

	useEffect(() => {
		Logger.logInfo('initializing useTabSession');

		(async () => {
			if (!prefs) return;

			const newTabID = (await getTab()).id;
			setTabId(newTabID);

			let newTabSessions = tabSessions;
			newTabSessions[newTabID] = newTabSessions[newTabID] ?? { brMode: prefs?.onPageLoad, origin: await getOrigin() };
			setTabSessionsPrivate(newTabSessions);

			Logger.logInfo('useTabsession.effect', await getOrigin(), { prefs, tabSessions, newTabID });
		})();
	}, [prefs]);

	const updateTabSession = (updateCallback: UpdateCallback) => {
		const newTabSessions = updateCallback(tabSessions);
		return setTabSessionsPrivate(newTabSessions);
	};

	return [prefs && tabId ? tabSessions[tabId] : null, updateTabSession];
}

export default useTabSession;
