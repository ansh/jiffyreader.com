const { sassPlugin } = require('esbuild-sass-plugin');
const { build } = require('esbuild');
const fs = require('fs');

const defaultConfigs = {
  bundle: true,
  minify: true,
  write: false,
  plugins: [sassPlugin({ type: 'css-text' })],
};

const outputFile = './extension/bookmarklet.html';

build({
  entryPoints: ['./src/Bookmarklet/index.js'],
  ...defaultConfigs,
})
  .then(({ outputFiles: [res] }) => {
    const outputScript = res.text.replace(/\n/g, '');
    fs.writeFileSync(
      outputFile,
      `
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireReadingToggle')};'>Toggle JiffyReader</a>
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireFixationStrengthTransition')};' aria-role="button" aria-description="toggle fixation strength">Toggle FixationStrength</a>
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireSaccadesIntervalTransition')};' aria-role="button" aria-description="toggle saccades interval">Toggle SaccadesInterval</a>
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireSaccadesColorTransition')};' aria-role="button" aria-description="toggle saccades color">Toggle SaccadesColor</a>
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireFixationStemOpacityTransition')};' aria-role="button" aria-description="toggle fixation stem opacity">Toggle FixationStemOpacity</a>
      <p>Drag any of the links above onto your bookmark bar to save it as a bookmarklet which works on any site just like the full extension</p>
      
  `,
    );
  })
  .catch(() => process.exit(1));
