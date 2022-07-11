import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage';

import Logger from '../../src/Logger';
import { defaultPrefs } from '../../src/Preferences';

const usePrefs = (getOrigin: () => Promise<string>): [Prefs, SetPrefsExternal] => {
	const [privateOrigin, setPrivateOrigin] = useState(null);

	const initializePrefs = (initialPrefs: PrefStore | undefined) => {
		const finalInitialPrefs = !initialPrefs || !initialPrefs?.global ? { global: defaultPrefs, local: {} } : initialPrefs;

		Logger.logInfo('initializePrefs', { privateOrigin, initialPrefs, finalInitialPrefs });

		return finalInitialPrefs;
	};

	const [prefStore, setPrefStore] = useStorage<PrefStore>({ key: 'prefStore', area: 'local' }, initializePrefs);

	const setPrefsExternal = async (
		getOrigin: () => Promise<string>,
		scope: string,
		newPrefs: Prefs,
		deleteOldLocal: boolean = true
	) => {
		if (!['global', 'local', 'reset'].includes(scope)) throw Error(`Error: invalid scope value: ${scope}`);

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

	useEffect(() => {
		Logger.logInfo('usePrefs.effect', { prefStore, privateOrigin });
	}, [prefStore, privateOrigin]);

	return [privateOrigin ? prefStore?.['local']?.[privateOrigin] ?? prefStore?.['global'] : null, setPrefsExternal];
};

export default usePrefs;
