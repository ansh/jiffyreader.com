import { useEffect, useState, type CSSProperties } from 'react';

import Logger from '~services/Logger';
import TabHelper from '~services/TabHelper';

import './../styles/style.scss';
import './style.scss';

import { useStorage } from '@plasmohq/storage';
import type { TabSession } from 'index';

import { APP_PREFS_STORE_KEY, STORAGE_AREA } from '~services/config';
import documentParser from '~services/documentParser';
import runTimeHandler from '~services/runTimeHandler';
import TrackEventService, { EventCategory } from '~services/TrackEventService';

import { envService } from '~services/envService';
import PopupContextProvider from './context';
import IndexPopupNew from './indexNew';
import IndexPopupOld from './indexOld';

const badCapScroll: CSSProperties = /safari/i.test(envService.PLASMO_PUBLIC_TARGET) ? { overflowY: 'scroll', height: '600px' } : {};

const PopupVersions = {
	new: IndexPopupNew,
	old: IndexPopupOld,
};
const DisplayVersion = ({ displayVersionKey }: { displayVersionKey: keyof typeof PopupVersions }) => {
	const PopupVersion = PopupVersions[displayVersionKey];
	return <PopupVersion />;
};

const popupLogStyle = 'background:cyan;color:brown';

const jiffyLogo = chrome.runtime.getURL('./assets/icon512.png');

const SHOW_FOOTER_MESSAGE_DURATION = 12_000;
const FOOT_MESSAGAES_ANIMATION_DELAY = 300;
const FIRST_FOOTER_MESSAGE_INDEX = 1;

function IndexPopup() {
	const [, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
	const [footerMessageIndex, setFooterMeessageIndex] = useState<number | null>(null);

	const [tabSession, setTabSession] = useState<TabSession | null>(null);

	const [appConfigPrefs, setAppConfigPrefs] = useStorage({
		key: APP_PREFS_STORE_KEY,
		area: STORAGE_AREA,
	});

	const footerMessagesLength = 3;

	const nextMessageIndex = (oldFooterMessageIndex: typeof footerMessageIndex) =>
		typeof oldFooterMessageIndex !== 'number' ? FIRST_FOOTER_MESSAGE_INDEX : (oldFooterMessageIndex + 1) % footerMessagesLength;

	useEffect(() => {
		if (!tabSession) return;

		documentParser.setReadingMode(tabSession.brMode, document, '');
	}, [tabSession]);

	useEffect(() => {
		TrackEventService.trackEvent({ eventCategory: EventCategory.USER_EVENT, eventName: 'open-popup', eventType: 'click' });

		(async () => {
			const _activeTab = await TabHelper.getActiveTab(true);
			setActiveTab(_activeTab);
			Logger.logInfo('%cactiveTab', popupLogStyle, _activeTab);

			const origin = await TabHelper.getTabOrigin(_activeTab);

			_activeTab.id &&
				chrome.tabs.sendMessage(_activeTab.id, { type: 'getReadingMode' }, ({ data }) => {
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

		let footerInterval: NodeJS.Timer;

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
					<div className="toolbar || flex w-100 gap-2 || bg-primary" style={{ boxShadow: '0 0 0 10px var(--bg-secondary)', position: 'sticky', top: '10px', zIndex: '1' }}>
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
						<DisplayVersion displayVersionKey={!appConfigPrefs?.showBeta ? 'old' : 'new'} />
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
