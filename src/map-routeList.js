/* global L:false */

class RouteList {
  constructor (map) {
    this.map = map
  }

  addRoute (route) {
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
