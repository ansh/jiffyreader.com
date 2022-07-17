(() => {
  /** @typedef {{(element: Element)=> boolean}} Excluder */

  let /** @type {NodeObserver} */ tempObserver;

  const { MAX_FIXATION_PARTS, FIXATION_LOWER_BOUND, BR_WORD_STEM_PERCENTAGE } = {
    MAX_FIXATION_PARTS: 4,
    FIXATION_LOWER_BOUND: 0,
    BR_WORD_STEM_PERCENTAGE: 0.33,
  };

  const Logger = (() => ({
    logInfo: console.log,
  }))();

  class NodeObserver {
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

  const siteElementExclusions = {
    'twitter.com': ['div.DraftEditor-root'],
    'youtube.com': ['.ytd-commentbox', 'ytd-commentbox'],
    'play.google.com': ['.mat-icon-button', 'mat-icon', 'mat-icon-button', '.mat-button-wrapper'],
  };

  /** @returns {Excluder} */
  const makeExcluder = (/** @type string */ origin) => {
    Logger.logInfo('makeExcluder', origin);

    const [, exclusions] = Object.entries(siteElementExclusions).find(([domain]) => new RegExp(domain, 'i').test(origin)) ?? [null, []];
    return (/** @type Element */ element) => {
      const result = exclusions.filter((exclusion) => element.closest(exclusion));
      return result.length;
    };
  };

  const siteExcluder = makeExcluder(origin);

  // which tag's content should be ignored from bolded
  const IGNORE_NODE_TAGS = [
    'STYLE',
    'SCRIPT',
    'BR-SPAN',
    'BR-FIXATION',
    'BR-BOLD',
    'BR-EDGE',
    'SVG',
    'INPUT',
    'TEXTAREA',
  ];
  const MUTATION_TYPES = ['childList', 'characterData'];

  // // making half of the letters in a word bold
  // function highlightText(sentenceText) {
  //   return sentenceText.replace(/\p{L}+/gu, (word) => {
  //     const { length } = word;
  //     let midPoint = 1;
  //     if (length > 3) midPoint = Math.round(length / 2);
  //     const firstHalf = word.slice(0, midPoint);
  //     const secondHalf = word.slice(midPoint);
  //     const htmlWord = `<br-bold>${firstHalf}</br-bold>${secondHalf}`;
  //     return htmlWord;
  //   });
  // }

  function makeFixations(/** @type string */ textContent) {
    const COMPUTED_MAX_FIXATION_PARTS =
      textContent.length >= MAX_FIXATION_PARTS ? MAX_FIXATION_PARTS : textContent.length;

    const fixationWidth = Math.ceil(textContent.length * (1 / COMPUTED_MAX_FIXATION_PARTS));

    if (fixationWidth === FIXATION_LOWER_BOUND) {
      return `<br-fixation fixation-strength="1">${textContent}</br-fixation>`;
    }

    const fixationsSplits = new Array(COMPUTED_MAX_FIXATION_PARTS).fill(null).map((item, index) => {
      const wordStartBoundary = index * fixationWidth;
      const wordEndBoundary =
        wordStartBoundary + fixationWidth > textContent.length
          ? textContent.length
          : wordStartBoundary + fixationWidth;

      return `<br-fixation fixation-strength="${index + 1}">${textContent.slice(
        wordStartBoundary,
        wordEndBoundary,
      )}</br-fixation>`;
    });

    return fixationsSplits.join('');
  }

  // making half of the letters in a word bold
  function highlightText(sentenceText) {
    return sentenceText.replace(/\p{L}+/gu, (word) => {
      const { length } = word;

      const brWordStemWidth = length > 3 ? Math.round(length * BR_WORD_STEM_PERCENTAGE) : length;

      const firstHalf = word.slice(0, brWordStemWidth);
      const secondHalf = word.slice(brWordStemWidth);
      const htmlWord = `<br-bold>${makeFixations(firstHalf)}</br-bold>${
        secondHalf.length ? `<br-edge>${secondHalf}</br-edge>` : ''
      }`;
      return htmlWord;
    });
  }

  function mutationCallback(/** @type MutationRecord[] */ mutationRecords) {
    if (!document.body.classList.contains('br-bold')) {
      Logger.logInfo('mutation cold');
      return;
    }
    const body = mutationRecords[0]?.target?.parentElement?.closest('body');
    if (
      body && ['textarea:focus', 'input:focus'].filter((query) => body?.querySelector(query)).length
    ) {
      Logger.logInfo('focused or active input found, exiting mutationCallback');
      return;
    }

    Logger.logInfo('mutationCallback fired ', mutationRecords.length, mutationRecords);
    mutationRecords.forEach(({ type, addedNodes, target }) => {
      if (!MUTATION_TYPES.includes(type)) {
        return;
      }

      // Some changes don't add nodes
      // but values are changed
      // To account for that,
      // recursively parse the target node as well
      // parseNode(target);
      [...addedNodes, target]?.filter((node) => !ignoreOnMutation(node))?.forEach(parseNode);
    });
  }

  function ignoreOnMutation(node) {
    return node?.parentElement?.closest('[br-ignore-on-mutation]');
  }

  function parseNode(/** @type Element */ node) {
    // some websites add <style>, <script> tags in the <body>, ignore these tags
    if (!node?.parentElement?.tagName || IGNORE_NODE_TAGS.includes(node.parentElement.tagName)) {
      return;
    }

    if (node?.parentElement?.closest('body') && siteExcluder(node?.parentElement)) {
      node.parentElement.setAttribute('br-ignore-on-mutation', 'true');
      Logger.logInfo('found node to exclude', node, node.parentElement);
      return;
    }

    if (ignoreOnMutation(node)) {
      Logger.logInfo('found br-ignore-on-mutation', 'skipping');
      return;
    }

    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
      try {
        const brSpan = document.createElement('br-span');

        brSpan.innerHTML = highlightText(node.nodeValue);

        if (brSpan.childElementCount === 0) return;

        // to avoid duplicates of brSpan, check it if
        // this current textNode has a left sibling of br span
        // we know that is possible because
        // we will specifically insert the br-span
        // on the left of a text node, and keep
        // the text node alive later. so if we get to
        // this text node again. that means that the
        // text node was updated and the br span is now stale
        // so remove that if exist
        if (node.previousSibling?.tagName === 'BR-SPAN') {
          node.parentElement.removeChild(node.previousSibling);
        }

        // dont replace for now, cause we're keeping it alive
        // below
        // node.parentElement.replaceChild(brSpan, node);

        // keep the textNode alive in the dom, but
        // empty it's contents
        // and insert the brSpan just before it
        // we need the text node alive because
        // youtube has some reference for it internally
        // and we want to listen to it when it changes
        node.parentElement.insertBefore(brSpan, node);
        node.textContent = '';
      } catch (error) {
        Logger.logError(error);
      }
      return;
    }

    if (node.hasChildNodes()) [...node.childNodes].forEach(parseNode);
  }

  function main() {
    // check if we have already highlighted the text
    const boldedElements = document.getElementsByTagName('br-bold');

    // only add br bold to body element
    document.body.classList.toggle('br-bold');

    if (boldedElements.length) {
      // end if no br-bold elements found on the page
      return;
    }

    /*
     *setting global styles with options for saccades interval between 0 and 4 words to the
     *next saccade
     */

    if (!document.querySelector('style[br-style]')) {
      const style = document.createElement('style');
      style.setAttribute('br-style', '');
      style.textContent = `
        .br-bold :is(
          [saccades-interval="0"] br-bold, 
          [saccades-interval="1"] br-bold:nth-of-type(2n+1),
          [saccades-interval="2"] br-bold:nth-of-type(3n+1),
          [saccades-interval="3"] br-bold:nth-of-type(4n+1),
          [saccades-interval="4"] br-bold:nth-of-type(5n+1)
          ) { 
          font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); 
        }
        `;
      document.head.appendChild(style);
    }

    const tags = ['body'];

    // const parser = new DOMParser();
    tags.forEach((tag) => {
      for (const element of document.getElementsByTagName(tag)) {
        [...element.childNodes].map(parseNode);
      }
    });

    if (!document.body.hasAttribute('br-processed')) {
      document.body.setAttribute('br-processed', 'on');
      Logger.logInfo('fire observer');
      tempObserver = new NodeObserver(document.body, null, mutationCallback);
      tempObserver.observe();
    }
  }

  main();
})();
