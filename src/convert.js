// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .split(' ')
    .map((word) => {
      // special case - hyphenated compound word, e.g. video-game
      if (word.includes('-')) {
        return word.split('-').map((component) => highlightText(component)).join('-');
      }
      const hasNumber = /\d/;
      if (hasNumber.test(word)) {
        return word;
      }
      const { length } = word;
      let midPoint = 1;
      if (length > 3) midPoint = Math.round(length / 2);
      const firstHalf = word.slice(0, midPoint);
      const secondHalf = word.slice(midPoint);
      const htmlWord = `<br-bold>${firstHalf}</br-bold>${secondHalf}`;
      return htmlWord;
    })
    .join(' ');
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

  // setting global styles
  const style = document.createElement('style');
  style.textContent = '.br-bold br-bold { font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); }';
  document.head.appendChild(style);

  const tags = ['p', 'font', 'span', 'li'];

  const parser = new DOMParser();
  tags.forEach((tag) => {
    for (const element of document.getElementsByTagName(tag)) {
      const n = parser.parseFromString(element.innerHTML, 'text/html');
      const textArrTransformed = Array.from(n.body.childNodes).map((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return highlightText(node.nodeValue);
        }
        return node.outerHTML;
      });
      element.innerHTML = textArrTransformed.join(' ');
    }
  });
}

main();
