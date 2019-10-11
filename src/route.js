const fs = require('fs')
const yaml = require('yaml')
const formatEntry = require('./formatEntry')

function route (options={}) {
  const data = yaml.parse(fs.readFileSync('wiental.yml', 'utf8'))

  if (typeof options.at === 'undefined') {
    options.at = 0
  }

  let route = data.route.filter(entry => entry.at > options.at)
  route.reverse()

  let result = ''

  result += '<ul>'
  route.forEach(entry => result += formatEntry(entry, options))
  result += '</ul>'

  return result
}

module.exports = route
