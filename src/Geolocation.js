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

    if (this.app.modules.map && this.app.modules.map.map) {
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

      let trackEvent = 'locationfound'
      //trackEvent = 'mousemove' // enable for testing
      this.map.on(trackEvent, e => {
        if (this.control._userPanned) {
          return
        }

        // route not loaded (yet)
        if (!this.route) {
          return
        }

        let poi = this.route.positionNear(e.latlng)
        this.positions[new Date().getTime()] = e.latlng
        this.clearPositions()
        if (poi.properties.dist * 1000 < 50 && poi.at > this.maxAt - 10) { // only when nearer than 50m and going forward (with a tolerance of 10m)
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
          this.app.modules.map.findRoutesNear(e.latlng, (err, list) => {
            if (list && list.length) {
              // Get a position more than 2sec ago
              let oldLatLng
              let oldTime = new Date().getTime() - 2 * 1000
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
                let { route, pos } = d
                let oldPos = route.positionNear(oldLatLng)

                if (oldPos.at < pos.at) {
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
      })

      this.isInit = true
    }
  }

  clearPositions () {
    let t = new Date().getTime() - 10 * 1000
    for (let k in this.positions) {
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
