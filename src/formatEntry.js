const formatDistance = require('./formatDistance')
const filterPriority = require('./filterPriority')

module.exports = function formatEntry (entry, options={}) {
  let result = '<li class="' + (entry.direction ? entry.direction : '') + '"><span class="at">' + formatDistance(entry.at - options.at) + '</span><span class="type">'
  switch (entry.type) {
    case 'bikeroute':
      result += '<i class="fas fa-biking"></i>'
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

  result += '</span><span class="content"><span class="name"><a href="?at=' + entry.at + '">' + entry.name + '</a></span>'

  if (entry.distance) {
    result += '<span class="distance">' + formatDistance(entry.distance) + '</span>'
  }

  if (entry.connections) {
    let connections = entry.connections.filter(connection => filterPriority(connection, options.priority, 4))

    result += '<ul>'
    connections.forEach(connection => result += formatEntry(connection))
    result += '</ul>'
  }

  result += '</span></li>'

  return result
}
