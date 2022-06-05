import Preferences from '../Preferences';
import TabHelper from '../TabHelper';

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
const onPageLoadBtn = document.getElementById('onPageLoadBtn');

const { start, setPrefs, defaultPrefs } = Preferences.init({
  getOrigin: async () => TabHelper.getActiveTab(TabHelper.getOrigin),
  subscribe: (prefs) => {
    onSaccadesInterval(prefs.saccadesInterval);
    onFixationStrength(prefs.fixationStrength);
    onLineHeight(prefs.lineHeight);
    onScopePreference(prefs.scope);
    onPageLoadToggled(prefs.onPageLoad);
  },
  onStartup: (prefs) => {
    if (prefs.onPageLoad) {
      // only toggle reading mode on startup
      // if onpage load is true
      onReadingModeToggled(true);
    } else {
      // if page load is not true
      // its possible we still have reading mode active on the current
      // if the user didnt reload the page, and just reloaded the
      // popup script
      // tab so as a last resort, make sure to check the view
      // this is necessary cause we don't store the preference
      // for reading mode
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { type: 'getReadingMode' }, (res) => {
          onReadingModeToggled(res.data);
        });
      });
    }
  },
});

function onFixationStrength(value) {
  fixationStrengthLabelValue.textContent = value;
  fixationStrengthSlider.value = value;
  const payload = {
    message: 'setFixationStrength',
    type: 'setFixationStrength',
    data: value,
  };
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, payload, (response) => {
      if (chrome.runtime.lastError) {
        // no-op
      }
    });
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

function onPageLoadToggled(enabled) {
  if (enabled) {
    onPageLoadBtn.classList.add('selected');
  } else {
    onPageLoadBtn.classList.remove('selected');
  }
}

function onLineHeight(height) {
  if (height) {
    lineHeightLabel.textContent = `Line Height ${parseInt(height * 100, 10)}%`;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'setlineHeight', data: height },
    );
  });
}

function onScopePreference(scope) {
  [globalPrefsBtn, localPrefsBtn].forEach((el) => {
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

onPageLoadBtn.addEventListener('click', (event) => {
  setPrefs(({ onPageLoad }) => ({
    onPageLoad: !onPageLoad,
  }));
});

resetDefaultsBtn.addEventListener('click', () => {
  // when resetting default, we don't want to overwrite the scope
  // cause the setPrefs knows which scope we currently at.
  // and it should only reset the current selected scope
  // scope by the user
  const { scope, ...noScope } = { ...defaultPrefs() };
  setPrefs({
    ...noScope,
  });
});

[globalPrefsBtn, localPrefsBtn].forEach((el) => {
  el.addEventListener('click', (event) => {
    const scope = el.getAttribute('data-scope');
    setPrefs(({ scope: oldScope, ...oldPrefs }) => {
      if (scope === 'local' && oldScope === 'global') {
        return {
          ...oldPrefs,
          scope,
        };
      }

      return {
        scope,
      };
    });
  });
});

[lineHeightIncrease, lineHeightDecrease].forEach((el) => {
  el.addEventListener('click', (event) => {
    const operation = el.getAttribute('data-op');
    setPrefs((currentPrefs) => {
      let lineHeight = parseFloat(currentPrefs.lineHeight, 10);
      if (operation === 'increase') {
        lineHeight += 0.5;
      } else {
        lineHeight -= 0.5;
      }
      return ({
        lineHeight: Math.max(1, lineHeight),
      });
    });
  });
});

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

readingModeToggleBtn.addEventListener('click', (event) => {
  const isOn = readingModeToggleBtn.classList.contains('selected');
  onReadingModeToggled(!isOn);
});

start();
