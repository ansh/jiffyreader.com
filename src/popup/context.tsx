import { Storage } from '@plasmohq/storage';
import { createContext, useContext, useEffect, useReducer } from 'react';

let storage = {
	key: 'context.store',
	api: new Storage({ area: 'local' }),
	get value() {
		return this.api.get(this.key) as typeof rawValues;
	},
	set value(newStore) {
		this.api.set(this.key, newStore);
	},
};

const rawValues = {
	isDebugDataVisible: !/production/i.test(process.env.NODE_ENV),
};

const initialPopupContextValue = {
	...rawValues,
	dispatch: function <Tkey extends keyof typeof rawValues>([action, value]: [Tkey, typeof rawValues[Tkey]]) {
		return;
	},
};

function reducer<Tkey extends keyof typeof rawValues>(state, [action, data]: [Tkey, typeof rawValues[Tkey]]): typeof rawValues {
	let result = state;
	switch (action) {
		case 'isDebugDataVisible': {
			result = { ...state, [action]: data };
			break;
		}
	}

	storage.value = result;
	return result;
}

const PopupContext = createContext(initialPopupContextValue);

export default function PopupContextProvider({ children }) {
	const [store, dispatch] = useReducer(reducer, initialPopupContextValue);

	const loadFromStorage = () => {
		(async () => {
			const savedStore: typeof rawValues = await storage.value;

			if (!savedStore) {
				return;
			}

			for (const [key, val] of Object.entries(savedStore)) {
				dispatch([key as keyof typeof store, val]);
			}
		})();
	};

	useEffect(loadFromStorage, []);

	return <PopupContext.Provider value={{ ...store, dispatch }}>{children}</PopupContext.Provider>;
}

export function usePopupContext() {
	const { dispatch, ...store } = useContext(PopupContext);

	return { store, dispatch };
}
