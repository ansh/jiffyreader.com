const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const readingModeToggleBtn = document.getElementById('readingModeToggleBtn');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const saccadesLabelValue = document.getElementById('saccadesLabelValue');
const fixationStrengthSlider = document.getElementById('fixationStrengthSlider');
const fixationStrengthLabelValue = document.getElementById('fixationStrengthLabelValue');

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
        onSaccadesInterval(scopedPrefs.saccadesInterval);
        onReadingModeToggled(scopedPrefs.enabled);
        onFixationStrength(scopedPrefs.fixationStrength);
      });
    },
  );
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
      newScopedPrefscb(scopedPrefs),
      (newPreferences, newScopedPrefs) => {
        preferences = newPreferences;
        storePrefs(preferences);
        cb(preferences, newScopedPrefs);
      },
    );
  });
}

function onSaccadesInterval(value) {
  const saccadesInterval = value;
  const documentButtons = document.getElementsByTagName('button');
  for (let index = 0; index < documentButtons.length; index++) {
    const button = documentButtons.item(index);

    const buttonId = button.getAttribute('id');
    if (/lineHeight/.test(buttonId)) {
      button.addEventListener('click', updateLineHeightClickHandler);
    }
  }

  updateSaccadesLabelValue(saccadesInterval);
  saccadesIntervalSlider.value = saccadesInterval;
  saccadesIntervalSlider.addEventListener('change', updateSaccadesChangeHandler);
}

function onReadingModeToggled(enabled) {
  if (enabled) {
    readingModeToggleBtn.classList.add('selected');
  } else {
    readingModeToggleBtn.classList.remove('selected');
  }
}

function onFixationStrength(value) {
  fixationStrengthLabelValue.textContent = value;
  fixationStrengthSlider.value = value;
}

readingModeToggleBtn.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    setPrefsByScope(
      (oldScopedPrefs) => ({
        ...oldScopedPrefs,
        enabled: !oldScopedPrefs.enabled,
      }),
      (newPreferences, newScopedPrefs) => {
        setBrModeOnBody(newScopedPrefs.enabled);
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'setReadingMode', data: newScopedPrefs.enabled },
          () => {
            if (chrome.runtime.lastError) {
              // no-op
            }
          },
        );
      },
    );
  });
});

async function updateLineHeightClickHandler(event) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'setlineHeight', action: event.target.getAttribute('id'), step: 0.5 },
      () => {
        if (chrome.runtime.lastError) {
          // no-op
        }
      },
    );
  });
}

function updateSaccadesChangeHandler(event) {
  const saccadesInterval = Number(event.target.value);
  updateSaccadesLabelValue(saccadesInterval);
  updateSaccadesIntermediateHandler(saccadesInterval);
}

async function updateSaccadesIntermediateHandler(_saccadesInterval) {
  chrome.runtime.sendMessage(
    { message: 'setSaccadesInterval', data: _saccadesInterval },
    (response) => {
    },
  );
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => new Promise(() => {
      try {
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'setSaccadesIntervalInDOM', data: _saccadesInterval },
          () => {
            if (chrome.runtime.lastError) {
              // no-op
            }
          },
        );
      } catch (e) {
        // no-op
      }
    }));
  });
}

fixationStrengthSlider.addEventListener('change', (event) => {
  fixationStrengthLabelValue.textContent = event.target.value;
  const payload = { message: 'setFixationStrength', type: 'setFixationStrength', data: event.target.value };
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, payload, (response) => {
      //
    });
  });

  chrome.runtime.sendMessage(payload, (response) => {
  });
});
/**
 * @description Show the word interval between saccades
 */
function updateSaccadesLabelValue(saccadesInterval) {
  document.getElementById('saccadesLabelValue').textContent = saccadesInterval;
}

function setBrModeOnBody(/** @type boolean */mode) {
  document.body.setAttribute('br-mode', mode ? 'on' : 'off');
}
