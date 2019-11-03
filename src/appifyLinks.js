const queryString = require('query-string')

module.exports = function appifyLinks (div) {
  const as = div.getElementsByTagName('a')
  for (let i = 0; i < as.length; i++) {
    const a = as[i]
    a.onclick = () => {
      const m = a.href.match(/\?(.*)$/)
      if (m) {
        global.updateStatus(queryString.parse(m[1]))
      }

      return false
    }
  }
}
