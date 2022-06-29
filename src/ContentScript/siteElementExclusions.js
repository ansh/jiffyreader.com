/** @typedef {{(element: Element)=> boolean}} Excluder */

import Logger from '../Logger';

const siteElementExclusions = {
  'twitter.com': ['div.DraftEditor-root'],
};

/** @returns {Excluder} */
export const makeExcluder = (/** @type string */ origin) => {
  Logger.logInfo('makeExcluder', origin);

  const [, exclusions] = Object.entries(siteElementExclusions).find(([domain]) => new RegExp(domain, 'i').test(origin)) ?? [null, []];
  return (/** @type Element */ element) => {
    const result = exclusions.filter((exclusion) => element.closest(exclusion));
    return result.length;
  };
};

export default {
  makeExcluder,
};
