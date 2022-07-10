import { useStorage } from '@plasmohq/storage';
import { useEffect, useState } from 'react';

import Logger from '../../src/Logger';

function useTabSession(getOrigin: () => Promise<string>, prefs: Prefs) {
	const [tabSession, setTabSession] = useStorage({key:'tabSession', area: "session",},(prevSession)=> prevSession);

	useEffect(() => {
		(async () => {
			if (!prefs || !origin) return;

			setTabSession({ brMode: prefs?.onPageLoad, origin: await getOrigin() });
			Logger.logInfo('useTabsession', await getOrigin(), { prefs });
		})();
	}, []);

	useEffect(() => {
		if (!tabSession) return;
		Logger.logInfo('new tabSession', tabSession);
	}, [tabSession]);

	return [tabSession, setTabSession];
}

export default useTabSession;
