// default preferences
// and source of truth
// for both global and local prefs
// so new preferences should be
// added here
const defaultPrefs = {
  enabled: false,
  saccadesInterval: 0,
  lineHeight: 1,
  fixationStrength: 1,
  scope: 'global',
  // onPageLoad apply prefs on page load
  onPageLoad: false,
};

// subscribers holds list of callbacks that will be
// called when preferences changes
// or on startup
// Populated via init config.
const subscribers = [];
// getOrigin is a call back
// that should return the origin of the page.
// Depending on the context, whether it be
// popup or content script, they might not
// have direct access to origin, so let them define
// how origin should be "get"
// Populated via init config.
let getOrigin;

// init is the entry point of the preference
// which returns the following:
// - start() to kickstart preference
//    retrieval and dispatch that preference
//    for subscribers to know
// /
// - setPrefs() to update preferences
//    and dispatch the updates for all
//    subscribers
// /
// - defaultPrefs() - is a getter that
//    returns the defaultPreferences
function init(config) {
  // currently only init can add to
  // subscribers but it be easy
  // to expose another api to add
  // to subscriber if needed
  subscribers.push(config.subscribe);
  // necessary to get the origin
  // which is used to 'local' AKA per-site prefs
  getOrigin = config.getOrigin;

  return {
    start,
    setPrefs,
    defaultPrefs: () => defaultPrefs,
  };
}

// Retrieves preferences from storage, specify if
// its 'global' or 'local' with the action parameter
async function retrievePrefs(action) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { message: 'retrievePrefs', action },
      async (response) => {
        resolve(response.data);
      },
    );
  });
}

// Stores preferences into storage, specify
// if its 'global' or 'local' with the action parameter
function storePrefs(prefs, action) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { message: 'storePrefs', data: prefs, action },
      async (_) => {
        resolve(true);
      },
    );
  });
}

// Retrieves local preferences from storage
async function retrieveLocalPrefs() {
  return retrievePrefs('local');
}

// Retrieves global preferences from storage
async function retriveGlobalPrefs() {
  return retrievePrefs('global');
}

// Stores local preferences into storage
async function storeLocalPrefs(prefs) {
  return storePrefs(prefs, 'local');
}

// Store global preferences into storage
async function storeGlobalPrefs(prefs) {
  return storePrefs(prefs, 'global');
}

// setPrefs updates the preferences in storage
// and dispatch this update to all subscribers
// newPrefs - has the shape of defaultPrefs
// or a call back that returns that shape
// but you only need to pass the actual fields
// you want to update.
async function setPrefs(newPrefs) {
  // grab the current prefs
  const localPrefs = await retrieveLocalPrefs();
  let globalPrefs = await retriveGlobalPrefs();
  const origin = await getOrigin();

  // if newPrefs contains 'scope' update so 'global|local'
  // it must not be a function cause the function form of
  // newPrefs requires "us" to pass the current prefs
  // but we don't know that yet if the scope is change.
  // anyway. if its a 'scope' update then make sure to
  // update the localprefs cause local prefs will decide
  // if the scope is 'local', or 'global'
  // for example: if user decides that stackoverflow.com
  // should use global or local preferences. that preference is
  // inherently local, thus; scope update should be a local prefs
  // change
  if (typeof newPrefs !== 'function' && newPrefs.scope) {
    localPrefs[origin] = { ...localPrefs[origin], scope: newPrefs.scope };
  }

  // Update the prefs based on the local scope
  // and pass the "current" prefs if newPrefs is
  // a function form.
  // the update is using the spread syntax
  // so the user of this api doesn't have to pass the entire
  // prefs object, to update. Only pass what
  // needs to be updated
  // dispatch that update and store the updated
  // prefs back to storage
  if (localPrefs[origin].scope === 'global') {
    globalPrefs = {
      ...globalPrefs,
      ...(typeof newPrefs === 'function' ? newPrefs(globalPrefs) : newPrefs),
    };
    dispatchPrefsUpdate(globalPrefs);
  } else {
    localPrefs[origin] = {
      ...localPrefs[origin],
      ...(typeof newPrefs === 'function'
        ? newPrefs(localPrefs[origin])
        : newPrefs),
    };
    dispatchPrefsUpdate(localPrefs[origin]);
  }

  storeLocalPrefs(localPrefs);
  storeGlobalPrefs(globalPrefs);
}

// start - kickstarts the retrieval of the current preference
// and dispatch that prefs to subscribers
// for example usage, see Preference.init on
// Popup/index.js and ContentScript/index.js
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

  if (localPrefs[origin].scope === 'global') {
    dispatchPrefsUpdate(globalPrefs);
  } else {
    dispatchPrefsUpdate(localPrefs[origin]);
  }
}

function dispatchPrefsUpdate(prefs) {
  subscribers.forEach((cb) => {
    cb(prefs);
  });
}

export default {
  init,
};
