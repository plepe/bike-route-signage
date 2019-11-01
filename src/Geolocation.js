require('leaflet.locatecontrol')

module.exports = class Geolocation {
  constructor (app) {
    this.app = app
    this.init()
  }

  init () {
    if (this.isInit) {
      return
    }

    if (this.app.modules.map && this.app.modules.map.map) {
      this.map = this.app.modules.map.map

      L.control.locate({
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
        let poi = this.route.positionNear(e.latlng)
        if (poi.properties.dist * 1000 < 50) { // only when nearer than 50m
          // at end of route -> skip to continued route (if available)
          if (poi.at >= this.route.data.length) {
            global.updateStatus({ at: this.route.data.length + 1 })
          } else {
            global.updateStatus({ at: poi.at })
          }
        }
      })

      this.isInit = true
    }
  }

  setRoute (route) {
    this.route = route
  }

  updateStatus (options) {
    this.init()
  }
}
