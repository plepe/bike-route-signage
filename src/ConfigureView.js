const Tab = require('modulekit-tabs').Tab

const updateInput = require('./updateInput')

module.exports = class ConfigureView {
  constructor (app) {
    const div = document.getElementById('configureView')
    this.tab = new Tab({ id: 'configureView' })
    app.tabs.add(this.tab)

    this.tab.header.innerHTML = 'Ansicht'
    this.tab.content.appendChild(div)
  }

  setRoute (route) {
    this.route = route
  }

  updateStatus (options) {
    if (options.pick) {
      updateInput('input[name=pick]', options.pick)
    }
  }
}
