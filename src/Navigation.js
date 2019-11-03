/* global Blob:false */

const { saveAs } = require('file-saver')
const Tab = require('modulekit-tabs').Tab

const updateInput = require('./updateInput')
const updateFileSelect = require('./updateFileSelect')

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

    const a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      const blob = new Blob([this.route.save()], {
        type: 'text/vnd.yaml;charset=utf-8'
      })

      saveAs(blob, 'x.yml')
      return false
    }
    a.appendChild(document.createTextNode('Download file'))
    div.appendChild(a)
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
