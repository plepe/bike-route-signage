const Form = require('modulekit-form')
const Tab = require('modulekit-tabs').Tab

const updateInput = require('./updateInput')

module.exports = class ConfigureView {
  constructor (app) {
    const div = document.createElement('form')
    div.id = 'configureView'

    this.tab = new Tab({ id: 'configureView' })
    app.tabs.add(this.tab)

    this.tab.header.innerHTML = 'Ansicht'
    this.tab.content.appendChild(div)

    this.form = new Form('view', {
      pick: {
        name: 'Prioritäten',
        type: 'text',
        default: '4,3,2,1,1'
      }
    })

    this.form.show(div)
    this.form.onchange = () => {
      let data = this.form.get_data()
      global.updateStatus(data)
    }

    let submit = document.createElement('input')
    submit.type = 'submit'
    submit.style.display = 'none'
    div.appendChild(submit)
  }

  setRoute (route) {
    this.route = route
  }

  updateStatus (options) {
    if (options.pick) {
      this.form.set_data({
        pick: options.pick
      })
    }
  }
}
