const Form = require('modulekit-form')
const Tab = require('modulekit-tabs').Tab

const Route = require('./Route')
const clone = require('./clone')

// TODO: embed modulekit-lang
global.lang_str = {}
global.ui_lang = 'de'
let at

module.exports = class Edit {
  constructor (app) {
    const div = document.getElementById('editor')
    this.tab = new Tab({ id: 'editor' })
    app.tabs.add(this.tab)

    this.tab.header.innerHTML = 'Bearbeiten'
    this.tab.content.appendChild(div)

    let a = document.createElement('a')
    a.href = '#'
    a.innerHTML = 'Grundwerte bearbeiten'
    a.onclick = () => {
      this.editBasic()
      return false
    }
    div.appendChild(a)

    a = document.createElement('a')
    a.href = '#'
    a.innerHTML = 'Neuen Knoten an aktueller Position anlegen'
    a.onclick = () => {
      let entry = { name: '', at }
      let pos = this.route.data.route.findIndex(entry => entry.at >= at)
      this.route.data.route.splice(pos, 0, entry)
      this.route.update()

      this.edit(entry)
      return false
    }
    div.appendChild(a)

    div.appendChild(this.rotateRoute())

    this.dom = document.createElement('form')
    this.dom.id = 'edit'
    div.appendChild(this.dom)
  }

  setRoute (route) {
    this.route = route
  }

  clear () {
    this.dom.innerHTML = ''
  }

  editBasic () {
    this.clear()

    this.form = new Form('root', require('./routeBasic.json'))
    this.form.set_data(this.route.data)

    this.form.show(this.dom)

    let input = document.createElement('input')
    input.type = 'submit'
    input.value = 'Update'
    this.dom.appendChild(input)

    input = document.createElement('input')
    input.type = 'button'
    input.value = 'Cancel'
    input.onclick = () => {
      this.clear()
      return false
    }
    this.dom.appendChild(input)

    this.dom.onsubmit = () => {
      let data = this.form.get_data()
      for (let k in data) {
        this.route.data[k] = data[k]
      }

      this.clear()
      this.route.update()
      global.updateStatus({})
      return false
    }
  }

  edit (entry) {
    this.clear()

    this.form = new Form('data', require('./entry.json'))

    if (this.route.id !== entry.file) {
      let warning = document.createElement('div')
      warning.className = 'warning'
      warning.innerHTML = 'Achtung! Eintrag liegt an einer fortgesetzten Route.'
      this.dom.appendChild(warning)
    }

    this.form.set_data(entry)
    this.form.show(this.dom)

    let input = document.createElement('input')
    input.type = 'submit'
    input.value = 'Update'
    this.dom.appendChild(input)

    input = document.createElement('input')
    input.type = 'button'
    input.value = 'Cancel'
    input.onclick = () => {
      this.clear()
      return false
    }
    this.dom.appendChild(input)

    this.dom.onsubmit = () => {
      let data = this.form.get_data()
      for (let k in data) {
        if (data[k]) {
          entry[k] = data[k]
        }
      }

      this.clear()
      this.route.update()
      global.updateStatus({})
      return false
    }
  }

  updateStatus (options) {
    let as = document.querySelectorAll("#route-sign > ul > li > .content > .name > a")

    for (let i = 0; i < as.length; i++) {
      let a = as[i]
      let li = a.parentNode.parentNode.parentNode

      a.onclick = () => {
        Route.get(li.getAttribute('data-file'), (err, _route) => {
          const entry = _route.data.route[li.getAttribute('data-index')]
          this.edit(entry)
          this.tab.select()
        })
        return false
      }
    }

    if ('at' in options) {
      at = options.at
    }
  }

  rotateRoute () {
    let a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      let len = this.route.data.length

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

}
