import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs';

const /** @type {import('esbuild').BuildOptions} */ defaultConfigs = {
		bundle: true,
		minify: true,
		write: false,
		plugins: [sassPlugin({ type: 'css-text' })],
		define: {
			'process.env.PLASMO_PUBLIC_SHORTCUT': `'${process.env.PLASMO_PUBLIC_SHORTCUT}'`,
			'process.env.PLASMO_PUBLIC_VERSION': `'${process.env.PLASMO_PUBLIC_VERSION}'`,
			'process.env.PLASMO_PUBLIC_VERSION_NAME': `'${process.env.PLASMO_PUBLIC_VERSION_NAME}'`,
			'process.env.PLASMO_PUBLIC_TARGET': `'${process.env.PLASMO_PUBLIC_TARGET}'`,
			'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
			'process.env.PLASMO_PUBLIC_DEBUG': `'${process.env.PLASMO_PUBLIC_DEBUG ?? 'FALSE'}'`,
			'process.env.PLASMO_PUBLIC_ENABLE_TRACKING': `'${process.env.PLASMO_PUBLIC_ENABLE_TRACKING ?? 'FALSE'}'`,
			'process.env.PLASMO_PUBLIC_HOME_URL': `'${process.env.PLASMO_PUBLIC_HOME_URL}'`,
		},
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
		const buttons = [
			...[
				['JiffyReader Toggle', 'fireReadingToggle'],
				['FixationStrength Toggle', 'fireFixationStrengthTransition'],
				['SaccadesInterval Toggle', 'fireSaccadesIntervalTransition'],
				['SaccadesColor Toggle', 'fireSaccadesColorTransition'],
				['FixationEdgeOpacity Toggle', 'firefixationEdgeOpacityTransition'],
			].map(([textContent, eventKey]) => makeLinkBtn(textContent, outputScript.replace('ACTION_TO_FIRE', eventKey))),

			`<p>Drag any of the links above onto your bookmark bar to save it as a bookmarklet which works on any site just like the full extension <br/>Version: ${process.env.PLASMO_PUBLIC_VERSION}</p>`,
		].join(' ');

		const output = `<div style='display: block grid; grid-template-columns: repeat(5,1fr);grid-template-rows: repeat(2,40px);'>${buttons}<div></div>`;

		fs.writeFileSync(outputFile, output);
	})
	.catch((error) => {
		console.error(error);
		console.trace(error);
		process.exit(1);
	});
