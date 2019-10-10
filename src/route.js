const fs = require('fs')
const yaml = require('yaml')
const formatDistance = require('./formatDistance')

function route (options={}) {
  const data = yaml.parse(fs.readFileSync('wiental.yml', 'utf8'))

  if (typeof options.at === 'undefined') {
    options.at = 0
  }

  let route = data.route.filter(entry => entry.at > options.at)
  route.reverse()

  let result = ''

  result += '<ul>'
  route.forEach(entry => {
    result += '<li class="' + (entry.direction ? entry.direction : '') + '"><span class="at">' + formatDistance(entry.at - options.at) + '</span><span class="type">'
    switch (entry.type) {
      case 'bikeroute':
        result += '<i class="fas fa-bicycle"></i>'
        break
      case 'park':
        result += '<i class="fas fa-tree"></i>'
        break
      case 'ptStop':
        result += '<i class="fas fa-bus"></i>'
        break
      default:
        result += '<i class="fas fa-map-marker-alt"></i>'
    }

    result += '</span><span class="name"><a href="?at=' + entry.at + '">' + entry.name + '</a></span></li>'
  })
  result += '</ul>'

  return result
}

module.exports = route
