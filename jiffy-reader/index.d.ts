interface Prefs {
	onPageLoad: boolean
	scope: string //"global" | "local"
	lineHeight: number
	edgeOpacity: number
	saccadesColor: string
	saccadesStyle: string
	saccadesInterval: number
	fixationStrength: number
	fixationEdgeOpacity: number
	MAX_FIXATION_PARTS: number
	FIXATION_LOWER_BOUND: number
	BR_WORD_STEM_PERCENTAGE: number
}

interface PrefStore {
	global: Prefs
	local: Prefs[]
}

interface TabSession {
	brMode: boolean,
	origin: string
}
