import type { TabSession } from 'index';
import { envService } from '~services/envService';
import usePrefs, { usePrefStorage } from '~services/usePrefs';
import { useShowDebugSwitch } from './shorcut';
import { useGetTabOriginCb } from './useGetTabOriginCb';

export function ShowDebugInline({ tabSession }: { tabSession: TabSession }) {
	const [isDebugDataVisible, setIsDebugDataVisible] = useShowDebugSwitch();

	// const [prefs,setPrefs] = usePrefs(async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)), true, envService.PLASMO_PUBLIC_TARGET);
	const [prefs, , setPrefs] = usePrefs(useGetTabOriginCb(), true, envService.PLASMO_PUBLIC_TARGET);

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
			<div className="flex flex-row || justify-between">
				<label htmlFor="isDebugDataVisibleInput">
					Show
					<input
						type="checkbox"
						name="isDebugDataVisibleInput"
						id="isDebugDataVisibleInput"
						onChange={(event) => setIsDebugDataVisible(event.currentTarget.checked)}
						checked={isDebugDataVisible}
					/>
				</label>

				{!envService.isProduction && (
					<label>
						ContentOverlay
						<input type="checkbox" onChange={(event) => setPrefs('showContentDebugOverlay', event.target.checked)} />
					</label>
				)}
			</div>
			{isDebugDataVisible && debugData}
		</div>
	);
}
