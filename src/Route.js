const yaml = require('yaml')

const formatEntry = require('./formatEntry')
const filterPriority = require('./filterPriority')
const toPick = [4, 3, 2, 1, 1]

class Route {
  constructor (data) {
    this.data = data
    this.reindex()
  }

  reindex () {
    this.data.route.forEach((entry, index) => {
      entry.index = index
    })
  }

  render (options = {}) {
    if (typeof options.at === 'undefined') {
      options.at = 0
    }

    let current = this.data.route.filter(entry => entry.at >= options.at && entry.at < +options.at + 50)
    let route = this.data.route.filter(entry => entry.at >= +options.at + 50)
    let pickIndex = 0
    route = route.filter((entry, index) => {
      const result = filterPriority(entry, toPick[pickIndex])
      if (result) {
        pickIndex++
      }

      return result
    })
    route.reverse()

    let result = ''

    if (this.data.title) {
      result += '<h1>' + this.data.title + '</h1>'
    }

    result += '<ul class="line">'
    route.forEach((entry, index) => {
      const opt = JSON.parse(JSON.stringify(options))
      opt.priority = toPick[route.length - index - 1]
      result += formatEntry(entry, opt)
    })
    result += '</ul>'

    current.forEach(entry => {
      result += '<div class="connection">'
      const opt = JSON.parse(JSON.stringify(options))
      opt.priority = 5
      result += formatEntry(entry, opt)
      result += '</div>'
    })

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
}

module.exports = Route
