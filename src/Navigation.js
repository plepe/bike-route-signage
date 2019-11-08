const Tab = require('modulekit-tabs').Tab

const updateInput = require('./updateInput')
const updateFileSelect = require('./updateFileSelect')
const Route = require('./Route')
const yaml = require('yaml')

module.exports = class Navigation {
  constructor (app) {
    this.dom = document.getElementById('navigation')

    this.tab = new Tab({ id: 'navigation' })
    app.tabs.add(this.tab)
    this.tab.select()

    this.tab.header.innerHTML = 'Navigation'
    this.tab.content.appendChild(this.dom)

    const div = document.createElement('div')
    this.dom.appendChild(div)

    global.loadList(() => updateFileSelect(global.files, app.options, document))

    // the map is shown inside this tab
    this.tab.on('select', () => {
      app.modules.map.map.invalidateSize()
    })

    this.addNewButton()
    this.addUploadButton()
  }

  addNewButton () {
    const form = document.getElementById('open-file')
    if (!form) {
      return
    }

    const newFile = document.createElement('button')
    newFile.appendChild(document.createTextNode('Neue Datei'))
    form.appendChild(newFile)
    newFile.onclick = () => {
      global.updateStatus({ file: '', at: 0 })
      return false
    }
  }

  addUploadButton () {
    const form = document.getElementById('open-file')
    if (!form) {
      return
    }

    const label = document.createElement('label')
    label.className = 'upload-file'
    const uploadFile = document.createElement('input')
    uploadFile.type = 'file'
    uploadFile.setAttribute('style', 'position: fixed; top: -1000px;')
    uploadFile.onchange = e => {
      Array.from(e.target.files).forEach(file => {
        var reader = new FileReader()
        reader.onload = (e) => {
          var contents = e.target.result
          const m = file.name.match(/^(.*)\.yml$/)
          let route = new Route(m ? m[1] : file.name, yaml.parse(contents))
          global.setRoute(route)
          global.updateStatus({ at: 0, file: route.id })
        }
        reader.readAsText(file)
      })
      return false
    }

    label.appendChild(document.createTextNode('Lokale Datei öffnen'))
    label.appendChild(uploadFile)
    form.appendChild(label)
  }

  setRoute (route) {
    this.route = route
  }

  updateStatus (options) {
    updateInput('input[name=file]', options.file)
    updateInput('input[name=at]', options.at || 0)

    document.getElementById('at-100').value = +options.at - 100
    document.getElementById('at-25').value = +options.at - 25
    document.getElementById('at+25').value = +options.at + 25
    document.getElementById('at+100').value = +options.at + 100
  }
}
