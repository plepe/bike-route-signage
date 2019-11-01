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
