const defaultPrefs = {
  enabled: false,
  saccadesInterval: 0,
  lineHeight: '',
  fixationStrength: 1,
  scope: 'global',
  applyOnPageLoad: false,
};

const subscribers = [];
let getOrigin;

async function retrieveLocalPrefs() {
  return retrievePrefs('local');
}

async function retriveGlobalPrefs() {
  return retrievePrefs('global');
}

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

async function storeLocalPrefs(prefs) {
  return storePrefs(prefs, 'local');
}

async function storeGlobalPrefs(prefs) {
  return storePrefs(prefs, 'global');
}

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

async function setPrefs(newPrefs) {
  const localPrefs = await retrieveLocalPrefs();
  let globalPrefs = await retriveGlobalPrefs();
  const origin = await getOrigin();

  if (typeof newPrefs !== 'function' && newPrefs.scope) {
    localPrefs[origin] = { ...localPrefs[origin], scope: newPrefs.scope };
  }

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

async function start() {
  let localPrefs = await retrieveLocalPrefs();
  let globalPrefs = await retriveGlobalPrefs();
  const origin = await getOrigin();

  if (localPrefs == null) {
    localPrefs = {};
  }

  if (!localPrefs[origin]) {
    localPrefs[origin] = { ...defaultPrefs };
  }

  if (!globalPrefs) {
    globalPrefs = { ...defaultPrefs };
  }

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

function init(config) {
  subscribers.push(config.subscribe);
  getOrigin = config.getOrigin;

  return {
    start,
    setPrefs,
    defaultPrefs,
  };
}

export default {
  init,
};
