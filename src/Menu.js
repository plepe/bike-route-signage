const { saveAs } = require('file-saver')

const Route = require('./Route')
const updateInput = require('./updateInput')
const clone = require('./clone')

const turf = {
  length: require('@turf/length').default
}

turn = {
  left: 'right',
  right: 'left',
  diagleft: 'diagright',
  diagright: 'diagleft',
  straight: 'straight',
  both: 'both'
}

module.exports = class Menu {
  menuRotateRoute () {
    let a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      let len = Math.round(turf.length(this.route.GeoJSON()) * 1000)

      let data = clone(this.route.data)
      data.route = data.route
        .map(entry => {
          entry = clone(entry)
          entry.at = len - entry.at
          if (entry.direction) {
            entry.direction = turn[entry.direction]
          }
          if (entry.realDirection) {
            entry.realDirection = turn[entry.realDirection]
          }
          if (entry.routeDirection) {
            entry.routeDirection= turn[entry.routeDirection]
          }
          if (entry.connections) {
            entry.connections.forEach(conn => {
              if (conn.direction) {
                conn.direction = turn[conn.direction]
              }
            })
          }

          return entry
        })
        .reverse()
      data.coordinates = data.coordinates.reverse()

      global.setRoute(new Route('', data))

      return false
    }
    a.appendChild(document.createTextNode('Rotate route'))

    return a
  }

  constructor () {
    this.dom = document.getElementById('menu')

    let div = document.createElement('div')
    this.dom.appendChild(div)

    let a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      let blob = new Blob([ this.route.save() ], {
        type: 'text/vnd.yaml;charset=utf-8'
      })

      saveAs(blob, 'x.yml')
      return false
    }
    a.appendChild(document.createTextNode('Download file'))
    div.appendChild(a)

    div.appendChild(this.menuRotateRoute())
  }

  setRoute (route) {
    this.route = route
  }

  updateStatus (options) {
    updateInput('input[name=file]', options.file)
    updateInput('input[name=at]', options.at || 0)
    if (options.pick) {
      updateInput('input[name=pick]', options.pick)
    }

    document.getElementById('at-100').value = +options.at - 100
    document.getElementById('at-25').value = +options.at - 25
    document.getElementById('at+25').value = +options.at + 25
    document.getElementById('at+100').value = +options.at + 100
  }
}
