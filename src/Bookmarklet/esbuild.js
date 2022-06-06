const { sassPlugin } = require('esbuild-sass-plugin');
const { build } = require('esbuild');
const fs = require('fs');

const outputFile = './extension/bookmarklet.html';

build({
  entryPoints: ['./src/Bookmarklet/index.js'],
  bundle: true,
  minify: true,
  write: false,
  plugins: [sassPlugin({ type: 'css-text' })],
})
  .then(({ outputFiles: [res] }) => {
    const outputText = res.text.replace(/\n/g, '');
    fs.writeFileSync(
      outputFile,
      `<a href='javascript:${outputText}'>Toggle JiffyReader</a>
      <br>
      <p>Drag the link above onto your bookmark bar to save it as a bookmarklet which works on any site just like the full extension</p>
  `,
    );
  })
  .catch(() => process.exit(1));
