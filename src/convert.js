// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .split(' ')
    .map((word) => {
      // special case - hyphenated compound word, e.g. video-game
      if (word.includes('-')) {
        return word.split('-').map((component) => highlightText(component)).join('-')
      }
      const hasNumber = /\d/
      if (hasNumber.test(word)) {
        return word
      }
      const length = word.length
      let midPoint;
      switch (length) {
        case 1:
        case 2:
        case 3:
          midPoint = 1; break;
        case 4:
          midPoint = 2; break;
        default:
          midPoint = Math.round(length * 0.6)
      }
      const firstHalf = word.slice(0, midPoint)
      const secondHalf = word.slice(midPoint)
      const htmlWord = `<br-bold class="br-bold">${firstHalf}</br-bold>${secondHalf}`
      return htmlWord
    })
    .join(' ')
}

function main() {
  // check if we have already highlighted the text
  const boldedElements = document.getElementsByTagName('br-bold')
  if (boldedElements.length > 0) {
    for (const element of boldedElements) {
      element.classList.toggle('br-bold')
    }
    return
  }

  // setting global styles
  var style = document.createElement('style')
  style.textContent = '.br-bold { font-weight: bold !important; display: inline; }'
  document.head.appendChild(style)

  let tags = ['p', 'font', 'span', 'li']

  const parser = new DOMParser()
  tags.forEach((tag) => {
    for (let element of document.getElementsByTagName(tag)) {
      const n = parser.parseFromString(element.innerHTML, 'text/html')
      const textArrTransformed = Array.from(n.body.childNodes).map((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return highlightText(node.nodeValue)
        }
        return node.outerHTML
      })
      element.innerHTML = textArrTransformed.join(' ')
    }
  })
}

main()
