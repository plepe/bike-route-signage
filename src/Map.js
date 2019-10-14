require('leaflet')

const turf = {
  along: require('@turf/along').default
}

module.exports = class Map {
  constructor () {
    const div = document.createElement('div')
    div.id = 'map'
    document.getElementById('map-container').appendChild(div)

    this.map = L.map('map')

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(this.map)

    this.map.setView([ 48.20837, 16.37239 ], 10)
  }

  setRoute (route) {
    this.route = route

    if (this.route.data.coordinates) {
      let path = L.polyline(route.data.coordinates.map(coord => [ coord[1], coord[0] ]), { color: 'red' })
      path.addTo(this.map)

      this.map.fitBounds(path.getBounds())

      this.routeGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineStrings',
          coordinates: this.route.data.coordinates
        }
      }

      this.route.data.route.forEach(entry => {
        let poi = turf.along(this.routeGeoJSON, entry.at / 1000)
        let latlng = [ poi.geometry.coordinates[1], poi.geometry.coordinates[0] ]
        L.circleMarker(latlng, { color: '#ff0000', radius: 3, fillOpacity: 1 }).addTo(this.map)
      })
    }
  }

  getPosition (at) {
    return turf.along(this.routeGeoJSON, (at < 0 ? 0 : at) / 1000)
  }

  updateStatus (options) {
    let poi = this.getPosition(options.at)
    let latlng = [ poi.geometry.coordinates[1], poi.geometry.coordinates[0] ]

    if (this.locationIndicator) {
      this.locationIndicator.setLatLng(latlng)
    } else {
      this.locationIndicator = L.circleMarker(latlng, { color: '#0000ff', radius: 5 }).addTo(this.map)
    }

    this.map.panTo(latlng)
  }
}
