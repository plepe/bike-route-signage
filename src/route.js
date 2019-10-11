const fs = require('fs')
const yaml = require('yaml')
const formatEntry = require('./formatEntry')
const toPick = [ 4, 3, 2, 1, 1 ]

function route (options={}) {
  const data = yaml.parse(fs.readFileSync('wiental.yml', 'utf8'))

  if (typeof options.at === 'undefined') {
    options.at = 0
  }

  let route = data.route.filter(entry => entry.at > options.at)
  route.reverse()

  let result = ''

  result += '<ul>'
  let pickIndex = 0
  route.forEach(entry => {
    if ((entry.priority || 3) < toPick[pickIndex]) {
      result += formatEntry(entry, options)
      pickIndex++
    }
  })
  result += '</ul>'

  return result
}

module.exports = route
