import defaultPrefs from '~services/preferences';
import usePrefs from '~services/usePrefs';
import { useGetTabOriginCb } from './useGetTabOriginCb';

export function HtmlNodeToggles() {
	const [prefs, , updateConfig] = usePrefs(useGetTabOriginCb(), false);
	const _label = chrome.i18n.getMessage('symanticElementsLabel');

	if (!prefs) return <></>;

	return (
		<div className=" flex flex-column || gap-2  || w-100 p-2">
			<label className="block text-capitalize mb-sm" id="symanticElementsLabel">
				{_label?.length ? _label : 'Enabled Items'}
			</label>

			<div className="|| || w-100 gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
				{Object.entries({ ...defaultPrefs.symanticTags, ...prefs.symanticTags }).map(([key, value]) => (
					<div key={key} className="input-container flex">
						<input
							type="checkbox"
							id={`symanticTags-${key}`}
							checked={value}
							onChange={(event) => updateConfig(`symanticTags`, { ...prefs.symanticTags, [key]: event.target.checked })}
						/>
						<label htmlFor={`symanticTags-${key}`}>{key ?? chrome.i18n.getMessage(`symanticTags_${key}`)}</label>
					</div>
				))}
			</div>
		</div>
	);
}
