import { useEffect, useState } from 'react';

import { useStorage } from '@plasmohq/storage';

import usePrefs from '~usePrefs';
import useTabSession from '~useTabSession';

import Logger from '../../../src/Logger';
import Preferences, { Prefs, defaultPrefs } from '../../../src/Preferences/index';
import TabHelper from '../../../src/TabHelper';
import '../../../src/style.css';

const { start, setPrefs, getPrefs } = Preferences.init({
	onStartup: (prefs) => {
		Logger.logInfo('onstartup index.txs loginfo', prefs);
		// setConfig({ ...config, ...prefs })
	},
	// subscribe: (prefs) => {
	//   debugger
	//   Logger.logInfo("subscribe setConfig")
	//   setConfig({ ...config, ...prefs })
	// },
	getOrigin: async () => TabHelper.getTabOrigin()
});

function IndexPopup() {
	const [prefs, setPrefs] = usePrefs(
		async () => await TabHelper.getTabOrigin()
			// new Promise((res, rej) => {
			// 	TabHelper.getTabOrigin().then((origin) => {
			// 		Logger.logInfo('popup origin callback obtained origin', origin);
			// 		res(origin);
			// 	});
			// })
	);
	const [tabSession, setTabSession] = useTabSession(async () => await TabHelper.getTabOrigin(), prefs);

	const [openCount] = useStorage({ key: 'open-count' });
	const [config, setConfig] = useState<Prefs | null>(defaultPrefs);
	const [brMode, setBrMode] = useState('off');

	useEffect(() => {
		debugger;
		// start()
		//   .then(() => {
		//     Logger.logInfo("popup start")
		//     return getPrefs()
		//   })

		//   .then((prefs) => {
		//     Logger.logInfo("useffect prefs", prefs)
		//     setConfig(prefs)
		//   })

		Logger.logInfo('popup running', tabSession);
	}, [tabSession]);

	const updateConfig = (key: string, value: any, configLocal = config) => {
		const newConfig = { ...configLocal, [key]: value };
		setConfig(newConfig);
		setPrefs((oldPrefs) => ({ ...oldPrefs, ...newConfig }));
	};

	const handleToggle = (brMode: string) => {
		const nextMode = { on: 'off', off: 'on' }[brMode];
		// updateConfig("brMode", nextMode)
		setBrMode(nextMode);
		setTabSession({ ...tabSession, brMode });
	};

	const handleFixationStrengthChange = (event) => {
		updateConfig('fixationStrength', event.target.value);
	};

	const handleFixationEdgeOpacityChange = (event) => {
		updateConfig('fixationEdgeOpacity', event.target.value);
	};

	const handleSaccadesIntervalChange = (event) => {
		updateConfig('saccadesInterval', event.target.value);
	};

	const handleOnPageLoadDefaultChange = (scope) => {
		setPrefs(({ scope: oldScope, ...oldPrefs }) => {
			if (scope === 'local' && oldScope === 'global') {
				return {
					...oldPrefs,
					scope
				};
			}

			return {
				scope
			};
		});
		updateConfig('onPageLoad', scope);
	};

	const handleScopeChange = (event) => {
		const { scope } = event.currentTarget.dataset;
		Logger.logInfo('scopeChange to ', scope);
		updateConfig('scope', scope);
	};

	return (
		<div
			className="popup-container flex flex-column  | gap-2 p-4"
			br-mode={{ true: 'on', false: 'off' }[brMode]}
			saccades-interval={config.saccadesInterval}
			saccades-color={config.saccadesColor}
			fixation-strength={config.fixationStrength}>
			<div className="flex flex-column">
				<span className="mb-md">Preference: {openCount}</span>
				<div className="flex w-100 justify-between">
					<div className="w-100 pr-mr">
						<button
							id="globalPrefsBtn"
							data-scope="global"
							className={`flex flex-column align-items-center w-100 ${/global/i.test(config.scope) ? 'selected' : ''}`}
							onClick={handleScopeChange}>
							Global
							<span className="text-sm pt-sm">Default</span>
						</button>
					</div>
					<div className="w-100 pl-md">
						<button
							id="localPrefsBtn"
							data-scope="local"
							className={`flex flex-column align-items-center w-100 ${/local/i.test(config.scope) ? 'selected' : ''}`}
							onClick={handleScopeChange}>
							Site
							<span className="text-sm pt-sm">For this site</span>
						</button>
					</div>
				</div>
			</div>

			<button
				id="readingModeToggleBtn"
				className={`w-100 flex flex-column align-items-center ${tabSession?.brMode ? 'selected' : ''}`}
				onClick={() => handleToggle(tabSession?.brMode)}>
				{tabSession?.brMode ? 'Disable' : 'Enable'} Reading Mode
			</button>

			<div className="w-100">
				<label className="block">
					Saccades interval: <span id="saccadesLabelValue">{config.saccadesInterval}</span>
				</label>
				<div className="slidecontainer">
					<input
						type="range"
						min="0"
						max="4"
						value={config.saccadesInterval}
						onChange={handleSaccadesIntervalChange}
						className="slider w-100"
						id="saccadesSlider"
					/>
				</div>
			</div>

			<div className="w-100">
				<label className="block">
					Fixations strength: <span id="fixationStrengthLabelValue">{config.fixationStrength}</span>
				</label>
				<div className="slidecontainer">
					<input
						type="range"
						min="1"
						max="4"
						value={config.fixationStrength}
						onChange={handleFixationStrengthChange}
						className="slider w-100"
						id="fixationStrengthSlider"
					/>
				</div>
			</div>

			<div className="w-100">
				<label className="block">
					Fixations edge opacity %: <span id="fixationOpacityLabelValue">{config.fixationEdgeOpacity}</span>
				</label>
				<div className="slidecontainer">
					<input
						type="range"
						min="0"
						max="100"
						value={config.fixationEdgeOpacity}
						onChange={handleFixationEdgeOpacityChange}
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

				<select name="saccadesColor" id="saccadesColor" className="p-2">
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

				<select name="saccadesStyle" id="saccadesStyle" className="p-2">
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
					<button id="lineHeightDecrease" data-op="decrease" className="mr-md w-100">
						<span className="block">Aa</span>
						<span className="text-sm">Smaller</span>
					</button>
					<button id="lineHeightIncrease" data-op="increase" className="ml-md w-100">
						<span className="block text-bold">Aa</span>
						<span className="text-sm">Larger</span>
					</button>
				</div>
			</div>

			<button
				id="onPageLoadBtn"
				className="w-100 flex flex-column align-items-center"
				onClick={handleOnPageLoadDefaultChange}>
				<span className="text-bold">
					Always <span id="onPageLoadLabel"> {{ true: 'On', false: 'Off' }[config.onPageLoad]}</span>
				</span>
				<span className="text-sm pt-sm">Default Toggle Preference</span>
			</button>

			<button
				id="resetDefaultsBtn"
				className="w-100 flex flex-column align-items-center"
				style={{ marginBottom: '25px' }}>
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
