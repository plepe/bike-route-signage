const formatDistance = require('./formatDistance')

module.exports = function formatEntry (entry) {
  let result = '<li class="' + (entry.direction ? entry.direction : '') + '"><span class="at">' + formatDistance(entry.at - options.at) + '</span><span class="type">'
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

  return result
}