/** @typedef {{(element: Element)=> boolean}} Excluder */
import Logger from '~services/Logger';

const siteElementExclusions = {
  'twitter.com': ['div.DraftEditor-root'],
  'youtube.com': ['.ytd-commentbox', 'ytd-commentbox'],
  'play.google.com': ['.mat-icon-button', 'mat-icon-button', '.scrubber-container', 'header>nav>a'],
  'app.grammarly.com': ['.editor-editorContainer'],
  'notion.so': ['[data-content-editable-leaf=true]','.notion-frame']
};

/** @returns {Excluder} */
export const makeExcluder = (/** @type string */ origin) => {
  Logger.logInfo('makeExcluder', origin);

  const [, exclusions] = Object.entries(siteElementExclusions).find(([domain]) =>
    new RegExp(domain, 'i').test(origin),
  ) ?? [null, []];
  return (/** @type Element */ element) => {
    const result = exclusions.filter((exclusion) => element.closest(exclusion));
    return result.length;
  };
};

export default {
  makeExcluder,
};
