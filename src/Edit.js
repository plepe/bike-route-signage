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
      this.route.reindex()

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

  edit (entry) {
    this.dom.innerHTML = ''

    this.form = new Form('data', require('./entry.json'))

    this.form.set_data(entry)
    this.form.show(this.dom)

    let input = document.createElement('input')
    input.type = 'submit'
    input.value = 'Update'
    this.dom.appendChild(input)

    this.dom.onsubmit = () => {
      let data = this.form.get_data()
      for (let k in data) {
        if (data[k]) {
          entry[k] = data[k]
        }
      }

      this.dom.innerHTML = ''
      global.updateStatus({})
      return false
    }
  }

  updateStatus (options) {
    let lis = document.querySelectorAll("#route-sign > ul > li")

    for (let i = 0; i < lis.length; i++) {
      let li = lis[i]
      let edit = document.createElement('a')
      edit.href = '#'
      edit.className = 'edit'
      edit.innerHTML = '<i class="fas fa-edit"></i>'
      edit.onclick = () => {
        const entry = this.route.data.route[li.getAttribute('data-index')]
        this.edit(entry)
        return false
      }

      let domContent = li.getElementsByClassName('content')
      domContent[0].insertBefore(edit, domContent[0].firstChild)
    }

    if ('at' in options) {
      at = options.at
    }
  }
}
