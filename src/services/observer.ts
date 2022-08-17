export default class NodeObserver {
	#DEFAULT_MUTATION_OPTIONS = { childList: true, subtree: true, characterData: true };

	/** @type MutationObserver */
	#observer;

	/** @type MutationCallback */
	#callback;

	/** @type OberverOptions */
	#options;

	/** @type Node */
	#target;

	constructor(target, options, /** @type MutationCallback */ callback) {
		this.#observer = new MutationObserver(callback);
		this.#options = options ?? this.#DEFAULT_MUTATION_OPTIONS;
		this.#target = target;
	}

	observe() {
		this.#observer.observe(this.#target, this.#options);
	}

	destroy() {
		this.#observer.disconnect();
	}
}
