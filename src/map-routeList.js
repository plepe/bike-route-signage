/* global L:false */

const forEach = require('for-each')

class RouteList {
  constructor (map) {
    this.map = map
    this.init()
  }

  init () {
    this.latLonIndex = {}
    this.segments = []
    this.routes = []
  }

  addRoute (route) {
    if (!route.data.coordinates) {
      return
    }

    this.routes.push(route)
    let prev = null
    let start = 0
    let segment
    const segments = []
    let segmentDir = 0

    route.data.coordinates.map((lonLat, index) => {
      const poi = lonLat[1].toFixed(5) + '|' + lonLat[0].toFixed(5)
      if (!(poi in this.latLonIndex)) {
        this.latLonIndex[poi] = {}
      }

      if (!prev) {
        prev = this.latLonIndex[poi]
        return
      }

      if (!segment) {
        let match = null
        forEach(this.latLonIndex[poi], (i, s) => {
          if (s in prev && ((prev[s] === i + 1) || (prev[s] === i - 1))) {
            match = s
          }
        })

        if (match !== null) {
          if (index > start + 1) {
            segment = new Segment(this)
            segments.push(segment)
            segment.setCoordinates(route.data.coordinates.slice(start, index))
            start = index
          }

          segment = this.segments[match]
          const segmentIndex = this.latLonIndex[poi][match]
          const segmentPrevIndex = prev[match]
          segmentDir = segmentIndex - segmentPrevIndex

          segment = segment.split(segmentPrevIndex, segmentDir)
          if (segmentDir === -1) {
            segment.backward = true
          }
        }
      } else {
        if (!(segment.id in this.latLonIndex[poi]) ||
            (segment.id in this.latLonIndex[poi] && (prev[segment.id] + segmentDir !== this.latLonIndex[poi][segment.id]))) {
          const segmentPrevIndex = prev[segment.id]
          segment.split(segmentPrevIndex, segmentDir)
          segments.push(segment)
          segment = null
          start = index - 1
        }
      }

      prev = this.latLonIndex[poi]
    })

    if (segment) {
      const lonLat = route.data.coordinates[route.data.coordinates.length - 1]
      const poi = lonLat[1].toFixed(5) + '|' + lonLat[0].toFixed(5)
      const segmentIndex = this.latLonIndex[poi][segment.id]
      segment.split(segmentIndex)
      segments.push(segment)
    } else {
      segment = new Segment(this)
      segment.setCoordinates(route.data.coordinates.slice(start))
      segments.push(segment)
    }
    segments.forEach(segment => segment.addRoute(route))
  }

  removeRoute (route) {
    if (this.routes.includes(route)) {
      this.routes.splice(this.routes.indexOf(route), 1)
      const routes = this.routes
      this.segments.forEach(segment => segment.hide())
      this.init()
      routes.forEach(r => this.addRoute(r))
    }
  }
}

module.exports = function (map) {
  return new RouteList(map)
}

class Segment {
  constructor (routeList) {
    this.id = routeList.segments.length
    routeList.segments.push(this)
    this.routeList = routeList
    this.map = routeList.map
    this.routes = []
    this.backward = false
  }

  setCoordinates (coord) {
    this.coordinates = coord

    coord.forEach((lonLat, index) => {
      const poi = lonLat[1].toFixed(5) + '|' + lonLat[0].toFixed(5)
      this.routeList.latLonIndex[poi][this.id] = index
    })

    this.show()
  }

  _unsetCoordinates () {
    this.coordinates.forEach((lonLat, index) => {
      const poi = lonLat[1].toFixed(5) + '|' + lonLat[0].toFixed(5)
      delete this.routeList.latLonIndex[poi][this.id]
    })
  }

  addRoute (route) {
    this.routes.push(route)
    this.hide()
    this.show()
  }

  show () {
    if (this.map) {
      if (this.backward) {
        this.path = L.polyline(this.coordinates.map(coord => [coord[1], coord[0]]), { color: 'red', pane: 'otherRoutes' })
        this.path.addTo(this.map)
        this.decoration = null
      } else {
        this.path = L.polyline(this.coordinates.map(coord => [coord[1], coord[0]]), { color: 'red', pane: 'otherRoutes', dashArray: '27 8', noClip: true })
        this.path.addTo(this.map)

        this.decoration = L.polylineDecorator(this.path, {
          patterns: [
            { offset: 30.5, repeat: 35, polygon: true, symbol: L.Symbol.arrowHead({ pixelSize: 9, pathOptions: { pane: 'otherRoutes', stroke: 0, color: 'red', fillOpacity: 1 } }) }
          ]
        }).addTo(this.map)
      }

      // this.path.bindPopup(this.id + ': ' + this.routes.map(route => route.id).join(',') + ' (' + (this.backward ? 'both' : 'forward') + ')')
    }
  }

  hide () {
    if (this.map) {
      if (this.decoration) {
        this.map.removeLayer(this.decoration)
      }
      this.map.removeLayer(this.path)
    }
  }

  split (index, dir) {
    // console.log('split', this.id, index, dir)
    if (index === 0) {
      return this
    }
    if (index === this.coordinates.length - 1) {
      return this
    }

    const segment = new Segment(this.routeList)
    segment.routes = this.routes.concat([])
    this._unsetCoordinates()

    this.hide()

    let coord
    if (dir === 1) {
      coord = this.coordinates.slice(index)
      this.coordinates = this.coordinates.slice(0, index + 1)
    } else {
      coord = this.coordinates.slice(0, index + 1)
      this.coordinates = this.coordinates.slice(index)
    }

    this.setCoordinates(this.coordinates)
    segment.setCoordinates(coord)

    return segment
  }
}
