const updateInput = require('./updateInput')

module.exports = class ConfigureView {
  constructor () {
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
