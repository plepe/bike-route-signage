/* global Blob:false */

const { saveAs } = require('file-saver')
const Form = require('modulekit-form')
const Tab = require('modulekit-tabs').Tab
const forEach = require('for-each')

const Route = require('./Route')
const clone = require('./clone')
const clearDomNode = require('./clearDomNode')

const turn = {
  left: 'right',
  right: 'left',
  diagleft: 'diagright',
  diagright: 'diagleft',
  straight: 'straight',
  both: 'both'
}

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
    a.onclick = () => {
      const blob = new Blob([this.route.save()], {
        type: 'text/vnd.yaml;charset=utf-8'
      })

      saveAs(blob, this.route.id + '.yml')
      return false
    }
    a.appendChild(document.createTextNode('Download file'))
    div.appendChild(a)
    a = document.createElement('a')
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
      const entry = { name: '', at }
      const pos = this.route.data.route.findIndex(entry => entry.at >= at)
      if (pos === -1) {
        this.route.data.route.push(entry)
      } else {
        this.route.data.route.splice(pos, 0, entry)
      }
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
    if (this.route) {
      this.route.off('update', this._listRouteCB)
    }

    this.route = route
    this._listRouteCB = () => this.listRoute()
    this.route.on('update', this._listRouteCB)
    this.listRoute()
  }

  listRoute () {
    if (this.table) {
      clearDomNode(this.table)
    } else {
      this.table = document.createElement('table')
      this.table.id = 'listRoute'
      this.tab.content.appendChild(this.table)
    }

    if (!this.route.data.route) {
      return
    }

    this.route.data.route.forEach(entry => {
      const tr = document.createElement('tr')

      let td = document.createElement('td')
      td.className = 'at'
      td.appendChild(document.createTextNode(entry.at))
      tr.appendChild(td)

      td = document.createElement('td')
      td.className = 'name'
      td.appendChild(document.createTextNode(entry.name))
      tr.appendChild(td)

      td = document.createElement('td')
      td.className = 'edit'
      let a = document.createElement('a')
      a.href = '#'
      a.onclick = () => {
        this.edit(entry)
        return false
      }
      a.appendChild(document.createTextNode('edit'))
      td.appendChild(a)
      tr.appendChild(td)

      this.table.appendChild(tr)
    })
  }

  clear () {
    this.dom.innerHTML = ''
  }

  editBasic () {
    this.clear()

    this.form = new Form('root', require('./routeBasic.json'))

    const data = clone(this.route.data)
    if (typeof data.title === 'string') {
      data.title = { 0: data.title }
    }

    this.form.set_data(data)

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
      const data = this.form.get_data()

      if (Object.keys(data.title).length === 0) {
        data.title = null
      } else if (Object.keys(data.title).length === 1 && ('0' in data.title)) {
        data.title = data.title['0']
      }

      if (Object.keys(data.continue).length === 0) {
        data.continue = null
      }

      for (const k in data) {
        if (data[k] === null) {
          delete this.route.data[k]
        } else {
          this.route.data[k] = data[k]
        }
      }

      this.clear()
      this.route.update()
      global.updateStatus({})
      return false
    }
  }

  edit (entry) {
    this.clear()
    this.tab.content.removeChild(this.table)

    this.form = new Form('data', require('./entry.json'))

    if (this.route.id !== entry.file) {
      const warning = document.createElement('div')
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
      this.tab.content.appendChild(this.table)
      return false
    }
    this.dom.appendChild(input)

    this.dom.onsubmit = () => {
      const data = this.form.get_data()
      for (const k in data) {
        if (data[k] === null) {
          delete entry[k]
        } else {
          entry[k] = data[k]
        }
      }

      this.clear()
      this.route.update()
      this.tab.content.appendChild(this.table)
      global.updateStatus({})
      return false
    }
  }

  updateStatus (options) {
    const as = document.querySelectorAll('#route-sign > ul > li > .content > .name > a')

    for (let i = 0; i < as.length; i++) {
      const a = as[i]
      const li = a.parentNode.parentNode.parentNode

      a.onclick = () => {
        Route.get(li.getAttribute('data-file'), (err, _route) => {
          if (err) {
            return console.error(err)
          }

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
    const a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      const len = this.route.data.length

      const data = clone(this.route.data)
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
            entry.routeDirection = turn[entry.routeDirection]
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

      if (typeof data.title === 'object') {
        const title = {}
        forEach(data.title, (name, at) => {
          title[len - at] = name
        })
        data.title = title
      }

      global.setRoute(new Route('', data))

      return false
    }
    a.appendChild(document.createTextNode('Rotate route'))

    return a
  }
}
