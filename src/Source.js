const CodeMirror = require('codemirror')
require('codemirror/mode/yaml/yaml')
const Tab = require('modulekit-tabs').Tab
const yaml = require('yaml')

module.exports = class Source {
  constructor (app) {
    this.app = app
    this.tab = new Tab({ id: 'source' })
    app.tabs.add(this.tab)

    this.editor = CodeMirror(this.tab.content, {
      mode: 'yaml'
    })

    this.tab.header.innerHTML = 'Quellcode'

    this.updateFun = () => {
      this.update()
    }

    this.tab.on('select', () => {
      this.editor.refresh()
      this.editor.focus()
    })

    this.editor.on('change', () => {
      if (this.updateFromUpdate) {
        return
      }

      if (this.timeout) {
        global.clearTimeout(this.timeout)
      }

      this.timeout = global.setTimeout(() => this.submitChanges(), 100)
    })
    this.editor.on('cursorActivity', () => this.updateMap())
  }

  updateMap () {
    let cursor = this.editor.getCursor()
    let line = this.editor.getValue().split(/\n/)[cursor.line]

    if (this.app.modules.map && this.app.modules.map.map) {
      let m = line.match(/\[ *(-?[0-9]+(?:\.[0-9]+)?), *(-?[0-9]+(?:\.[0-9]+)?) *\]/)
      if (m) {
        this.app.modules.map.map.panTo([m[2], m[1]])

        if (this.poiMarker) {
          this.poiMarker.setLatLng([m[2], m[1]])
        } else {
          this.poiMarker = L.circleMarker([m[2], m[1]], { pane: 'location', fillColor: 'green', fillOpacity: 1, weight: 0, radius: 7 }).addTo(this.app.modules.map.map)
        }
      } else {
        if (this.poiMarker) {
          this.app.modules.map.map.removeLayer(this.poiMarker)
          delete this.poiMarker
        }
      }
    }
  }

  submitChanges () {
    let data
    try {
      data = yaml.parse(this.editor.getValue())
    } catch (e) {
      this.tab.content.classList.add('error')
      return console.log(e.message)
    }

    this.tab.content.classList.remove('error')
    if (data) {
      this.route.data = data
      this.updateFromSource = true
      this.route.update()
      this.updateFromSource = false
    }

    this.updateMap()
  }

  setRoute (route) {
    if (this.route) {
      this.route.removeListener('update', this.updateFun)
    }

    this.route = route
    this.route.on('update', this.updateFun)
    this.update()
  }

  update () {
    if (this.updateFromSource) {
      return
    }

    this.updateFromUpdate = true
    this.editor.setValue(this.route.save())
    this.updateFromUpdate = false
  }

  updateStatus (options) {
  }
}
