// default preferences
// and source of truth
// for both global and local prefs
// so new preferences should be
// added here

const defaultPrefs = {
	onPageLoad: false,
	scope: 'global',
	lineHeight: 1,
	edgeOpacity: 70,
	saccadesColor: '',
	saccadesStyle: 'bold-600',
	saccadesInterval: 0,
	fixationStrength: 2,
	fixationEdgeOpacity: 80,
	MAX_FIXATION_PARTS: 4,
	FIXATION_LOWER_BOUND: 0,
	BR_WORD_STEM_PERCENTAGE: 0.7,
	displayColorMode: 'light',
	showBeta: true,
	transformControlPanelText: false,
	autoOnDelay: 5_000,
	showContentDebugOverlay: false,
	symanticTags: {
		nav: true,
		footer: true,
		aside: true,
		a: true,
		button: true,
		p: true,
		pre: true,
		span: true,
		code: true,
		caption: true,
		li: true,
		ul: true,
		ol: true,
		dialog: true,
	},
	saccadesColorOverides: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'], // Add default saccadesColors must match MAX_FIXATION_PARTS
	useUserColorOverides: false, // Add default useUserColors
};

export default defaultPrefs;
