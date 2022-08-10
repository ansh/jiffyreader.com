import { useEffect, useState } from 'react';

import Logger from '~services/Logger';
import TabHelper from '~services/TabHelper';
import usePrefs from '~services/usePrefs';

import './../styles/style.css';

import { useStorage } from '@plasmohq/storage';

import documentParser from '~contents/documentParser';
import {
  APP_PREFS_STORE_KEY,
  COLOR_MODE_STATE_TRANSITIONS,
  DisplayColorMode,
  SACCADE_COLORS,
  SACCADE_STYLES,
  STORAGE_AREA,
} from '~services/config';

const darkToggle = chrome.runtime.getURL('./assets/moon-solid.svg');
const lightToggle = chrome.runtime.getURL('./assets/sun-light-solid.svg');

const { setAttribute, setProperty, getProperty, getAttribute, setSaccadesStyle } =
  documentParser.makeHandlers(document);

const FIXATION_OPACITY_STOPS = 5;
const FIXATION_OPACITY_STOP_UNIT_SCALE = Math.floor(100 / FIXATION_OPACITY_STOPS);

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

function IndexPopup() {
  const [prefs, setPrefs] = usePrefs(
    async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)),
    true,
  );

  const [tabSession, setTabSession] = useState<TabSession>(null);

  const [appConfigPrefs, setAppConfigPrefs] = useStorage({
    key: APP_PREFS_STORE_KEY,
    area: STORAGE_AREA,
  });

  useEffect(() => {
    if (!tabSession) return;

    documentParser.setReadingMode(tabSession.brMode, document, '');
  }, [tabSession]);

  useEffect(() => {
    Logger.logInfo('%cprefstore updated', 'background:red;color:white', prefs);

    if (!prefs) return;

    setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%');
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

  const handleDisplayColorModeChange = async (currentDisplayColorMode) => {
    console.log('handleDisplayColorModeChange', currentDisplayColorMode);

    if (![...Object.values(DisplayColorMode)].includes(currentDisplayColorMode)) {
      alert('not allowed');
      return;
    }

    const [, displayColorMode] = COLOR_MODE_STATE_TRANSITIONS.find(([key]) =>
      new RegExp(currentDisplayColorMode, 'i').test(key),
    );

    await setAppConfigPrefs({ ...appConfigPrefs, displayColorMode });
    console.log('handleDisplayColorModeChange', appConfigPrefs);
  };

  const getFooterLinks = (textColor = 'text-secondary') => (
    <>
      <div className="flex justify-between || text-center text-md text-bold w-full gap-3">
        <a
          className={`${textColor} text-uppercase`}
          href="https://github.com/ansh/jiffyreader.com#FAQ"
          target="_blank">
          {chrome.i18n.getMessage('faqLinkText')}
        </a>
        <a
          className={`${textColor} text-capitalize`}
          href="https://github.com/ansh/jiffyreader.com#reporting-issues-bugs-and-feature-request"
          target="_blank">
          {chrome.i18n.getMessage('reportIssueLinkText')}
        </a>
        <a
          className={`${textColor} text-capitalize`}
          href="https://www.jiffyreader.com/"
          target="_blank">
          {chrome.i18n.getMessage('aboutUsLinkText')}
        </a>
      </div>

      <div className="version_dark_mode_toggle|| flex justify-between align-items-center || ">
        <div className={'|| text-left text-md ' + textColor}>{process.env.VERSION_NAME}</div>

        <div className="light-dark-container">
          <button
            type="button"
            name="display_mode_switch"
            id="display_mode_switch"
            className="button text-capitalize  text-alternate"
            value={`${
              Object.fromEntries(COLOR_MODE_STATE_TRANSITIONS)[appConfigPrefs?.displayColorMode]
            } mode toggle`}
            onClick={() => handleDisplayColorModeChange(appConfigPrefs.displayColorMode)}
            aria-description="light mode dark mode toggle">
            <svg width="20" height="20">
              <image
                width="20"
                height="20"
                href={appConfigPrefs?.displayColorMode == 'light' ? darkToggle : lightToggle}
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  const showDebugInline = (environment = 'production') => {
    if (/production/i.test(environment)) return;

    return (
      <div className=" || flex flex-column || w-full text-wrap">
        <span className="w-full">tabSession {JSON.stringify(tabSession)}</span>
        <span className="w-full">prefs: {JSON.stringify(prefs)}</span>
        <span className="w-full">appConfigPrefs: {JSON.stringify(appConfigPrefs)}</span>
      </div>
    );
  };

  const showErrorMessage = () => {
    return (
      <div className="flex flex-column m-md gap-1">
        <span>{chrome.i18n.getMessage('urlPromptText')}</span>
        <span>{chrome.i18n.getMessage('reloadPromptText')}</span>
        {getFooterLinks('text-primary')}
      </div>
    );
  };

  return (
    <>
      <div
        className={`jr_wrapper_container ${appConfigPrefs?.displayColorMode}-mode text-capitalize`}>
        <div className="popup-body flex flex-column text-alternate">
          {showDebugInline(process.env.NODE_ENV)}
          {!prefs || !tabSession ? (
            showErrorMessage()
          ) : (
            <div
              className="popup-container flex flex-column  | gap-2 p-2"
              br-mode={tabSession.brMode ? 'On' : 'Off'}>
              <div className="flex flex-column">
                <div className="header flex justify-between">
                  <span className="mb-md text-capitalize">
                    {chrome.i18n.getMessage('preferenceLabel')}:
                  </span>
                  <div className="display_modes || || mb-md"></div>
                  <span className="tips flex flex-column show-hover text-capitalize">
                    <span className="select button mb-md">
                      {chrome.i18n.getMessage('tipsPopupTriggerLabel')}
                    </span>
                    <ul
                      className="flex hide flex-column pos-absolute ul-plain right-0 bg-secondary gap-2 p-4 mt-5 text-secondary shadow transition"
                      style={{ zIndex: '10' }}>
                      <li>{chrome.i18n.getMessage('dataEntryMessage')}</li>
                      <li>
                        <a
                          className="text-white"
                          href="https://play.google.com/books"
                          target="_blank">
                          Google Play Books
                        </a>{' '}
                        {chrome.i18n.getMessage('googlePlayLinkSecondaryText')}
                      </li>
                      <li>
                        <a href="https://www.buymeacoffee.com/jiffyreader" target="_blank">
                          <img
                            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                            alt="Buy Me A Coffee"
                            className="buymeacoffee"
                          />
                        </a>
                      </li>
                    </ul>
                  </span>
                </div>
                <div className="flex w-100 justify-between">
                  <div className="w-100 pr-mr">
                    <button
                      id="globalPrefsBtn"
                      data-scope="global"
                      className={`flex flex-column align-items-center w-100 text-capitalize ${
                        /global/i.test(prefs.scope) ? 'selected' : ''
                      }`}
                      onClick={(event) => updateConfig('scope', 'global')}>
                      <span>{chrome.i18n.getMessage('globalPreferenceToggleBtnText')}</span>
                      <span className="text-sm pt-sm">
                        {chrome.i18n.getMessage('globalPreferenceToggleBtnSubText')}
                      </span>
                    </button>
                  </div>
                  <div className="w-100 pl-md">
                    <button
                      id="localPrefsBtn"
                      data-scope="local"
                      className={`flex flex-column align-items-center w-100 text-capitalize ${
                        /local/i.test(prefs.scope) ? 'selected' : ''
                      }`}
                      onClick={(event) => updateConfig('scope', 'local')}>
                      <span>{chrome.i18n.getMessage('sitePreferenceToggleBtnText')}</span>
                      <span className="text-sm pt-sm">
                        {chrome.i18n.getMessage('sitePreferenceToggleBtnSubText')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                id="readingModeToggleBtn"
                className={`w-100 flex flex-column align-items-center text-capitalize ${
                  tabSession?.brMode ? 'selected' : ''
                }`}
                onClick={() => handleToggle(!tabSession.brMode)}>
                <span>
                  {chrome.i18n.getMessage(
                    tabSession?.brMode ? 'onOffToggleBtnTextDisable' : 'onOffToggleBtnTextEnable',
                  )}
                </span>
                <span>{chrome.i18n.getMessage('onOffToggleBtnSubText')}</span>
                <span>
                  {chrome.i18n.getMessage('defaultShortcutLabelText')}:{' '}
                  {chrome.i18n.getMessage(
                    /firefox/i.test(process.env.TARGET)
                      ? 'defaultShortcutValueTextFirefox'
                      : 'defaultShortcutValueTextChrome',
                  )}
                </span>
              </button>

              <div className="w-100">
                <label className="block text-capitalize">
                  {chrome.i18n.getMessage('saccadesIntervalLabel')}:{' '}
                  <span id="saccadesLabelValue">{prefs.saccadesInterval}</span>
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
                      <option
                        key={`saccades-interval-${index}`}
                        value={index + 1}
                        label={'' + index}></option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="w-100">
                <label className="block text-capitalize">
                  {chrome.i18n.getMessage('fixationsStrengthLabel')}:{' '}
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
                      <option
                        key={`fixation-strength-${index}`}
                        value={index + 1}
                        label={'' + (index + 1)}></option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="w-100">
                <label className="block text-capitalize">
                  {chrome.i18n.getMessage('fixationsEdgeOpacityLabel')}:{' '}
                  <span id="fixationOpacityLabelValue">{prefs.fixationEdgeOpacity}%</span>
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
                <label className="text-dark text-capitalize" htmlFor="saccadesColor">
                  {chrome.i18n.getMessage('saccadesColorLabel')}
                </label>

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
                <label className="text-dark text-capitalize" htmlFor="saccadesStyle">
                  {chrome.i18n.getMessage('saccadesStyleLabel')}
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
                <label className="block text-capitalize mb-sm" id="lineHeightLabel">
                  {chrome.i18n.getMessage('lineHeightLabel')}
                </label>
                <div className="w-100 flex justify-center">
                  <button
                    id="lineHeightDecrease"
                    data-op="decrease"
                    className="mr-md w-100 text-capitalize"
                    onClick={() => updateConfig('lineHeight', Number(prefs.lineHeight) - 0.5)}>
                    <span className="block">
                      {chrome.i18n.getMessage('smallerLineHieghtBtnText')}
                    </span>
                    <span className="text-sm">
                      {chrome.i18n.getMessage('smallerLineHieghtBtnSubText')}
                    </span>
                  </button>
                  <button
                    id="lineHeightIncrease"
                    data-op="increase"
                    className="ml-md w-100 text-capitalize"
                    onClick={() => updateConfig('lineHeight', Number(prefs.lineHeight) + 0.5)}>
                    <span className="block text-bold">
                      {chrome.i18n.getMessage('largerLineHieghtBtnText')}
                    </span>
                    <span className="text-sm">
                      {chrome.i18n.getMessage('largerLineHieghtBtnSubText')}
                    </span>
                  </button>
                </div>
              </div>

              <button
                id="onPageLoadBtn"
                className={`w-100 flex flex-column align-items-center text-capitalize ${
                  prefs.onPageLoad ? 'selected' : ''
                }`}
                onClick={() => updateConfig('onPageLoad', !prefs.onPageLoad)}>
                <span className="text-bold">
                  {chrome.i18n.getMessage(
                    prefs.onPageLoad
                      ? 'defaultBionicModeToggleBtnOffText'
                      : 'defaultBionicModeToggleBtnOnText',
                  )}
                </span>
                <span className="text-sm pt-sm">
                  {chrome.i18n.getMessage('defaultBionicModeToggleBtnSubText')}
                </span>
              </button>

              <button
                id="resetDefaultsBtn"
                className="w-100 flex flex-column align-items-center text-capitalize"
                style={{ marginBottom: '25px' }}
                onClick={() => updateConfig('scope', 'reset')}>
                {chrome.i18n.getMessage('resetBtnText')}
              </button>

              <footer className="popup_footer || flex flex-column gap-1 p-2">
                {getFooterLinks()}
              </footer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default IndexPopup;
