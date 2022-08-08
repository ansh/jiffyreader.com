export const USER_PREF_STORE_KEY = 'prefStore';
export const APP_PREFS_STORE_KEY = 'appStore';
export const STORAGE_AREA =
  ((process.env.TARGET as string).includes('firefox') && 'local') || 'sync';

export const COLOR_MODE_STATE_TRANSITIONS = [
  [null, 'light'],
  [undefined, 'light'],
  ['light', 'dark'],
  ['dark', 'light'],
];

export const SACCADE_STYLES = [
  'Bold-400',
  'Bold-500',
  'Bold-600',
  'Bold-700',
  'Bold-800',
  'Bold-900',
  'Solid-line',
  'Dashed-line',
  'Dotted-line',
];

export const SACCADE_COLORS = [
  ['Original', ''],
  ['Light', 'light'],
  ['Light-100', 'light-100'],
  ['Dark', 'dark'],
  ['Dark-100', 'dark-100'],
] as [Label: string, value: string][];

export enum DisplayColorMode {
    'LIGHT' = 'light',
    'DARK' = 'dark',
  }