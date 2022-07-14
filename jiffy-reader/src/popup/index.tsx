import { useEffect, useState } from 'react';

import usePrefs from '~usePrefs';

import documentParser from '../../../src/ContentScript/documentParser';
import Logger from '../../../src/Logger';
import TabHelper from '../../../src/TabHelper';
import '../../../src/style.css';

const SACCADE_COLORS = [
	['Original', ''],
	['Light', 'light'],
	['Light-100', 'light-100'],
	['Dark', 'dark'],
	['Dark-100', 'dark-100']
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
	'Dotted-line'
];

const FIXATION_OPACITY_STOPS = 5;
const FIXATION_OPACITY_STOP_UNIT_SCALE = Math.floor(100 / FIXATION_OPACITY_STOPS);

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const setAttribute = (attribute, value, doc = document) => document.body.setAttribute(attribute, value);
const getAttribute = (attribute, doc = document) => document.body.getAttribute(attribute);
const setProperty = (property, value, doc = document) => document.body.style.setProperty(property, value);
const getProperty = (property, doc = document) => document.body.style.getPropertyValue(property);

const setSaccadesStyle = (style) => {
	Logger.logInfo('saccades-style', style);

	if (/bold/i.test(style)) {
		const [, value] = style.split('-');
		setProperty('--br-boldness', value);
		setProperty('--br-line-style', '');
	}

	if (/line$/i.test(style)) {
		const [value] = style.split('-');
		setProperty('--br-line-style', value);
		setProperty('--br-boldness', '');
	}
};

function IndexPopup() {
	const [prefs, setPrefs] = usePrefs(async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)));

	const [tabSession, setTabSession] = useState<TabSession>(null);

	useEffect(() => {
		Logger.logInfo('popup running', { tabSession, prefs });
		if (!tabSession || !prefs) return;

		documentParser.setReadingMode(tabSession.brMode, document);
		setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%'), document;
		setProperty('--br-line-height', prefs.lineHeight);
		setSaccadesStyle(prefs.saccadesStyle);
		setAttribute('saccades-color', prefs.saccadesColor, document);
		setAttribute('fixation-strength', prefs.fixationStrength);
		setAttribute('saccades-interval', prefs.saccadesInterval, document);
	}, [tabSession, prefs]);

	useEffect(() => {
		(async () => {
			const brMode = chrome.tabs.sendMessage(
				(await TabHelper.getActiveTab(true)).id,
				{
					type: 'getReadingMode'
				},
				({ data }) => {
					setTabSession({ brMode: data });
				}
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

		setPrefs(async () => TabHelper.getTabOrigin(), newConfig.scope, newConfig);
	};

	const handleToggle = (newBrMode: boolean) => {
		const payload = {
			type: 'setReadingMode',
			message: 'setIconBadgeText',
			data: newBrMode
		};

		setTabSession({ brMode: newBrMode });
		runTimeHandler.runtime.sendMessage(payload, () => Logger.LogLastError());

		TabHelper.getActiveTab(true).then((tab) => chrome.tabs.sendMessage(tab.id, payload, () => Logger.LogLastError()));
	};

	const showDebugInline = (environment = 'production') => {
		if (/production/i.test(environment)) return;

		return (
			<>
				<span>{JSON.stringify(tabSession)}</span>
				<span>{JSON.stringify(prefs)}</span>
			</>
		);
	};

	return (
		<>
			<div className=" popup-body flex flex-column">
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
							<span className="mb-md">Preference: </span>
							<div className="flex w-100 justify-between">
								<div className="w-100 pr-mr">
									<button
										id="globalPrefsBtn"
										data-scope="global"
										className={`flex flex-column align-items-center w-100 ${/global/i.test(prefs.scope) ? 'selected' : ''}`}
										onClick={(event) => updateConfig('scope', 'global')}>
										Global
										<span className="text-sm pt-sm">Default</span>
									</button>
								</div>
								<div className="w-100 pl-md">
									<button
										id="localPrefsBtn"
										data-scope="local"
										className={`flex flex-column align-items-center w-100 ${/local/i.test(prefs.scope) ? 'selected' : ''}`}
										onClick={(event) => updateConfig('scope', 'local')}>
										Site
										<span className="text-sm pt-sm">For this site</span>
									</button>
								</div>
							</div>
						</div>

						<button
							id="readingModeToggleBtn"
							className={`w-100 flex flex-column align-items-center ${tabSession?.brMode ? 'selected' : ''}`}
							onClick={() => handleToggle(!tabSession.brMode)}>
							{tabSession.brMode ? <span>Disable</span> : <span>Enable</span>} Reading Mode
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
								Fixations strength: <span id="fixationStrengthLabelValue">{prefs.fixationStrength}</span>
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
								Fixations edge opacity %: <span id="fixationOpacityLabelValue">{prefs.fixationEdgeOpacity}</span>
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
											<option key={`opacity-stop-${value}`} value={value} label={value + ''}></option>
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
							className={`w-100 flex flex-column align-items-center ${prefs.onPageLoad ? 'selected' : ''}`}
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

						<footer className="flex justify-between text-center text-md text-bold">
							<a className="text-white" href="https://github.com/ansh/jiffyreader.com#FAQ" target="_blank">
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
		</>
	);
}

export default IndexPopup;
