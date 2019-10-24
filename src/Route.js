const yaml = require('yaml')
const EventEmitter = require('events')
const turf = {
  length: require('@turf/length').default
}

const formatEntry = require('./formatEntry')
const filterPriority = require('./filterPriority')
const clone = require('./clone')
const toPick = [4, 3, 2, 1, 1]

let routes = {}

class Route extends EventEmitter {
  constructor (id, data) {
    super()
    this.id = id
    routes[id] = this
    this.data = data
    if (!this.data.length) {
      if (this.data.coordinates) {
        this.data.length = Math.round(turf.length(this.GeoJSON()) * 1000)
      }
    }
    this.update()
  }

  update () {
    this.data.route.forEach((entry, index) => {
      entry.index = index
      entry.file = this.id
    })

    this.emit('update')
  }

  pick (at, toPick) {
    let route = this.data.route.filter(entry => entry.at >= at)
    let pickIndex = 0
    route = route.filter((entry, index) => {
      const result = filterPriority(entry, toPick[pickIndex])
      if (result) {
        pickIndex++
      }

      return result
    })

    if (pickIndex < toPick.length && this.data.continue && this.data.continue.file in routes) {
      let nextRoute = routes[this.data.continue.file]
      let nextEntries = nextRoute.pick(this.data.continue.at, toPick.slice(pickIndex))
      nextEntries = nextEntries.map(entry => {
        entry = clone(entry)
        entry.at = this.data.length + entry.at - this.data.continue.at
        return entry
      })
      route = route.concat(nextEntries)
    }

    return route
  }

  render (options = {}) {
    if (typeof options.at === 'undefined') {
      options.at = 0
    }

    let current = this.data.route.filter(entry => entry.at >= options.at && entry.at < +options.at + 50)
    current = current.filter((entry, index) => {
      return filterPriority(entry, 5)
    })
    let route = this.pick(+options.at + 50, options.pick ? options.pick.split(/,/) : toPick)
    route.reverse()

    let result = ''

    if (typeof this.data.title === 'object') {
      let title = this.data.title[0]
      for (let k in this.data.title) {
        if (+k <= +options.at) {
          title = this.data.title[k]
        }
      }
      result += '<h1>' + title + '</h1>'
    } else if (this.data.title) {
      result += '<h1>' + this.data.title + '</h1>'
    }

    if (route.length) {
      result += '<ul class="line">'
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
          name: this.data.title,
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

    return result
  }

  save () {
    let result = {}
    for (let k in this.data) {
      switch (k) {
        case 'coordinates':
          break
        case 'route':
          result[k] = this.data.route.map(entry => {
            let _entry = {}
            for (let l in entry) {
              if (l !== 'index') {
                _entry[l] = entry[l]
              }
            }
            return _entry
          })
          break
        default:
          result[k] = this.data[k]
      }
    }

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
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: this.data.coordinates
      }
    }
  }
}

Route.get = (id) => {
  return routes[id]
}

module.exports = Route
