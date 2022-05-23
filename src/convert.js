// making half of the letters in a word bold
function highlightText(sentenceText) {
  // if the word contains Japanese Character
  // making only kanji bold
  const hasJapanese = /[一-龠]/;
  if (hasJapanese.test(sentenceText)) {
    const kanji = /[一-龠]/g;
    let execResult;
    const indexArray = [];
    while (execResult = kanji.exec(sentenceText)) {
        indexArray.push(execResult.index)
    }
    let htmlText = sentenceText
    indexArray
      .reverse()
      .forEach((index) => {
        const firstHalf = htmlText.slice(0, index);
        const kanji = htmlText.slice(index, index+1);
  			const secondHalf = htmlText.slice(index+1);
        htmlText = `${firstHalf}<br-bold>${kanji}</br-bold>${secondHalf}`;
      })
    return htmlText;
  }
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
