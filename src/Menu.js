const { saveAs } = require('file-saver')

const Route = require('./Route')

const turf = {
  length: require('@turf/length').default
}

function clone (ob) {
  return JSON.parse(JSON.stringify(ob))
}

module.exports = class Menu {
  menuRotateRoute () {
    let a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      let len = turf.length(this.route.GeoJSON()) * 1000

      let data = clone(this.route.data)
      data.route = data.route
        .map(entry => {
          entry = clone(entry)
          entry.at = len - entry.at
          return entry
        })
        .reverse()
      data.coordinates = data.coordinates.reverse()

      global.setRoute(new Route(data))

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
    document.getElementById('at').value = options.at
    document.getElementById('at-100').value = +options.at - 100
    document.getElementById('at-25').value = +options.at - 25
    document.getElementById('at+25').value = +options.at + 25
    document.getElementById('at+100').value = +options.at + 100
  }
}
