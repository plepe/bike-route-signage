/* global L:false */

const forEach = require('for-each')

class RouteList {
  constructor (map) {
    this.map = map
    this.latLonIndex = {}
    this.segments = []
  }

  addToIndex (route) {
    if (!route.data.coordinates) {
      return
    }

    let prev = {}
    let start = 0
    route.data.coordinates.forEach((lonLat, index) => {
      let poi = lonLat[1].toFixed(5) + '|' + lonLat[0].toFixed(5)
      if (!(poi in this.latLonIndex)) {
        this.latLonIndex[poi] = {}
      }

      let match = true
      forEach(this.latLonIndex[poi], (i, r) => {
        if (!(r in prev) || !((prev[r] === i + 1) || (prev[r] === i - 1))) {
          match = false
        }
      })

      if (!match) {
        console.log(route.id, 'new segment', start, '-', index, Object.values(this.latLonIndex[poi]).length)
        start = index
      }

      this.latLonIndex[poi][route.id] = index
      prev = this.latLonIndex[poi]
    })
  }

  addRoute (route) {
    this.addToIndex(route)

    const path = this.showRoute(route, { style: { color: 'red', pane: 'otherRoutes', dashArray: '27 8', noClip: true } })
    path.addTo(this.map)

    path.decoration = L.polylineDecorator(path, {
      patterns: [
        { offset: 30.5, repeat: 35, polygon: true, symbol: L.Symbol.arrowHead({ pixelSize: 9, pathOptions: { pane: 'otherRoutes', stroke: 0, color: 'red', fillOpacity: 1 }})}
      ]
    }).addTo(this.map)
  }

  showRoute (route, options) {
    const path = L.polyline(route.data.coordinates.map(coord => [coord[1], coord[0]]), options.style)

    return path
  }
}

module.exports = function (map) {
  return new RouteList(map)
}
