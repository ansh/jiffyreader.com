/**
 * provide style overrides by domain
 *
 */
import Logger from '~services/Logger';

const siteOverrides = {
  'play.google.com': `[br-mode="on"] reader-rendered-page { overflow: auto !important; }`,
};

const getSiteOverride = (url: string) => {
  Logger.logInfo('siteOverrides check url:', url);
  return Object.entries(siteOverrides).filter(([domain]) => RegExp(domain, 'i').test(url)).map(([,style]) => style).join('');
};

export default {
  getSiteOverride,
};
