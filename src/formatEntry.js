const formatDistance = require('./formatDistance')
const filterPriority = require('./filterPriority')

const directionText = {
  left: '<i class="fas fa-long-arrow-alt-left"></i>',
  diagleft: '<i class="fas fa-long-arrow-alt-left"></i>',
  diagright: '<i class="fas fa-long-arrow-alt-right"></i>',
  right: '<i class="fas fa-long-arrow-alt-right"></i>',
  straight: '<i class="fas fa-long-arrow-alt-up"></i>',
  both: '<i class="fas fa-arrows-alt-h"></i>'
}

module.exports = function formatEntry (entry, options = {}) {
  let direction = (entry.direction ? entry.direction : '')
  if (options.direction === 'real' && entry.realDirection) {
    direction = entry.realDirection
  }

  let connections = []
  if (entry.connections) {
    connections = entry.connections.filter(connection => filterPriority(connection, options.priority, 4))
  }

  let result = '<li class="' + (options.file === entry.file ? 'this' : 'other') + (connections.length ? ' hasConnections' : '') + '" ' + ('index' in entry ? ' data-index="' + entry.index + '"' : '') + ('file' in entry ? ' data-file="' + entry.file + '"' : '') + '>'
  result += '<span class="dot"><i class="fas fa-circle"></i></span>'

  if (direction) {
    result += '<span class="direction ' + direction + '">' + directionText[direction] + '</span>'
  }

  result += '<span class="at">' + formatDistance(entry.at - options.at) + '</span><span class="type">'
  switch (entry.type) {
    case 'bikeroute':
      result += '<i class="fas fa-biking"></i>'
      break
    case 'park':
      result += '<i class="fas fa-tree"></i>'
      break
    case 'ptStop':
      result += '<i class="fas fa-subway"></i>'
      break
    default:
      result += '<i class="fas fa-map-marker-alt"></i>'
  }

  result += '</span><span class="content">'

  if (entry.distance) {
    result += '<span class="distance">' + formatDistance(entry.distance) + '</span>'
  }
  if (entry.at) {
    result += '<span class="name"><a href="?at=' + entry.at + '&amp;file=' + options.file + '">' + entry.name + '</a></span>'
  } else {
    result += '<span class="name">' + entry.name + '</span>'
  }

  if (entry.ptRoutes) {
    result += ' <span class="ptRoutes">'
    entry.ptRoutes.forEach(ref => {
      result += '<span class="ptRoute-' + ref + '">' + ref + '</span> '
    })
    result += '</span>'
  }

  if (connections) {
    result += '<ul class="connections">'
    connections.forEach(connection => {
      result += formatEntry(connection, options)
    })
    result += '</ul>'
  }

  result += '</span></li>'

  return result
}
