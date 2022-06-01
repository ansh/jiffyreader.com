/** @type {MutationCallback}
 * @description make and observer callback function to process new nodes
 */
export function makeObserverCallback(parserFn) {
  function observeNewlyAddedNodesCallback(/** @type {MutationrRecord[]} */ mutationRecords) {
    mutationRecords.forEach(({ type, addedNodes }) => {
      if (type !== 'childList') return;

      addedNodes?.forEach(parserFn);
    });
  }

  return observeNewlyAddedNodesCallback;
}

/**
 * @description setup an observer on a target node
 */
export function runObserver(observer, target, observerCallback) {
  if (observer || !target) return null;

  const newObserver = new MutationObserver(observerCallback);

  const observerOptions = { childList: true, subtree: true };

  newObserver.observe(document.body, observerOptions);

  return newObserver;
}

export function destroyObserver(observer) {
  if (!observer) return;

  observer.disconnect();
}
