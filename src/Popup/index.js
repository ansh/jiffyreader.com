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
  fixationStrength: 1,
};

let preferences = {
  scope: 'global', // 'global', 'local',
  global: {
    ...defaultPrefs,
  },
  local: {},
};

function retrievePrefs() {
  chrome.runtime.sendMessage(
    { message: 'retrievePrefs' },
    (response) => {
      if (response.data) {
        preferences = response.data;
      }
      if (preferences.scope === 'local') {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'getOrigin' },
            (res) => {
              const origin = res.data;
              if (!preferences.local[origin]) {
                preferences.scope = 'global';
              }
              storePrefs(preferences);
              getPrefsByScope(preferences, (scopedPrefs) => {
                applyPrefsUpdate(preferences, scopedPrefs);
              });
            },
          );
        });
      } else {
        storePrefs(preferences);
        getPrefsByScope(preferences, (scopedPrefs) => {
          applyPrefsUpdate(preferences, scopedPrefs);
        });
      }
    },
  );
}

function applyPrefsUpdate(newPreferences, scopedPrefs) {
  onSaccadesInterval(scopedPrefs.saccadesInterval);
  onReadingModeToggled(scopedPrefs.enabled);
  onFixationStrength(scopedPrefs.fixationStrength);
  onScopePreference(newPreferences.scope);
}

function storePrefs(prefs) {
  chrome.runtime.sendMessage(
    { message: 'storePrefs', data: prefs },
    (response) => { },
  );
}

function getPrefsByScope(prefs, cb) {
  if (prefs.scope === 'local') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'getOrigin' },
        (response) => {
          const origin = response.data;
          const scopedPrefs = prefs.local[origin] || { ...defaultPrefs };
          cb(scopedPrefs);
        },
      );
    });
  } else {
    const scopedPrefs = prefs.global;
    cb(scopedPrefs);
  }
}

function newPrefsByScope(prefs, scopedPrefs, cb) {
  const newPrefs = { ...prefs };
  let newScopedPrefs;

  if (prefs.scope === 'local') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'getOrigin' },
        (response) => {
          const origin = response.data;
          newPrefs.local[origin] = { ...newPrefs.local[origin], ...scopedPrefs };
          newScopedPrefs = newPrefs.local[origin];
          cb(newPrefs, newScopedPrefs);
        },
      );
    });
  } else {
    newPrefs.global = { ...prefs.global, ...scopedPrefs };
    newScopedPrefs = newPrefs.global;
    cb(newPrefs, newScopedPrefs);
  }
}

function setPrefs(newScopedPrefscb, preferencePatch, cb) {
  preferences = { ...preferences, ...preferencePatch };
  getPrefsByScope(preferences, (scopedPrefs) => {
    newPrefsByScope(
      preferences,
      ({ ...scopedPrefs, ...newScopedPrefscb(scopedPrefs) }),
      (newPreferences, newScopedPrefs) => {
        preferences = newPreferences;
        storePrefs(preferences);
        if (typeof cb === 'function') {
          cb(preferences, newScopedPrefs);
        }
        applyPrefsUpdate(preferences, newScopedPrefs);
      },
    );
  });
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
  setPrefs(
    (_) => ({
      saccadesInterval: event.target.value,
    }),
  );
});

fixationStrengthSlider.addEventListener('change', (event) => {
  setPrefs(
    (_) => ({
      fixationStrength: event.target.value,
    }),
  );
});

readingModeToggleBtn.addEventListener('click', async () => {
  setPrefs(
    (oldScopedPrefs) => ({
      enabled: !oldScopedPrefs.enabled,
    }),
  );
});

resetDefaultsBtn.addEventListener('click', () => {
  setPrefs(
    (_) => ({
      ...defaultPrefs,
    }),
  );
});
[
  globalPrefsBtn,
  localPrefsBtn,
].forEach((el) => {
  el.addEventListener('click', (event) => {
    setPrefs(
      (_) => ({}),
      {
        scope: el.getAttribute('data-scope'),
      },
    );
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
          if (response.data) {
            lineHeightLabel.textContent = `Line Height ${response.data}`;
          } else {
            lineHeightLabel.textContent = 'Line Height';
          }
          if (chrome.runtime.lastError) {
            // no-op
          }
        },
      );
    });
  });
});

retrievePrefs();
