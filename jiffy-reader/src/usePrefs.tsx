import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage';

import Logger from '../../src/Logger';
import { defaultPrefs } from '../../src/Preferences';

const usePrefs = (getOrigin: () => Promise<string>) => {
	const [privateOrigin, setPrivateOrigin] = useState(null);

	const initializePrefs = (initialPrefs) => {
		const finalInitialPrefs =
			!initialPrefs || !initialPrefs?.global ? { global: defaultPrefs, local: [] } : initialPrefs;
		Logger.logInfo('initializePrefs', { privateOrigin, initialPrefs, finalInitialPrefs });

		return finalInitialPrefs;
	};

	const [prefs, setPrefs] = useStorage<PrefStore>({ key: 'prefs', area: 'local' }, initializePrefs);

	const setPrefsExternal = async (
		getOrigin: () => Promise<string>,
		scope: string,
		newPrefs: Prefs,
		deleteOldLocal: boolean = true
	) => {
		if (!['global', 'local'].includes(scope)) throw Error(`Error: invalid scope value: ${scope}`);

		let result = { ...prefs };

		if (/global/i.test(scope)) {
			result[scope] = newPrefs;

			if (result['local']?.[await getOrigin()] && deleteOldLocal) {
				delete result['local'][await getOrigin()];
			}
		}

		if (/local/i.test(scope)) {
			result[scope][await getOrigin] = newPrefs;
		}

		return setPrefs(result);
	};

	useEffect(() => {
		(async () => {
			Logger.logInfo('watching orign', getOrigin, !getOrigin);
			if (!getOrigin) {
				Logger.logError('Error: getOrigin invalid', getOrigin);
			}

			const newOrigin = await getOrigin();
			// .then((newOrigin) => {
			// });
			Logger.logInfo({ newOrigin });
			setPrivateOrigin(newOrigin);
		})();
	}, []);

	return [prefs?.['local']?.[privateOrigin] ?? prefs?.['global'], setPrefsExternal];
};

export default usePrefs;
