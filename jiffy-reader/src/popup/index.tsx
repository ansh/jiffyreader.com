import { useEffect, useState } from 'react';

import usePrefs from '~usePrefs';

import documentParser from '../../../src/ContentScript/documentParser';

import '../../../src/style.css';

import TabHelper from '../../../src/TabHelper';
import Logger from '../features/Logger';

const { setAttribute, setProperty, getProperty, getAttribute, setSaccadesStyle } =
  documentParser.makeHandlers(document);

const SACCADE_COLORS = [
  ['Original', ''],
  ['Light', 'light'],
  ['Light-100', 'light-100'],
  ['Dark', 'dark'],
  ['Dark-100', 'dark-100'],
] as [Label: string, value: string][];

const SACCADE_STYLES = [
  'Bold-400',
  'Bold-500',
  'Bold-600',
  'Bold-700',
  'Bold-800',
  'Bold-900',
  'Solid-line',
  'Dash-line',
  'Dotted-line',
];

const FIXATION_OPACITY_STOPS = 5;
const FIXATION_OPACITY_STOP_UNIT_SCALE = Math.floor(100 / FIXATION_OPACITY_STOPS);

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

function IndexPopup() {
  const [prefs, setPrefs] = usePrefs(
    async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)),
    true,
  );

  const [tabSession, setTabSession] = useState<TabSession>(null);

  const PREF_STORE_SCOPES = ['reset', 'global', 'local'];

  useEffect(() => {
    if (!tabSession) return;

    documentParser.setReadingMode(tabSession.brMode, document);
  }, [tabSession]);

  useEffect(() => {
    Logger.logInfo('%cprefstore updated', 'background:red;color:white', prefs);
    if (!prefs) return;

    setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%');
    setProperty('--br-line-height', prefs.lineHeight);
    setSaccadesStyle(prefs.saccadesStyle);
    setAttribute('saccades-color', prefs.saccadesColor);
    setAttribute('fixation-strength', prefs.fixationStrength);
    setAttribute('saccades-interval', prefs.saccadesInterval);
  }, [prefs]);

  useEffect(() => {
    (async () => {
      const brMode = chrome.tabs.sendMessage(
        (await TabHelper.getActiveTab(true)).id,
        {
          type: 'getReadingMode',
        },
        ({ data }) => {
          setTabSession({ brMode: data });
        },
      );
    })();

    runTimeHandler.runtime.onMessage.addListener((request, sender, sendResponse) => {
      Logger.logInfo('PopupMessageListenerFired');

      switch (request.message) {
        case 'setIconBadgeText': {
          setTabSession({ brMode: request.data });
          break;
        }
        default: {
          break;
        }
      }
    });
  }, []);

  const makeUpdateChangeEventHandler =
    (field: string) =>
    (event, customValue = null) =>
      updateConfig(field, customValue ?? event.target.value);

  const updateConfig = (key: string, value: any, configLocal = prefs) => {
    const newConfig = { ...configLocal, [key]: value };

    setPrefs(
      async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)),
      newConfig.scope,
      newConfig,
    );
  };

  const handleToggle = (newBrMode: boolean) => {
    const payload = {
      type: 'setReadingMode',
      message: 'setIconBadgeText',
      data: newBrMode,
    };

    setTabSession({ brMode: newBrMode });
    runTimeHandler.runtime.sendMessage(payload, () => Logger.LogLastError());

    TabHelper.getActiveTab(true).then((tab) =>
      chrome.tabs.sendMessage(tab.id, payload, () => Logger.LogLastError()),
    );
  };

  const showDebugInline = (environment = 'production') => {
    if (/production/i.test(environment)) return;

    return (
      <>
        <span>tabSession {JSON.stringify(tabSession)}</span>
        <span>prefs: {JSON.stringify(prefs)}</span>
        {/* <span>prefStore {JSON.stringify(prefStore)}</span> */}
      </>
    );
  };

  return (
    <>
      <div className="jr_wrapper_container">
        <div className="popup-body flex flex-column">
          {showDebugInline(process.env.NODE_ENV)}
          {!prefs || !tabSession ? (
            <div className="flex flex-column m-md">
              <span>Loading... Hopefully not broken</span>
            </div>
          ) : (
            <div
              className="popup-container flex flex-column  | gap-2 p-2"
              br-mode={tabSession.brMode ? 'On' : 'Off'}
              saccades-interval={prefs.saccadesInterval}
              saccades-color={prefs.saccadesColor}
              fixation-strength={prefs.fixationStrength}>
              <div className="flex flex-column">
                <div className="header flex justify-between">
                  <span className="mb-md">Preference:</span>
                  <span className="tips flex flex-column show-hover">
                    <span className="select">Tips</span>
                    <ul
                      className="flex hide flex-column pos-absolute ul-plain right-0 bg-primary gap-2 p-4 mt-3 text-white shadow transition"
                      style={{ zIndex: '10' }}>
                      <li>Turn off if jiffy reader interfers with data entry</li>
                      <li>
                        <a
                          className="text-white"
                          href="https://play.google.com/books"
                          target="_blank">
                          Google Play Books
                        </a>{' '}
                        reading supported
                      </li>
                    </ul>
                  </span>
                </div>
                <div className="flex w-100 justify-between">
                  <div className="w-100 pr-mr">
                    <button
                      id="globalPrefsBtn"
                      data-scope="global"
                      className={`flex flex-column align-items-center w-100 ${
                        /global/i.test(prefs.scope) ? 'selected' : ''
                      }`}
                      onClick={(event) => updateConfig('scope', 'global')}>
                      Global
                      <span className="text-sm pt-sm">Default</span>
                    </button>
                  </div>
                  <div className="w-100 pl-md">
                    <button
                      id="localPrefsBtn"
                      data-scope="local"
                      className={`flex flex-column align-items-center w-100 ${
                        /local/i.test(prefs.scope) ? 'selected' : ''
                      }`}
                      onClick={(event) => updateConfig('scope', 'local')}>
                      Site
                      <span className="text-sm pt-sm">For this site</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                id="readingModeToggleBtn"
                className={`w-100 flex flex-column align-items-center ${
                  tabSession?.brMode ? 'selected' : ''
                }`}
                onClick={() => handleToggle(!tabSession.brMode)}>
                {tabSession.brMode ? <span>Disable</span> : <span>Enable</span>}
                <span>Reading Mode</span>
                <span>Default Shortcut: {process.env.SHORTCUT}</span>
              </button>

              <div className="w-100">
                <label className="block">
                  Saccades interval: <span id="saccadesLabelValue">{prefs.saccadesInterval}</span>
                </label>
                <div className="slidecontainer">
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={prefs.saccadesInterval}
                    onChange={makeUpdateChangeEventHandler('saccadesInterval')}
                    className="slider w-100"
                    id="saccadesSlider"
                  />
                  <datalist id="saccadesSlider" className="flex text-sm justify-between">
                    {new Array(prefs.MAX_FIXATION_PARTS).fill(null).map((_, index) => (
                      <option value={index + 1} label={'' + index}></option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="w-100">
                <label className="block">
                  Fixations strength:{' '}
                  <span id="fixationStrengthLabelValue">{prefs.fixationStrength}</span>
                </label>
                <div className="slidecontainer">
                  <input
                    type="range"
                    min="1"
                    max={prefs.MAX_FIXATION_PARTS}
                    value={prefs.fixationStrength}
                    onChange={makeUpdateChangeEventHandler('fixationStrength')}
                    className="slider w-100"
                    id="fixationStrengthSlider"
                  />
                  <datalist id="fixationStrengthSlider" className="flex text-sm justify-between">
                    {new Array(prefs.MAX_FIXATION_PARTS).fill(null).map((_, index) => (
                      <option value={index + 1} label={'' + (index + 1)}></option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="w-100">
                <label className="block">
                  Fixations edge opacity %:{' '}
                  <span id="fixationOpacityLabelValue">{prefs.fixationEdgeOpacity}</span>
                </label>
                <div className="slidecontainer">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={prefs.fixationEdgeOpacity}
                    onChange={makeUpdateChangeEventHandler('fixationEdgeOpacity')}
                    className="slider w-100"
                    id="fixationEdgeOpacitySlider"
                    list="fixationEdgeOpacityList"
                    step="20"
                  />
                  <datalist id="fixationEdgeOpacityList" className="flex text-sm justify-between">
                    {new Array(FIXATION_OPACITY_STOPS + 1)
                      .fill(null)
                      .map((_, stopIndex) => stopIndex * FIXATION_OPACITY_STOP_UNIT_SCALE)
                      .map((value) => (
                        <option
                          key={`opacity-stop-${value}`}
                          value={value}
                          label={value + ''}></option>
                      ))}
                  </datalist>
                </div>
              </div>

              <div className="w-100 flex flex-column gap-1">
                <span className="text-dark">Saccades Color</span>

                <select
                  name="saccadesColor"
                  id="saccadesColor"
                  className="p-2"
                  onChange={makeUpdateChangeEventHandler('saccadesColor')}
                  value={prefs.saccadesColor}>
                  {SACCADE_COLORS.map(([label, value]) => (
                    <option key={label} value={value} label={label}></option>
                  ))}
                </select>
              </div>

              <div className="w-100 flex flex-column gap-1">
                <label className="text-dark" htmlFor="style">
                  Saccades Style
                </label>

                <select
                  name="saccadesStyle"
                  id="saccadesStyle"
                  className="p-2"
                  onChange={makeUpdateChangeEventHandler('saccadesStyle')}
                  value={prefs.saccadesStyle}>
                  {SACCADE_STYLES.map((style) => (
                    <option key={style} value={style.toLowerCase()} label={style}></option>
                  ))}
                </select>
              </div>

              <div className="w-100">
                <label className="block mb-sm" id="lineHeightLabel">
                  Line Height
                </label>
                <div className="w-100 flex justify-center">
                  <button
                    id="lineHeightDecrease"
                    data-op="decrease"
                    className="mr-md w-100"
                    onClick={() => updateConfig('lineHeight', Number(prefs.lineHeight) - 0.5)}>
                    <span className="block">Aa</span>
                    <span className="text-sm">Smaller</span>
                  </button>
                  <button
                    id="lineHeightIncrease"
                    data-op="increase"
                    className="ml-md w-100"
                    onClick={() => updateConfig('lineHeight', Number(prefs.lineHeight) + 0.5)}>
                    <span className="block text-bold">Aa</span>
                    <span className="text-sm">Larger</span>
                  </button>
                </div>
              </div>

              <button
                id="onPageLoadBtn"
                className={`w-100 flex flex-column align-items-center ${
                  prefs.onPageLoad ? 'selected' : ''
                }`}
                onClick={() => updateConfig('onPageLoad', !prefs.onPageLoad)}>
                <span className="text-bold">
                  Turn {prefs.onPageLoad ? 'Off' : 'On'} Always<span id="onPageLoadLabel"></span>
                </span>
                <span className="text-sm pt-sm">Default Toggle Preference</span>
              </button>

              <button
                id="resetDefaultsBtn"
                className="w-100 flex flex-column align-items-center"
                style={{ marginBottom: '25px' }}
                onClick={() => updateConfig('scope', 'reset')}>
                Reset Defaults
              </button>

              <footer className="popup_footer flex justify-between text-center text-md text-bold">
                <a
                  className="text-white"
                  href="https://github.com/ansh/jiffyreader.com#FAQ"
                  target="_blank">
                  FAQ
                </a>
                <a
                  className="text-white"
                  href="https://github.com/ansh/jiffyreader.com#reporting-issues-bugs-and-feature-request"
                  target="_blank">
                  Report Issue
                </a>
                <a className="text-white" href="https://www.jiffyreader.com/" target="_blank">
                  About Us
                </a>
              </footer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default IndexPopup;
