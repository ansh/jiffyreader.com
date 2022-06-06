import { defaultPrefs } from '../Preferences';
import contentStyle from '../ContentScript/contentStyle.scss';
import { setReadingMode, addStyles } from '../ContentScript';

const { saccadesInterval, fixationStrength } = { ...defaultPrefs, fixationStrength: 3 };

document.body.setAttribute('saccades-interval', saccadesInterval);
document.body.setAttribute('fixation-strength', fixationStrength);

document.body.classList.toggle('br-bold');

addStyles(contentStyle.toString());

setReadingMode(document.body.classList.contains('br-bold'));
