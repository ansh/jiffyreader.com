import { useEffect, useState } from 'react';

import Logger from '~services/Logger';
import runTimeHandler from '~services/runTimeHandler';

export function useShortcut() {
	const [shortcut, setShortcut] = useState(undefined);

	const getShortcut = () => {
		runTimeHandler.runtime
			.sendMessage({ message: 'getShortcut' })
			.then((shortcutResponse) => setShortcut(shortcutResponse))
			.catch(Logger.logError);
	};

	useEffect(getShortcut, []);

	return shortcut;
}
export function ShortcutGuide() {
	const shortcutGuide = (
		<a href="https://jiffyreader.com/api/destinations/readme_shortcut" target="_blank">
			How to setup custom shortcut
		</a>
	);
	const shortcut = useShortcut();
	return shortcut ? <></> : shortcutGuide;
}

export default function Shortcut({ scope = 'new' }: { scope: 'new' | 'old' }) {
	const shortcut = useShortcut();

	if (!shortcut) {
		return <></>;
	}

	if (scope === 'old') {
		return (
			<span>
				{chrome.i18n.getMessage('defaultShortcutLabelText')}:{' '}
				{/* {chrome.i18n.getMessage(/firefox/i.test(process.env.TARGET) ? 'defaultShortcutValueTextFirefox' : 'defaultShortcutValueTextChrome')} */}
				{shortcut}
			</span>
		);
	}

	if (scope === 'new') {
		return (
			<span>
				{chrome.i18n.getMessage('defaultShortcutLabelText')}:
				{/* {chrome.i18n.getMessage(/firefox/i.test(process.env.TARGET) ? 'defaultShortcutValueTextFirefox' : 'defaultShortcutValueTextChrome')} */}
				{shortcut}
			</span>
		);
	}

	return <div></div>;
}
