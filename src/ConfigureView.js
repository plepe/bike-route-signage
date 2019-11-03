/* global getComputedStyle:false */
const Form = require('modulekit-form')
const Tab = require('modulekit-tabs').Tab
const forEach = require('for-each')

const colors = {
  mainColor: 'Route Farbe',
  otherColor: 'Fortgesetzt Farbe',
  backgroundColor: 'Hintergrundfarbe',
  titleColor: 'Titel Farbe',
  titleBackgroundColor: 'Titel Hintergrundfarbe'
}
let defaultValues = {}

module.exports = class ConfigureView {
  constructor (app) {
    const div = document.createElement('form')
    div.id = 'configureView'

    this.tab = new Tab({ id: 'configureView' })
    app.tabs.add(this.tab)

    this.tab.header.innerHTML = 'Ansicht'
    this.tab.content.appendChild(div)

    defaultValues = {
      pick: '4,3,2,1,1'
    }

    const formDef = {
      pick: {
        name: 'Prioritäten',
        type: 'text',
        default: defaultValues.pick
      }
    }

    forEach(colors, (title, color) => {
      defaultValues[color] = getComputedStyle(document.documentElement).getPropertyValue('--' + color)
      formDef[color] = {
        name: title,
        type: 'text',
        default: defaultValues[color]
      }
    })

    this.form = new Form('view', formDef)

    this.form.show(div)

    this.form.onchange = () => {
      const data = this.form.get_data()
      global.updateStatus(data)

      forEach(colors, (title, color) => {
        if (data[color] !== defaultValues[color]) {
          document.documentElement.style.setProperty('--' + color, data[color])
        }
      })
    }

    const submit = document.createElement('input')
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
