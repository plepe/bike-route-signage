let map

require('leaflet')

module.exports = function showMap (route) {
  if (!map) {
    const div = document.createElement('div')
    div.id = 'map'
    document.getElementById('map-container').appendChild(div)

    map = L.map('map')

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)
  }

  if (route.data.coordinates) {
    let path = L.polyline(route.data.coordinates.map(coord => [ coord[1], coord[0] ]), { color: 'red' })
    path.addTo(map)

    map.fitBounds(path.getBounds())
  } else {
    map.setView([ 48.20837, 16.37239 ], 10)
  }
}
