const Tab = require('modulekit-tabs').Tab
const yaml = require('yaml')

module.exports = class Source {
  constructor (app) {
    this.dom = document.createElement('pre')
    this.dom.id = 'source'
    this.dom.contentEditable = true
    this.tab = new Tab({ id: 'source' })
    app.tabs.add(this.tab)

    this.tab.header.innerHTML = 'Quellcode'
    this.tab.content.appendChild(this.dom)

    this.updateFun = () => {
      this.update()
    }

    this.dom.oninput = () => {
      if (this.timeout) {
        global.clearTimeout(this.timeout)
      }

      this.timeout = global.setTimeout(() => this.submitChanges(), 100)
    }
  }

  submitChanges () {
    let data
    try {
      data = yaml.parse(this.dom.textContent)
    } catch (e) {
      this.dom.classList.add('error')
      return console.log(e.message)
    }

    this.dom.classList.remove('error')
    if (data) {
      this.route.data = data
      this.updateFromSource = true
      this.route.update()
      this.updateFromSource = false
    }
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

    this.dom.innerHTML = ''
    this.dom.appendChild(document.createTextNode(this.route.save()))
  }

  updateStatus (options) {
  }
}
