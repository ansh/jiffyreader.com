import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage';

import Logger from './features/Logger';
import { defaultPrefs } from '../../src/Preferences';

const PREF_STORE_AREA = 'sync'
const PREF_STORE_SCOPES = ['global', 'local', 'reset']

const usePrefs = (getOrigin: () => Promise<string>): [Prefs, SetPrefsExternal] => {
	const [privateOrigin, setPrivateOrigin] = useState(null);

	const getActivePrefs = (originStr = privateOrigin, _prefStore = prefStore) => {
		if (!originStr || !_prefStore) return;

		return prefStore?.['local']?.[originStr] || prefStore['global'];
	};
	const initializePrefs = async (initialPrefs: PrefStore | undefined)=> {
		const finalInitialPrefs = initialPrefs ?? { global: defaultPrefs, local: {} };

		Logger.logInfo('initializePrefs', { privateOrigin, initialPrefs, finalInitialPrefs });

		return finalInitialPrefs ;
	};

	const [prefStore, setPrefStore] = useStorage({ key: 'prefStore', area: PREF_STORE_AREA }, initializePrefs as any as PrefStore );

	const setPrefsExternal = async (
		getOrigin: () => Promise<string>,
		scope: string,
		newPrefs: Prefs,
		deleteOldLocal: boolean = true
	) => {
		if (!PREF_STORE_SCOPES.includes(scope)) throw Error(`Error: invalid scope value: ${scope}`);

		let result = { ...prefStore };

		if (/global|reset/i.test(scope)) {
			if (/reset/i.test(scope) || (result['local']?.[await getOrigin()] && deleteOldLocal)) {
				delete result['local'][await getOrigin()];
				result['global'] = /reset/i.test(scope) ? defaultPrefs : result['global'];
			} else {
				result[scope] = newPrefs;
			}
		}

		if (/local/i.test(scope)) {
			result[scope][await getOrigin()] = newPrefs;
		}

		return setPrefStore(result);
	};

	useEffect(() => {
		(async () => {
			Logger.logInfo('watching orign', getOrigin, !getOrigin);
			if (!getOrigin) {
				// Logger.logError('Error: getOrigin invalid', getOrigin);
				return;
			}

			const newOrigin = await getOrigin();

			Logger.logInfo('usePrefs.useEffect', { newOrigin });
			setPrivateOrigin(newOrigin);
		})();
	}, []);

	const outPrefs = getActivePrefs();
	Logger.logInfo('%cusePrefs.return', 'background-color:lime');
	Logger.LogTable({ privateOrigin, outPrefs, prefStore });
	return [outPrefs, setPrefsExternal];
};

export default usePrefs;
