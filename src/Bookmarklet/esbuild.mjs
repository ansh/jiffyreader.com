import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs';

const /** @type {import('esbuild').BuildOptions} */ defaultConfigs = {
		bundle: true,
		minify: true,
		write: false,
		plugins: [sassPlugin({ type: 'css-text' })],
		define: { 'envService.DEBUG': '"false"' },
		tsconfig: './tsconfig.json',
	};

const outputFile = './build/jiffyReader-bookmarklet.html';

const makeLinkBtn = (/** @type {string} */ textContent, /** @type {string} */ injectableScript) => {
	return `<a href='javascript:${injectableScript};' aria-role='button'>${textContent}</a>`;
};

build({
	entryPoints: ['./src/Bookmarklet/index.ts'],
	...defaultConfigs,
})
	.then(({ outputFiles: [res] }) => {
		const outputScript = res.text.replace(/\n/g, '');
		const output = [
			...[
				['JiffyReader Toggle', 'fireReadingToggle'],
				['FixationStrength Toggle', 'fireFixationStrengthTransition'],
				['SaccadesInterval Toggle', 'fireSaccadesIntervalTransition'],
				['SaccadesColor Toggle', 'fireSaccadesColorTransition'],
				['FixationEdgeOpacity Toggle', 'firefixationEdgeOpacityTransition'],
			].map(([textContent, eventKey]) => makeLinkBtn(textContent, outputScript.replace('ACTION_TO_FIRE', eventKey))),

			'<p>Drag any of the links above onto your bookmark bar to save it as a bookmarklet which works on any site just like the full extension</p>',
		].join(' ');

		fs.writeFileSync(outputFile, output);
	})
	.catch((error) => {
		console.error(error);
		console.trace(error);
		process.exit(1);
	});
