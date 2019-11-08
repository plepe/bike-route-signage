/* global getComputedStyle:false */

const cache = {}

module.exports = function getEmSize (domEl) {
  const fontSize = elementCurrentStyle(domEl, 'font-size')

  if (!(fontSize in cache) || cache[fontSize] === 0) {
    // calculate height of M
    const em = document.createElement('div')
    em.setAttribute('style', 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em;')
    em.appendChild(document.createTextNode('M'))
    domEl.appendChild(em)
    cache[fontSize] = em.offsetHeight
    domEl.removeChild(em)
  }

  return cache[fontSize]
}

// from: http://stackoverflow.com/a/5265175
function elementCurrentStyle (element, styleName) {
  if (element.currentStyle) {
    let i = 0
    let temp = ''
    let changeCase = false

    for (i = 0; i < styleName.length; i++) {
      if (styleName[i] !== '-') {
        temp += (changeCase ? styleName[i].toUpperCase() : styleName[i])
        changeCase = false
      } else {
        changeCase = true
      }
    }
    styleName = temp
    return element.currentStyle[styleName]
  } else {
    return getComputedStyle(element, null).getPropertyValue(styleName)
  }
}
