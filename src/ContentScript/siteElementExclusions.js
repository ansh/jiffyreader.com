/** @typedef {{tag:string,attributes: {attribute:string,contains:string}[]}} ExclusionRule */

const siteElementExclusions = {
  'twitter.com': [
    {
      tag: 'div',
      attributes: [
        {
          attribute: 'class',
          contains: 'DraftEditor-root',
        },
      ],
    },
  ],
};

export const getElementExclusions = (/** @type string */ origin) => {
  const [, excludedElements] = Object.entries(siteElementExclusions).find(([domain]) => new RegExp(domain, 'i').test(origin)) ?? [null, []];
  return excludedElements;
};

export const canExcludeNode =
  (/** @type {Element} */ node) => (/** @type ExclusionRule */ exclusionRule) => {
    const tagMatched = new RegExp(exclusionRule.tag, 'i').test(node.tagName);
    const attributesMatched = exclusionRule.attributes.filter((atr) => new RegExp(node.getAttribute(atr.attribute)).test(atr.contains, 'i'));
    return tagMatched && attributesMatched.length;
  };

export default {
  getElementExclusions,
  canExcludeNode,
};
