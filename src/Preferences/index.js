import StorageHelper from '../StorageHelper';
// default preferences
// and source of truth
// for both global and local prefs
// so new preferences should be
// added here

export const defaultPrefs = {
  saccadesInterval: 0,
  lineHeight: 1,
  fixationStrength: 2,
  scope: 'global',
  // onPageLoad apply prefs on page load
  onPageLoad: false,
  saccadesColor: '',
  fixationStemOpacity: 0,
  edgeOpacity: 70,
  saccadesStyle: 'bold',
};

/**
 * called on startup or when prefs change
 * Populated via init config.
 * @type {subscriptionCallback[]}  -
 */
const subscriberCallbacks = [];

/**
 * subscriptions to call on prefs init
 * @type {startupCallback[]} -
 */
const startupSubscribers = [];

/**
 * getOrigin is a call back
 * that should return the origin of the page.
 * Depending on the context, whether it be
 * popup or content script, they might not
 * have direct access to origin, so let them define
 * how origin should be retreived
 * Populated via init config.
 * @type {()=>Promise<string>} -
 */
let getOrigin;

/**
 * init is the entry point of the preference
 * which returns the following:
 * - start() to kickstart preference
 *    retrieval and dispatch that preference
 *    for subscribers to know
 * /
 * - setPrefs() to update preferences
 *    and dispatch the updates for all
 *    subscribers
 * /
 * - defaultPrefs() - is a getter that
 *    returns the defaultPreferences
 * @param {{
 * subscribe?: subscriptionCallback ,
 * onStartup?: startupCallback ,
 * getOrigin: {()=>Promise<string>}
 * }} config
 * @callback subscriptionCallback - called when prefs change
 * @param {Prefs} prefs
 * @callback startupCallback fired on when init is called
 * @param {Prefs} prefs
 * @typedef {defaultPrefs} Prefs
 */
function init(config) {
  // currently only init can add to
  // subscribers but it be easy
  // to expose another api to add
  // to subscriber if needed
  if (config.subscribe) {
    subscriberCallbacks.push(config.subscribe);
  }
  if (config.onStartup) {
    startupSubscribers.push(config.onStartup);
  }
  // necessary to get the origin
  // which is used to 'local' AKA per-site prefs
  getOrigin = config.getOrigin;

  return {
    start,
    setPrefs,
    getPrefs,
    defaultPrefs: () => defaultPrefs,
  };
}

const isBackgroundScript = () => {
  if (typeof chrome?.extension?.getBackgroundPage === 'function') {
    // https://stackoverflow.com/questions/16267668/can-js-code-in-chrome-extension-detect-that-its-executed-as-content-script
    // detect where code is running from, is it content script, popup or background?
    // thats important to know if all 3 context call the same functions, that shared function has
    // to know the context so it can work properly based on the context

    // we know we are on background script if getBackgroundPage === window
    return chrome.extension.getBackgroundPage() === window;
  }
  return false;
};

/** @returns {Promise<Prefs[]>|Promise<Prefs>} */
async function retrievePrefsFromStorage(/** @type {string} 'local'|'global' */ action) {
  return new Promise((resolve, reject) => {
    if (isBackgroundScript()) {
      const response = StorageHelper.retrievePrefs(action);
      resolve(response?.data);
    } else {
      chrome.runtime.sendMessage({ message: 'retrievePrefs', action }, async (response) => {
        resolve(response?.data);
      });
    }
  });
}

function storePrefsInStorage(
  /** @type {Prefs} */ prefs,
  /** @type {string} 'global'|'local' */ action,
) {
  return new Promise((resolve, reject) => {
    if (isBackgroundScript()) {
      StorageHelper.storePrefs(action, prefs);
      resolve(true);
    } else {
      chrome.runtime.sendMessage({ message: 'storePrefs', data: prefs, action }, async (_) => {
        resolve(true);
      });
    }
  });
}

/** @returns {Promise<Prefs[]>} */
async function retrieveLocalPrefs() {
  return retrievePrefsFromStorage('local');
}

/** @return {Promise<Prefs[]>} */
async function retriveGlobalPrefs() {
  return retrievePrefsFromStorage('global');
}

// Stores local preferences into storage
async function storeLocalPrefs(prefs) {
  return storePrefsInStorage(prefs, 'local');
}

async function storeGlobalPrefs(prefs) {
  return storePrefsInStorage(prefs, 'global');
}

// get the current Preferences based on the current
// scope so if the user current setting is global
// it will return the global prefs, otherwise
// return local scope to this origin
/** @returns {Promise<Prefs>} */
async function getPrefs() {
  // grab the current prefs
  // let localPrefs = await retrieveLocalPrefs();
  // let globalPrefs = await retriveGlobalPrefs();
  // const origin = await getOrigin();

  // if (localPrefs == null) {
  //   localPrefs = {};
  // }

  // // just in case their missing a default prefs
  // // be sure to pepper the default prefs
  // localPrefs[origin] = { ...defaultPrefs, ...localPrefs[origin] };
  // globalPrefs = { ...defaultPrefs, ...globalPrefs };

  // const currentScope = localPrefs[origin].scope;

  // return currentScope === 'local' ? localPrefs[origin] : globalPrefs;

  return { ...((await retrieveLocalPrefs())[await getOrigin()] ?? (await retriveGlobalPrefs())) };
}

/**
 * setPrefs updates the preferences in storage
 * and dispatch this update to all subscribers
 * prefs - has the shape of defaultPrefs
 * or a call back that returns that shape
 * but you only need to pass the actual fields
 * you want to update.
 *
 */
async function setPrefs(/** @type {(prefs:Prefs)=>{}|Prefs} */ prefs) {
  // grab the current prefs
  const localPrefs = await retrieveLocalPrefs();
  let globalPrefs = await retriveGlobalPrefs();
  const origin = await getOrigin();

  // if local
  const currentPrefs = {
    ...(localPrefs[origin]?.scope === 'local' ? localPrefs[origin] : globalPrefs),
  };

  // if prefs is a function, pass in the current
  // prefs based on the scope
  // and newPrefs will be the return val of the function
  // otherwise the newPrefs will just be the prefs

  const newPrefs = {
    ...currentPrefs,
    ...(typeof prefs === 'function' ? prefs(currentPrefs) : prefs),
  };

  if (newPrefs.scope === 'global') {
    // write scope to global prefs
    globalPrefs = {
      ...globalPrefs,
      // write globalPrefs only if localPrefs[origin] has been removed prior
      ...(!localPrefs[origin] ? newPrefs : null),
      scope: newPrefs.scope,
    };

    if (localPrefs[origin]) delete localPrefs[origin];
  } else {
    localPrefs[origin] = { ...localPrefs[origin], ...newPrefs };
  }

  dispatchPrefsUpdate(localPrefs[origin] ?? globalPrefs);

  storeLocalPrefs(localPrefs);
  storeGlobalPrefs(globalPrefs);
}

/**
 * start - kickstarts the retrieval of the current preference
 * and dispatch that prefs to subscribers
 * for example usage, see Preference.init on
 * Popup/index.js and ContentScript/index.js
 */
async function start() {
  let localPrefs = await retrieveLocalPrefs();
  let globalPrefs = await retriveGlobalPrefs();
  const origin = await getOrigin();

  if (localPrefs == null) {
    localPrefs = {};
  }

  // just in case their missing a default prefs
  // be sure to pepper the default prefs
  localPrefs[origin] = { ...defaultPrefs, ...localPrefs[origin] };
  globalPrefs = { ...defaultPrefs, ...globalPrefs };

  storeLocalPrefs(localPrefs);
  storeGlobalPrefs(globalPrefs);

  if (localPrefs[origin]?.scope === 'local') {
    dispatchPrefsUpdate(localPrefs[origin]);
    dispatchPrefsUpdate(localPrefs[origin], startupSubscribers);
  } else {
    dispatchPrefsUpdate(globalPrefs);
    dispatchPrefsUpdate(globalPrefs, startupSubscribers);
  }
}

/**
 * calls all subscriber call back
 * and pass them the preference via prefs
 * params
 */
function dispatchPrefsUpdate(/** @type Prefs */ prefs, /** @type {Function[]} */ cbs) {
  if (Array.isArray(cbs)) {
    cbs.forEach((cb) => {
      cb(prefs);
    });
  } else {
    subscriberCallbacks.forEach((cb) => {
      cb(prefs);
    });
  }
}

export default {
  init,
};
