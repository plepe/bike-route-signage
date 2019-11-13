/* global L:false */

require('leaflet')
require('leaflet-draw')

const asyncForEach = require('async-each')

const fullscreen = require('./map-fullscreen')
const polylineMeasure = require('./map-polylineMeasure')
const Route = require('./Route')
const appifyLinks = require('./appifyLinks')

const turf = {
  along: require('@turf/along').default
}

module.exports = class Map {
  constructor (app) {
    this.app = app
    const div = document.createElement('div')
    div.id = 'map'
    document.getElementById('map-container').appendChild(div)

    this.map = L.map('map')

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)

    this.modules = [
      polylineMeasure(this.map),
      fullscreen(this.map)
    ].filter(module => module)

    this.layers = new L.FeatureGroup()
    this.map.addLayer(this.layers)

    let pane = this.map.createPane('otherRoutes')
    pane.style.zIndex = 399
    pane.style.opacity = 0.4

    pane = this.map.createPane('location')
    pane.style.zIndex = 401

    pane = this.map.createPane('currentRoute')
    pane.style.zIndex = 400

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
      const geojson = this.path.toGeoJSON()
      this.route.data.coordinates = geojson.geometry.coordinates
      this.setRoute(this.route)
    })
    this.map.on(L.Draw.Event.CREATED, e => {
      const coordinates = e.layer.editing.latlngs[0].map(latlng => [latlng.lng, latlng.lat])
      this.route.data.coordinates = coordinates
      this.setRoute(this.route)
    })

    this.map.setView([48.20837, 16.37239], 10)

    this.map.on('click', e => this.showPopupAt(e.latlng))

    this.showAll()

    this.app.on('resize', () => {
      this.map.invalidateSize()
    })
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
    if (this.route) {
      this.route.removeListener('update', this.updateFun)
    }
    this.clear()
    this.route = route
    this.update()
    this.updateFun = () => {
      this.clear()
      this.update()
    }
    this.route.on('update', this.updateFun)
  }

  update () {
    if (this.route.data.coordinates) {
      this.path = this.showRoute(this.route, { style: { color: 'red', pane: 'currentRoute' } })
      this.layers.addLayer(this.path)

      this.map.setView([this.route.data.coordinates[0][1], this.route.data.coordinates[0][0]], 17)

      this.path.on('click', e => {
        const poi = this.route.positionNear(e.latlng)
        global.updateStatus({ at: poi.at })
      })

      this.markers = []
      this.route.data.route.forEach(entry => {
        if (entry.at < 0) {
          return
        }

        const poi = turf.along(this.route.GeoJSON(), entry.at / 1000)
        const latlng = [poi.geometry.coordinates[1], poi.geometry.coordinates[0]]
        const marker = L.circleMarker(latlng, { color: '#ff0000', radius: 3, fillOpacity: 1, pane: 'currentRoute' }).addTo(this.map)
        marker.on('click', () => global.updateStatus({ at: entry.at }))
        this.markers.push(marker)
      })
    } else {
      new L.Draw.Polyline(this.map, this.drawControl.options.polyline).enable()
    }
  }

  showRoute (route, options) {
    const path = L.polyline(route.data.coordinates.map(coord => [coord[1], coord[0]]), options.style)

    return path
  }

  showAll () {
    global.loadList((err, list) => {
      if (err) {
        return console.error(err)
      }

      asyncForEach(list,
        (file, callback) => {
          Route.get(file, (err, route) => {
            if (err) {
              // ignore (and report) errors on loading routes
              console.error(err)
              callback()
              return
            }

            const path = this.showRoute(route, { style: { color: 'red', pane: 'otherRoutes' } })
            path.addTo(this.map)
            callback()
          })
        }
      )
    })
  }

  findRoutesNear (latlng, callback) {
    const nearby = []

    global.loadList((err, list) => {
      if (err) {
        return console.error(err)
      }

      asyncForEach(list,
        (file, callback) => {
          Route.get(file, (err, route) => {
            if (err) {
              // ignore (and report) errors on loading routes
              console.error(err)
              callback()
              return
            }

            const pos = route.positionNear(latlng)
            if (pos.properties.dist * 1000 < 50) {
              nearby.push({ route, pos })
            }
            callback()
          })
        },
        () => {
          callback(null, nearby)
        }
      )
    })
  }

  showPopupAt (latlng) {
    const result = []

    this.findRoutesNear(latlng,
      (err, nearby) => {
        if (err) {
          return console.error(err)
        }

        nearby.forEach(d => {
          const { route, pos } = d

          result.push('<li><a href="?file=' + encodeURIComponent(route.id) + '&amp;at=' + pos.at + '">' + route.title({ at: pos.at }) + ' (' + route.id + ')</a></li>')
        })

        const div = document.createElement('div')

        if (result.length) {
          div.innerHTML = 'Routen:<ul>' +
            result.join('\n') +
            '</ul>'
        } else {
          div.innerHTML = 'Keine Routen in der Nähe gefunden!'
        }

        appifyLinks(div)

        L.popup()
          .setLatLng(latlng)
          .setContent(div)
          .openOn(this.map)
      }
    )
  }

  getPosition (at) {
    return turf.along(this.route.GeoJSON(), (at < 0 ? 0 : at) / 1000)
  }

  updateStatus (options) {
    if (!this.route || !this.route.GeoJSON().geometry) {
      return
    }

    const poi = this.getPosition(options.at)
    const latlng = [poi.geometry.coordinates[1], poi.geometry.coordinates[0]]

    if (this.locationIndicator) {
      this.locationIndicator.setLatLng(latlng)
    } else {
      this.locationIndicator = L.circleMarker(latlng, { color: '#0000ff', radius: 5, pane: 'location' }).addTo(this.map)
    }

    this.map.panTo(latlng)
  }
}
