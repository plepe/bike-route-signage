const yaml = require('yaml')
const EventEmitter = require('events')
const turf = {
  along: require('@turf/along').default,
  length: require('@turf/length').default,
  nearestPointOnLine: require('@turf/nearest-point-on-line').default
}

const formatEntry = require('./formatEntry')
const filterPriority = require('./filterPriority')
const clone = require('./clone')
const toPick = [4, 3, 2, 1, 1]

const routes = {}
const beingLoaded = {}

class Route extends EventEmitter {
  constructor (id, data) {
    super()
    this.id = id
    routes[id] = this
    this.data = data
    this.update()
  }

  update () {
    if (this.data.coordinates) {
      this.data.length = Math.round(turf.length(this.GeoJSON()) * 1000)
    }
    this.data.route.forEach((entry, index) => {
      entry.index = index
      entry.file = this.id
    })
    if (this.data.route.length) {
      this.data.route[this.data.route.length - 1].lastNode = true
    }

    this.emit('update')
  }

  setCoordinates (coordinates) {
    let geojson = this.GeoJSON()
    const nodeLatLons = this.data.route.map(entry => {
      const poi = turf.along(geojson, entry.at / 1000)
      return { lat: poi.geometry.coordinates[1], lng: poi.geometry.coordinates[0] }
    })

    this.data.coordinates = coordinates
    geojson = this.GeoJSON()

    this.data.route.forEach((entry, index) => {
      entry.at = this.positionNear(nodeLatLons[index]).at
    })
  }

  pick (at, toPick, callback) {
    let route = this.data.route.filter(entry => entry.at >= at)
    let pickIndex = 0
    route = route.filter((entry, index) => {
      const result = filterPriority(entry, toPick[pickIndex])
      if (result) {
        pickIndex++
      }

      return result
    })

    this._pickContinue(route, toPick, pickIndex, callback)
  }

  _pickContinue (route, toPick, pickIndex, callback) {
    if (pickIndex < toPick.length && this.data.continue) {
      get(this.data.continue.file, (err, nextRoute) => {
        if (err) {
          // ignore error of other route, pass successful result
          return callback(null, route)
        }

        nextRoute.pick(this.data.continue.at, toPick.slice(pickIndex),
          (err, nextEntries) => {
            if (err) {
              // ignore error of other route, pass successful result
              return callback(null, route)
            }

            nextEntries = nextEntries.map(entry => {
              entry = clone(entry)
              entry.at = this.data.length + entry.at - this.data.continue.at
              return entry
            })

            callback(null, route.concat(nextEntries))
          }
        )
      })
    } else {
      callback(null, route)
    }
  }

  title (options) {
    if (typeof this.data.title === 'object') {
      let title = this.data.title[0]
      for (const k in this.data.title) {
        if (+k <= +options.at) {
          title = this.data.title[k]
        }
      }
      return title
    } else if (this.data.title) {
      return this.data.title
    }

    return null
  }

  render (options = {}, callback) {
    if (typeof options.at === 'undefined') {
      options.at = 0
    }

    let current = this.data.route.filter(entry => entry.at >= options.at && entry.at < +options.at + 50)
    current = current.filter((entry, index) => {
      return filterPriority(entry, 5)
    })
    this.pick(+options.at + 50, options.pick ? options.pick.split(/,/) : toPick,
      (err, route) => {
        if (err) {
          return callback(err)
        }

        route.reverse()

        let result = ''

        const title = this.title(options)
        if (title) {
          result += '<h1>' + title + '</h1>'
        }

        if (route.length) {
          result += '<ul class="line">'
          if (this.data.endRoute && route[0].lastNode) {
            result += '<li class="header ' + (route[0].file === this.id ? 'this' : 'other') + ' endRoute"></li>'
          } else {
            result += '<li class="header ' + (route[0].file === this.id ? 'this' : 'other') + ' "><span class="dot"><i class="fas fa-caret-up"></i></span></li>'
          }

          route.forEach((entry, index) => {
            const opt = JSON.parse(JSON.stringify(options))
            opt.priority = toPick[route.length - index - 1]
            result += formatEntry(entry, opt)
          })
          result += '</ul>'
        }

        if (current.length) {
          result += '<ul class="current">'
          if (current.length && current[0].routeDirection) {
            result += formatEntry({
              name: this.title(options),
              type: 'bikeroute',
              direction: current[0].routeDirection
            }, { priority: 5 })
          }

          current.forEach(entry => {
            const opt = JSON.parse(JSON.stringify(options))
            opt.priority = 5
            opt.direction = 'real'
            result += formatEntry(entry, opt)
          })
          result += '</ul>'
        }

        callback(null, result)
      }
    )
  }

  save () {
    let result = {}
    for (const k in this.data) {
      switch (k) {
        case 'route':
        case 'coordinates':
          break
        default:
          result[k] = this.data[k]
      }
    }

    result.route = this.data.route.map(entry => {
      const _entry = {}
      for (const l in entry) {
        // remove 'index' and 'file' attributes
        if (!['index', 'file', 'lastNode'].includes(l)) {
          _entry[l] = entry[l]
        }
      }
      return _entry
    })

    result = yaml.stringify(result)

    if (this.data.coordinates) {
      result += 'coordinates:\n'

      this.data.coordinates.forEach(coord => {
        result += '  - [ ' + coord[0] + ', ' + coord[1] + ' ]\n'
      })
    }

    return result
  }

  GeoJSON () {
    if (!this.data.coordinates) {
      return {
        type: 'Feature',
        geometry: null
      }
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: this.data.coordinates
      }
    }
  }

  positionNear (latlng) {
    const poi = turf.nearestPointOnLine(this.GeoJSON(), { type: 'Feature', geometry: { type: 'Point', coordinates: [latlng.lng, latlng.lat] } })
    poi.at = Math.round(poi.properties.location * 1000)

    return poi
  }
}

function get (id, callback) {
  if (routes[id]) {
    return callback(null, routes[id])
  }

  if (id in beingLoaded) {
    beingLoaded[id].push(callback)
    return
  }

  beingLoaded[id] = [callback]

  global.loadFile(id, (err, route) => {
    if (err) {
      return callback(err)
    }

    routes[id] = new Route(id, route)

    beingLoaded[id].forEach(cb => cb(null, routes[id]))
    delete beingLoaded[id]
  })
}

Route.get = get

module.exports = Route
