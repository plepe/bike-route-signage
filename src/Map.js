require('leaflet')
require('leaflet-draw')

const turf = {
  along: require('@turf/along').default,
  nearestPointOnLine: require('@turf/nearest-point-on-line').default
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

    this.layers = new L.FeatureGroup()
    this.map.addLayer(this.layers)

    this.drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        polygon: false,
        marker: false
      },
      edit: {
        featureGroup: this.layers,
        remove: false
      }
    })
    this.map.addControl(this.drawControl)

    this.map.on(L.Draw.Event.EDITED, () => {
      let geojson = this.path.toGeoJSON()
      this.route.data.coordinates = geojson.geometry.coordinates
      this.setRoute(this.route)
    })
    this.map.on(L.Draw.Event.CREATED, e => {
      let coordinates = e.layer.editing.latlngs[0].map(latlng => [ latlng.lng, latlng.lat ])
      this.route.data.coordinates = coordinates
      this.setRoute(this.route)
    })

    this.map.setView([ 48.20837, 16.37239 ], 10)
  }

  clear () {
    if (this.path) {
      this.layers.removeLayer(this.path)
      delete this.path
    }
    if (this.markers) {
      this.markers.forEach(marker => {
        this.map.removeLayer(marker)
      })
      delete this.markers
    }
  }

  setRoute (route) {
    this.clear()
    this.route = route
    this.routeGeoJSON = null

    if (this.route.data.coordinates) {
      this.path = L.polyline(route.data.coordinates.map(coord => [ coord[1], coord[0] ]), { color: 'red' })
      this.layers.addLayer(this.path)

      this.map.setView([route.data.coordinates[0][1], route.data.coordinates[0][0]], 17)

      this.routeGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.route.data.coordinates
        }
      }

      this.path.on('click', e => {
        let poi = turf.nearestPointOnLine(this.routeGeoJSON, { type: 'Feature', geometry: { type: 'Point', coordinates: [e.latlng.lng, e.latlng.lat]}})
        let at = Math.round(poi.properties.location * 1000)
        global.updateStatus({ at })
      })

      this.markers = []
      this.route.data.route.forEach(entry => {
        let poi = turf.along(this.routeGeoJSON, entry.at / 1000)
        let latlng = [ poi.geometry.coordinates[1], poi.geometry.coordinates[0] ]
        let marker = L.circleMarker(latlng, { color: '#ff0000', radius: 3, fillOpacity: 1 }).addTo(this.map)
        marker.on('click', () => global.updateStatus({ at: entry.at }))
        this.markers.push(marker)
      })
    } else {
      new L.Draw.Polyline(this.map, this.drawControl.options.polyline).enable();
    }
  }

  getPosition (at) {
    return turf.along(this.routeGeoJSON, (at < 0 ? 0 : at) / 1000)
  }

  updateStatus (options) {
    if (!this.routeGeoJSON) {
      return
    }

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
