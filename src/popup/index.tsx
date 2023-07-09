import { useCallback, useEffect, useState } from 'react';

import Logger from '~services/Logger';
import TabHelper from '~services/TabHelper';
import usePrefs from '~services/usePrefs';

import './../styles/style.css';

import { useStorage } from '@plasmohq/storage';

import { APP_PREFS_STORE_KEY, COLOR_MODE_STATE_TRANSITIONS, DisplayColorMode, STORAGE_AREA } from '~services/config';
import documentParser from '~services/documentParser';
import defaultPrefs from '~services/preferences';
import runTimeHandler from '~services/runTimeHandler';

import PopupContextProvider from './context';
import IndexPopupNew from './indexNew';
import IndexPopupOld from './indexOld';
import { useShowDebugSwitch } from './shorcut';

const badCapScroll = /safari/i.test(process.env.TARGET) ? { overflowY: 'scroll', height: '600px' } : {};

const DisplayVersion = ({ displayVersion }) => {
	if (displayVersion === 'old') return <IndexPopupOld />;
	else if (displayVersion === 'new') return <IndexPopupNew />;
};

const popupLogStyle = 'background:cyan;color:brown';

const jiffyLogo = chrome.runtime.getURL('./assets/icon512.png');

const { setAttribute, setProperty, getProperty, getAttribute, setSaccadesStyle } = documentParser.makeHandlers(document);

const SHOW_FOOTER_MESSAGE_DURATION = 12_000;
const FOOT_MESSAGAES_ANIMATION_DELAY = 300;
const FIRST_FOOTER_MESSAGE_INDEX = 1;

function IndexPopup() {
	const [activeTab, setActiveTab] = useState(null as chrome.tabs.Tab);
	const [footerMessageIndex, setFooterMeessageIndex] = useState(null);
	const [isDebugDataVisible, setIsDebugDataVisible] = useShowDebugSwitch();

	const getTabOriginfn = useCallback(async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)), [TabHelper]);

	const [prefs, setPrefs] = usePrefs(getTabOriginfn, true, process.env.TARGET);

	const [tabSession, setTabSession] = useState<TabSession>(null);

	const [tipsVisibility, setTipsVisibility] = useState<boolean>(false);

	const [appConfigPrefs, setAppConfigPrefs] = useStorage({
		key: APP_PREFS_STORE_KEY,
		area: STORAGE_AREA,
	});

	const footerMessagesLength = 3;
	const nextMessageIndex = (oldFooterMessageIndex) =>
		typeof oldFooterMessageIndex !== 'number' ? FIRST_FOOTER_MESSAGE_INDEX : (oldFooterMessageIndex + 1) % footerMessagesLength;

	useEffect(() => {
		if (!tabSession) return;

		documentParser.setReadingMode(tabSession.brMode, document, '');
	}, [tabSession]);

	useEffect(() => {
		(async () => {
			const _activeTab = await TabHelper.getActiveTab(true);
			setActiveTab(_activeTab);
			Logger.logInfo('%cactiveTab', popupLogStyle, _activeTab);

			const origin = await TabHelper.getTabOrigin(_activeTab);

			const brMode = chrome.tabs.sendMessage(_activeTab.id, { type: 'getReadingMode' }, ({ data }) => {
				setTabSession({ brMode: data, origin });
			});
		})();

		runTimeHandler.runtime.onMessage.addListener((request, sender, sendResponse) => {
			Logger.logInfo('PopupMessageListenerFired');

			switch (request.message) {
				case 'setIconBadgeText': {
					setTabSession((oldTabSession) => ({
						...oldTabSession,
						brMode: request.data,
					}));
					break;
				}
				default: {
					break;
				}
			}
		});

		let footerInterval;

		setTimeout(() => {
			setFooterMeessageIndex(nextMessageIndex);

			footerInterval = setInterval(() => {
				setFooterMeessageIndex(nextMessageIndex);
			}, SHOW_FOOTER_MESSAGE_DURATION);
		}, FOOT_MESSAGAES_ANIMATION_DELAY);

		return () => {
			clearInterval(footerInterval);
		};
	}, []);

	const toggleShowBeta = (showBeta = !appConfigPrefs?.showBeta) => {
		setAppConfigPrefs({ ...appConfigPrefs, showBeta });
	};

	return (
		<>
			<div className={`jr_wrapper_container ${appConfigPrefs?.displayColorMode}-mode text-capitalize`}>
				<div className="popup-body || flex flex-column || text-alternate">
					<div
						className="toolbar || flex w-100 gap-2 || bg-primary"
						style={{ boxShadow: '0 0 0 10px var(--bg-secondary)', position: 'sticky', top: '10px', zIndex: '1' }}>
						<span className="icon">
							<img src={jiffyLogo} alt="logo" height={25} width={25} />
						</span>
						<div className="flex text-capitalize" style={{ color: 'white' }}>
							JiffyReader.
						</div>
					</div>
					<div className="flex p-1">
						<label htmlFor="showBetaCheckbox">Enable beta</label>
						<input id="showBetaCheckbox" type="checkbox" checked={appConfigPrefs?.showBeta} onChange={(e) => toggleShowBeta(e.target.checked)} />
					</div>

					{/* display goes here */}
					<div style={badCapScroll}>
						<DisplayVersion displayVersion={!appConfigPrefs?.showBeta ? 'old' : 'new'} />
					</div>
				</div>
			</div>
		</>
	);
}

function PopupShell() {
	return (
		<PopupContextProvider>
			<IndexPopup />
		</PopupContextProvider>
	);
}

export default PopupShell;
