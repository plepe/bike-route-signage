/* global L:false */

require('leaflet.locatecontrol')

const forEach = require('for-each')

module.exports = class Geolocation {
  constructor (app) {
    this.app = app
    this.init()
    this.positions = {}
  }

  init () {
    if (this.isInit) {
      return
    }

    if (!(this.app.modules.map && this.app.modules.map.map)) {
      return
    }

    this.map = this.app.modules.map.map

    this.control = L.control.locate({
      keepCurrentZoomLevel: true,
      drawCircle: false,
      drawMarker: true,
      showPopup: false,
      locateOptions: {
        enableHighAccuracy: true
      }
    }).addTo(this.map)

    const trackEvent = 'locationfound'
    // trackEvent = 'mousemove' // enable for testing
    this.map.on(trackEvent, e => this.update(e.latlng))

    if (!('file' in this.app.options) && !('at' in this.app.options)) {
      this.map.once('locationfound', () => {
        this.map.setZoom(17)
      })
      this.control.start()
    }

    this.isInit = true
  }

  update (latlng) {
    if (this.control._userPanned) {
      return
    }

    let poi
    if (this.route) {
      poi = this.route.positionNear(latlng)
    }

    this.positions[new Date().getTime()] = latlng
    this.clearPositions()
    if (poi && poi.properties.dist * 1000 < 50 && poi.at > this.maxAt - 10) { // only when nearer than 50m and going forward (with a tolerance of 10m)
      // at end of route -> skip to continued route (if available)
      if (poi.at >= this.route.data.length) {
        global.updateStatus({ at: this.route.data.length + 1 })
      } else {
        global.updateStatus({ at: poi.at })
      }

      if (poi.at > this.maxAt) {
        this.maxAt = poi.at
      }
    } else {
      // switch to other route, if available
      this.app.modules.map.findRoutesNear(latlng, (err, list) => {
        if (err) {
          return console.error(err)
        }

        if (list && list.length) {
          // Get a position more than 2sec ago
          let oldLatLng
          const oldTime = new Date().getTime() - 2 * 1000
          forEach(this.positions, (latlng, time) => {
            if (time < oldTime) {
              oldLatLng = latlng
            }
          })

          if (!oldLatLng) {
            return
          }

          // Check which routes are used forward
          list = list.filter(d => {
            const { route, pos } = d
            const oldPos = route.positionNear(oldLatLng)

            if (oldPos.at <= pos.at) {
              return true
            }
          })

          // TODO: order routes by priority

          if (!list.length) {
            return
          }

          // Switch to selected route
          global.updateStatus({ file: list[0].route.id, at: list[0].pos.at })
        }
      })
    }
  }

  clearPositions () {
    const t = new Date().getTime() - 10 * 1000
    for (const k in this.positions) {
      if (k < t) {
        delete this.positions[k]
      }
    }
  }

  setRoute (route) {
    this.route = route
    this.maxAt = 0
  }

  updateStatus (options) {
    this.init()
  }
}
