const { sassPlugin } = require('esbuild-sass-plugin');
const { build } = require('esbuild');
const fs = require('fs');

const defaultConfigs = {
  bundle: true,
  minify: true,
  mode: 'development',
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
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireFixationStrengthTransition')};'>Toggle FixationStrength</a>
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireSaccadesIntervalTransition')};'>Toggle SaccadesInterval</a>
      <a href='javascript:${outputScript.replace('ACTION_TO_FIRE', 'fireSaccadesColorTransition')};'>Toggle SaccadesColor</a>
      <br>
      <p>Drag any of the links above onto your bookmark bar to save it as a bookmarklet which works on any site just like the full extension</p>
      
  `,
    );
  })
  .catch(() => process.exit(1));
