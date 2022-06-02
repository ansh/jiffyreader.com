const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const readingModeToggleBtn = document.getElementById('readingModeToggleBtn');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const saccadesLabelValue = document.getElementById('saccadesLabelValue');
const fixationStrengthSlider = document.getElementById('fixationStrengthSlider');
const fixationStrengthLabelValue = document.getElementById('fixationStrengthLabelValue');
const lineHeightIncrease = document.getElementById('lineHeightIncrease');
const lineHeightDecrease = document.getElementById('lineHeightDecrease');
const lineHeightLabel = document.getElementById('lineHeightLabel');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const globalPrefsBtn = document.getElementById('globalPrefsBtn');
const localPrefsBtn = document.getElementById('localPrefsBtn');

const defaultPrefs = {
  enabled: false,
  saccadesInterval: 0,
  lineHeight: '',
  fixationStrength: 1,
  scope: 'global',
};

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

async function getOrigin() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'getOrigin' },
        (res) => {
          const origin = res.data;
          if (origin) {
            resolve(origin);
          }
        },
      );
    });
  });
}

async function startup() {
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
    applyPrefsUpdate(globalPrefs);
  } else {
    applyPrefsUpdate(localPrefs[origin]);
  }
}

function applyPrefsUpdate(prefs) {
  onSaccadesInterval(prefs.saccadesInterval);
  onReadingModeToggled(prefs.enabled);
  onFixationStrength(prefs.fixationStrength);
  onLineHeight(prefs.lineHeight);
  onScopePreference(prefs.scope || 'global');
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
      ...(typeof newPrefs === 'function'
        ? newPrefs(globalPrefs)
        : newPrefs),
    };
    applyPrefsUpdate(globalPrefs);
  } else {
    localPrefs[origin] = {
      ...localPrefs[origin],
      ...(typeof newPrefs === 'function'
        ? newPrefs(localPrefs[origin])
        : newPrefs),
    };
    applyPrefsUpdate(localPrefs[origin]);
  }

  storeLocalPrefs(localPrefs);
  storeGlobalPrefs(globalPrefs);
}

function onSaccadesInterval(value) {
  const saccadesInterval = Number(value);
  saccadesLabelValue.textContent = saccadesInterval;
  saccadesIntervalSlider.value = saccadesInterval;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'setSaccadesIntervalInDOM', data: saccadesInterval },
      () => {
        if (chrome.runtime.lastError) {
          // no-op
        }
      },
    );
  });
}

function onReadingModeToggled(enabled) {
  if (enabled) {
    readingModeToggleBtn.classList.add('selected');
    readingModeToggleBtn.textContent = 'Reading Mode';
  } else {
    readingModeToggleBtn.classList.remove('selected');
    readingModeToggleBtn.textContent = 'Enable Reading Mode';
  }

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'setReadingMode', data: enabled },
      () => {
        if (chrome.runtime.lastError) {
          // no-op
        }
      },
    );
  });
}

function onFixationStrength(value) {
  fixationStrengthLabelValue.textContent = value;
  fixationStrengthSlider.value = value;
  const payload = { message: 'setFixationStrength', type: 'setFixationStrength', data: value };
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(
      tab.id,
      payload,
      (response) => {
        if (chrome.runtime.lastError) {
          // no-op
        }
      },
    );
  });
}

function onLineHeight(height) {
  if (height) {
    lineHeightLabel.textContent = `Line Height ${height}`;
  } else {
    lineHeightLabel.textContent = 'Line Height';
  }
}

function onScopePreference(scope) {
  [
    globalPrefsBtn,
    localPrefsBtn,
  ].forEach((el) => {
    el.classList.remove('selected');
    const scopeAttr = el.getAttribute('data-scope');
    if (scope === scopeAttr) {
      el.classList.add('selected');
    }
  });
}

saccadesIntervalSlider.addEventListener('change', (event) => {
  setPrefs({
    saccadesInterval: event.target.value,
  });
});

fixationStrengthSlider.addEventListener('change', (event) => {
  setPrefs({
    fixationStrength: event.target.value,
  });
});

readingModeToggleBtn.addEventListener('click', (event) => {
  setPrefs((currentPrefs) => ({
    enabled: !currentPrefs.enabled,
  }));
});

resetDefaultsBtn.addEventListener('click', () => {
  const { scope, ...noScope } = { ...defaultPrefs };
  setPrefs({
    ...noScope,
  });
});

[
  globalPrefsBtn,
  localPrefsBtn,
].forEach((el) => {
  el.addEventListener('click', (event) => {
    const scope = el.getAttribute('data-scope');
    setPrefs({
      scope,
    });
  });
});

[
  lineHeightIncrease, lineHeightDecrease,
].forEach((el) => {
  el.addEventListener('click', (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'setlineHeight', action: el.getAttribute('id'), step: 0.5 },
        (response) => {
          setPrefs({
            lineHeight: response.data,
          });
        },
      );
    });
  });
});

startup();
