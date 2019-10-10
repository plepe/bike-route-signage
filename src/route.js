const fs = require('fs')
const yaml = require('yaml')
const formatDistance = require('./formatDistance')

function route (options) {
  const data = yaml.parse(fs.readFileSync('wiental.yml', 'utf8'))

  data.route.reverse()

  let result = ''

  result += '<ul>'
  data.route.forEach(entry => {
    result += '<li class="' + (entry.direction ? entry.direction : '') + '"><span class="at">' + formatDistance(entry.at) + '</span><span class="type">'
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

    result += '</span><span class="name">' + entry.name + '</span></li>'
  })
  result += '</ul>'

  return result
}

module.exports = route
