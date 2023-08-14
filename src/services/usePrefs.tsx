import { Storage, useStorage } from '@plasmohq/storage';
import type { PrefStore } from 'index';
import { useEffect, useState } from 'react';

import Logger from './Logger';
import defaultPrefs from './preferences';

const PREF_STORE_SCOPES = ['global', 'local', 'reset'];
const PREF_LOG_STYLE = 'color: green; background: black;';

const usePrefs = (
	getOrigin: () => Promise<string>,
	initialize = false,
	target = process.env.TARGET ?? 'chrome',
): [Prefs, SetPrefsExternal] => {
	const [privateOrigin, setPrivateOrigin] = useState(null);

	const area = ((target as string).includes('firefox') && 'local') || 'sync';

	Logger.logInfo('%ctarget: %s , area: %s', PREF_LOG_STYLE, target, area);

	const getActivePrefs = (originStr = privateOrigin, _prefStore = prefStore) => {
		if (!originStr || !_prefStore) return;

		return prefStore?.['local']?.[originStr] || prefStore['global'];
	};

	const initializePrefs = async (initialPrefs: PrefStore | undefined) => {
		initialize && Logger.logInfo('%cinitializePrefs from popup', PREF_LOG_STYLE);
		if (initialize && !initialPrefs) {
			return { global: defaultPrefs, local: {} };
		}

		const finalInitialPrefs = initialPrefs;

		Logger.logInfo('%cinitializePrefs', PREF_LOG_STYLE, {
			privateOrigin,
			initialPrefs,
			finalInitialPrefs,
		});

		return finalInitialPrefs;
	};

	const [prefStore, setPrefStore] = useStorage({ key: 'prefStore', area }, initializePrefs as any as PrefStore);

	const setPrefsExternal = async (getOrigin: () => Promise<string>, scope: string, newPrefs: Prefs, deleteOldLocal: boolean = true) => {
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

			new Storage({ area }).watch({
				prefStore: (value) => {
					Logger.logInfo('%sstorage watch', PREF_LOG_STYLE, { prefStore: value });
				},
			});
		})();
	}, [getOrigin]);

	const outPrefs = getActivePrefs();
	Logger.logInfo('%cusePrefs.return', 'background-color:lime');
	Logger.LogTable({ privateOrigin, outPrefs, prefStore, area });
	return [outPrefs, setPrefsExternal];
};

export default usePrefs;
