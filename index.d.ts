interface Prefs {
	onPageLoad: boolean;
	scope: string; //"global" | "local"
	lineHeight: number;
	edgeOpacity: number;
	saccadesColor: string;
	saccadesStyle: string;
	saccadesInterval: number;
	fixationStrength: number;
	fixationEdgeOpacity: number;
	MAX_FIXATION_PARTS: number;
	FIXATION_LOWER_BOUND: number;
	BR_WORD_STEM_PERCENTAGE: number;
}

type PrefRecords = Record<string, Pref>;

interface PrefStore {
	global: Prefs;
	local: PrefRecords;
}

interface TabSession {
	brMode: boolean;
	origin?: string;
	tabID?;
}

type TabSessionStore = Record<string, TabSession>;

type UpdateCallback = (tabSessions: PrefRecords) => PrefRecords;

type SetPrefsExternal = (
	getOrigin: () => Promise<string>,
	scope: string,
	newPrefs: Prefs,
	deleteOldLocal?: boolean
) => Promise<void>;

type removeTabSession = (getTab: () => Promise<chrome.tabs.Tab>) => Promise<void>;

declare namespace NodeJS {
	interface ProcessEnv {
		DEBUG: string
		TARGET: string
		SHORTCUT: string
		VERSION: string
		NAME: string
	}
}

declare module '*.scss';