import babel from '@babel/core';

import path from 'path';
import fs from 'fs';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const filePath = path.join(__dirname, '../src/ContentScript/index.js');
const destinationPath = path.join(__dirname, '../output/Bookmarklet.js');
const code = fs.readFileSync(filePath, { encoding: 'utf8' });

const wrapBookmarklet = (innerCode) => `javascript:{${innerCode}; ToggleReading();}`;

const result = babel.transformSync(code, { minified: true, comments: false });

const bookmarkletContent = wrapBookmarklet(result.code);
fs.writeFileSync(destinationPath, bookmarkletContent, { encoding: 'utf8' });
