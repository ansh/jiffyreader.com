import { useEffect } from 'react';


import usePrefs from '~usePrefs';
import useTabSession from '~useTabSession';

import Logger from '../../../src/Logger';
import '../../../src/style.css';
import TabHelper from '../../../src/TabHelper';


function IndexPopup() {
	const [prefs, setPrefs] = usePrefs(async () => await TabHelper.getTabOrigin());
	const [tabSession, setTabSession] = useTabSession(
		async () => await TabHelper.getTabOrigin(),
		async () => await TabHelper.getActiveTab(),
		prefs
	);

	useEffect(() => {
		if (!tabSession || !prefs) return;
		Logger.logInfo('popup running', { tabSession, prefs });
	}, [tabSession, prefs]);

	const makeUpdateChangeEventHandler =
		(field: string) =>
		(event, customValue = null) =>
			updateConfig(field, customValue ?? event.target.value);

	const updateConfig = (key: string, value: any, configLocal = prefs) => {
		const newConfig = { ...configLocal, [key]: value };

		// setPrefs((oldPrefs) => ({ ...oldPrefs, ...newConfig }));
		setPrefs(async () => TabHelper.getTabOrigin(), newConfig.scope, newConfig);
	};

	const handleToggle = (newBrMode: boolean) => {
		setTabSession((oldTabSession) => ({ ...oldTabSession, [tabSession.tabID]: { ...tabSession, brMode: newBrMode } }));
	};

	return !(prefs && tabSession) ? (
		<div className="flex flex-column m-auto">Loading</div>
	) : (
		<div
			className="popup-container flex flex-column  | gap-2 p-4"
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
				onClick={() => handleToggle(!tabSession?.brMode)}>
				{tabSession?.brMode ? 'Disable' : 'Enable'} Reading Mode
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
							<option value={index + 1} label={'' + (index )}></option>
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
						<option value="0" label="off"></option>
						<option value="20" label="20"></option>
						<option value="40" label="40"></option>
						<option value="60" label="60"></option>
						<option value="80" label="80"></option>
						<option value="100" label="100"></option>
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
					<option id="colorOriginal" value="">
						Original
					</option>
					<option id="colorLight" value="light">
						Light
					</option>
					<option id="colorLight100" value="light-100">
						Light-100
					</option>
					<option id="colorDark" value="dark">
						Dark
					</option>
					<option id="colorDark100" value="dark-100">
						Dark-100
					</option>
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
					<option id="styleBold" value="bold-400">
						Bold-400
					</option>
					<option id="styleBold" value="bold-500">
						Bold-500
					</option>
					<option id="styleBold" value="bold-600">
						Bold-600
					</option>
					<option id="styleBold" value="bold-700">
						Bold-700
					</option>
					<option id="styleBold" value="bold-800">
						Bold-800
					</option>
					<option id="styleBold" value="bold-900">
						Bold-900
					</option>
					<option id="styleSolidLine" value="solid-line">
						Solid-line
					</option>
					<option id="styleDashLine" value="dashed-line">
						Dash-line
					</option>
					<option id="styleDottedLine" value="dotted-line">
						Dotted-line
					</option>
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
	);
}

export default IndexPopup;
