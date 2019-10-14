const yaml = require('yaml')

const formatEntry = require('./formatEntry')
const filterPriority = require('./filterPriority')
const toPick = [4, 3, 2, 1, 1]

class Route {
  constructor (data) {
    this.data = data
  }

  render (options = {}) {
    if (typeof options.at === 'undefined') {
      options.at = 0
    }

    let route = this.data.route.filter(entry => entry.at > options.at)
    let pickIndex = 0
    route = route.filter(entry => {
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

    result += '<ul>'
    route.forEach((entry, index) => {
      const opt = JSON.parse(JSON.stringify(options))
      opt.priority = toPick[route.length - index - 1]
      result += formatEntry(entry, opt)
    })
    result += '</ul>'

    return result
  }

  save () {
    let result = {}
    for (let k in this.data) {
      if (k !== 'coordinates') {
        result[k] = this.data[k]
      }
    }

    result = yaml.stringify(result)

    if (this.data.coordinates) {
      result += 'coordinates:\n'

      this.data.coordinates.forEach(coord => {
        result += '- [ ' + coord[0] + ', ' + coord[1] + ' ]\n'
      })
    }

    return result
  }
}

module.exports = Route
