// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .split(' ')
    .map((word) => {
      const length = word.length
      const midPoint = Math.round(length / 2)
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
