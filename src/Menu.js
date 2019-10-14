module.exports = class Menu {
  constructor () {
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
