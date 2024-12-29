import type { TabSession } from 'index';
import { envService } from '~services/envService';
import TabHelper from '~services/TabHelper';
import usePrefs, { usePrefStorage } from '~services/usePrefs';
import { useShowDebugSwitch } from './shorcut';

export function ShowDebugInline({ tabSession }: { tabSession: TabSession }) {
	const [isDebugDataVisible, setIsDebugDataVisible] = useShowDebugSwitch();

	const [prefs] = usePrefs(async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)), true, envService.PLASMO_TARGET);

	const [appConfigPrefs] = usePrefStorage();

	if (envService.isProduction) return <></>;

	const debugData = (
		<>
			<pre className="w-full" style={{ fontSize: '12px', overflow: 'auto' }}>
				tabSession {JSON.stringify({ tabSession, prefs, appConfigPrefs, envService }, null, 2)}
			</pre>
		</>
	);

	return (
		<div className=" || flex flex-column || w-full text-wrap p-1">
			<label htmlFor="isDebugDataVisibleInput">
				show
				<input
					type="checkbox"
					name="isDebugDataVisibleInput"
					id="isDebugDataVisibleInput"
					onChange={(event) => setIsDebugDataVisible(event.currentTarget.checked)}
					checked={isDebugDataVisible}
				/>
			</label>
			{isDebugDataVisible && debugData}
		</div>
	);
}
