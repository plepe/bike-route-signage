const queryString = require('query-string')

module.exports = function appifyLinks (div) {
  let as = div.getElementsByTagName('a')
  for (let i = 0; i < as.length; i++) {
    let a = as[i]
    a.onclick = () => {
      let m = a.href.match(/\?(.*)$/)
      if (m) {
        global.updateStatus(queryString.parse(m[1]))
      }

      return false
    }
  }
}
