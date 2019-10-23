const Form = require('modulekit-form')

// TODO: embed modulekit-lang
global.lang_str = {}
global.ui_lang = 'de'
let at

module.exports = class Edit {
  constructor () {
    let a = document.createElement('a')
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
    document.getElementById('menu').appendChild(a)

    this.dom = document.createElement('form')
    this.dom.id = 'edit'
    document.getElementById('menu').appendChild(this.dom)
  }

  setRoute (route) {
    this.route = route
  }

  clear () {
    this.dom.innerHTML = ''
  }

  edit (entry) {
    this.clear()

    this.form = new Form('data', require('./entry.json'))

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
        const entry = this.route.data.route[li.getAttribute('data-index')]
        this.edit(entry)
        return false
      }
    }

    if ('at' in options) {
      at = options.at
    }
  }
}
