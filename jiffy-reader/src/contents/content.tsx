import type { PlasmoContentScript } from 'plasmo';
import React, { useEffect, useState } from 'react';

import usePrefs from '~usePrefs';

import documentParser from '../../../src/ContentScript/documentParser';
import Logger from '../features/Logger';


export const config: PlasmoContentScript = {
  matches: ['<all_urls>'],
  all_frames: true,
};

const { setAttribute, setProperty, setSaccadesStyle, getAttribute } =
  documentParser.makeHandlers(document);

const contentLogStyle = 'background-color: pink';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const OVERLAY_STYLE = {
  position: 'fixed' as 'fixed',
  bottom: '40px',
  left: '40px',
  display: 'flex',
  flexDirection: 'column' as 'row',
};

window.addEventListener('load', () => {
  Logger.logInfo('content script loaded');
});

export const getRootContainer = () => {
  let child = document.createElement('div');
  child.setAttribute('br-mount-point', '');

  document.querySelector('body').appendChild(child);
  return document.querySelector('[br-mount-point]');
};

const IndexContent = () => {
  const [prefs] = usePrefs(async () => window.location.origin, false);

  const [tabSession, setTabSession] = useState<TabSession | null>(null);

  const chromeRuntimeMessageHandler = (message, sender, sendResponse) => {
    Logger.logInfo('%cchromeRuntimMessageHandler.fired', contentLogStyle);
    switch (message.type) {
      case 'getOrigin': {
        Logger.logInfo('reply to origin request');
        sendResponse({ data: window.location.origin });
        break;
      }
      case 'setReadingMode': {
        setTabSession((prevTabSession) => {
          const newTabSession = { brMode: message?.data ?? !prevTabSession.brMode };
          sendResponse({ data: newTabSession });
          Logger.logInfo('%ctabsession', contentLogStyle, { prevTabSession, newTabSession });
          return newTabSession;
        });
        break;
      }
      case 'getReadingMode': {
        sendResponse({ data: getAttribute('br-mode') == 'on' });
        break;
      }
      default:
        break;
    }
    return true;
  };

  useEffect(() => {
    Logger.logInfo(
      '%cTabSession same: %s   prefs same:%s',
      contentLogStyle,
      document.body.dataset.tabsession === JSON.stringify(tabSession),
      document.body.dataset.prefs === JSON.stringify(prefs),
    );

    if (prefs && !tabSession) {
      setTabSession((prevTabSession) => {
        const newValue = prevTabSession || { brMode: prefs.onPageLoad };
        Logger.logInfo('%cInitializeTabsession', contentLogStyle, { prevTabSession, newValue });
        return newValue;
      });
    }

    if (!prefs || !tabSession) return;

    Logger.logInfo('content.tsx.useEffect', { prefs, tabSession });

    runTimeHandler.runtime.sendMessage(
      { message: 'setIconBadgeText', data: tabSession.brMode, tabID: tabSession.tabID },
      () => Logger.LogLastError(),
    );

    documentParser.setReadingMode(tabSession.brMode, document);
    setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%');
    setProperty('--br-line-height', prefs.lineHeight);
    setSaccadesStyle(prefs.saccadesStyle);
    setAttribute('saccades-color', prefs.saccadesColor);
    setAttribute('fixation-strength', prefs.fixationStrength);
    setAttribute('saccades-interval', prefs.saccadesInterval);
  }, [prefs, tabSession]);

  useEffect(() => {
    Logger.logInfo('%cregister chrome|browser messageListener', contentLogStyle, { tabSession });
    runTimeHandler.runtime.onMessage.addListener(chromeRuntimeMessageHandler);
  }, []);

  const showDebugOverLay = (show) => {
    if (!show) return;

    return (
      <div className="[ br-overlay ]" style={OVERLAY_STYLE}>
        <span>Target {process.env.TARGET}</span>
        <div className="flex flex-column">
          {!prefs || !tabSession
            ? 'Loading... or broken but probably loading'
            : 'JiffyReady to the moon'}
        </div>
        <span>{JSON.stringify(tabSession)}</span>
        <span>{JSON.stringify(prefs)}</span>
      </div>
    );
  };

  return showDebugOverLay(process.env.NODE_ENV !== 'production');
};

export default IndexContent;