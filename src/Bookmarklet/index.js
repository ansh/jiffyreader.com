import documentParser from '../ContentScript/documentParser';
import { defaultPrefs } from '../Preferences';

const { saccadesInterval, fixationStrength } = { ...defaultPrefs, fixationStrength: 3 };

document.body.setAttribute('saccades-interval', saccadesInterval);
document.body.setAttribute('fixation-strength', fixationStrength);

document.body.classList.toggle('br-bold');

documentParser.setReadingMode(document.body.classList.contains('br-bold'));