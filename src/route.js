const fs = require('fs')
const yaml = require('yaml')
const formatEntry = require('./formatEntry')
const filterPriority = require('./filterPriority')
const toPick = [4, 3, 2, 1, 1]

function route (options = {}) {
  const data = yaml.parse(fs.readFileSync('wiental.yml', 'utf8'))

  if (typeof options.at === 'undefined') {
    options.at = 0
  }

  let route = data.route.filter(entry => entry.at > options.at)
  let pickIndex = 0
  route = route.filter(entry => {
    const result = filterPriority(entry, toPick[pickIndex])
    if (result) {
      pickIndex++
    }

    return result
  })
  route.reverse()

  let result = ''

  if (data.title) {
    result += '<h1>' + data.title + '</h1>'
  }

  result += '<ul>'
  route.forEach((entry, index) => {
    const opt = JSON.parse(JSON.stringify(options))
    opt.priority = toPick[route.length - index - 1]
    result += formatEntry(entry, opt)
  })
  result += '</ul>'

  return result
}

module.exports = route
