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
      } else {
        storePrefs(preferences);
      }
      getPrefsByScope(preferences, (scopedPrefs) => {
        applyScopedPrefsUpdates(scopedPrefs);
      });
    },
  );
}

function applyScopedPrefsUpdates(scopedPrefs) {
  onSaccadesInterval(scopedPrefs.saccadesInterval);
  onReadingModeToggled(scopedPrefs.enabled);
  onFixationStrength(scopedPrefs.fixationStrength);
}

function storePrefs(prefs) {
  chrome.runtime.sendMessage(
    { message: 'storePrefs', data: prefs },
    (response) => { },
  );
}

function getPrefsByScope(prefs, cb) {
  let scopedPrefs = prefs.global;
  if (prefs.scope === 'local') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      for (const origin in prefs.local) {
        if (tab.url.indexOf(origin) === 0) {
          scopedPrefs = prefs.local[origin];
          break;
        }
      }
      cb(scopedPrefs);
    });
  } else {
    cb(scopedPrefs);
  }
}

function newPrefsByScope(prefs, scopedPrefs, cb) {
  const newPrefs = { ...prefs };
  newPrefs.global = { ...prefs.global, ...scopedPrefs };
  let newScopedPrefs = newPrefs.global;

  if (prefs.scope === 'local') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      for (const origin in prefs.local) {
        if (tab.url.indexOf(origin) === 0) {
          newPrefs.local[origin] = { ...newPrefs.local[origin], ...scopedPrefs };
          newScopedPrefs = newPrefs.local[origin];
          break;
        }
      }
      cb(newPrefs, newScopedPrefs);
    });
  } else {
    cb(newPrefs, newScopedPrefs);
  }
}

function setPrefsByScope(newScopedPrefscb, cb) {
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
        applyScopedPrefsUpdates(newScopedPrefs);
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

saccadesIntervalSlider.addEventListener('change', (event) => {
  setPrefsByScope(
    (_) => ({
      saccadesInterval: event.target.value,
    }),
  );
});

fixationStrengthSlider.addEventListener('change', (event) => {
  setPrefsByScope(
    (_) => ({
      fixationStrength: event.target.value,
    }),
  );
});

readingModeToggleBtn.addEventListener('click', async () => {
  setPrefsByScope(
    (oldScopedPrefs) => ({
      enabled: !oldScopedPrefs.enabled,
    }),
  );
});

resetDefaultsBtn.addEventListener('click', () => {
  setPrefsByScope(
    (_) => ({
      ...defaultPrefs,
    }),
  );
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
