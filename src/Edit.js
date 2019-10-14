const Form = require('modulekit-form')

// TODO: embed modulekit-lang
global.lang_str = {}
global.ui_lang = 'de'

module.exports = class Edit {
  constructor () {
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
      edit.appendChild(document.createTextNode('EDIT'))
      edit.onclick = () => {
        const entry = this.route.data.route[li.getAttribute('data-index')]
        this.edit(entry)
        return false
      }

      li.appendChild(edit)
    }
  }
}
