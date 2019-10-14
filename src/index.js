const queryString = require('query-string')
const yaml = require('yaml')

const Route = require('./Route')
const httpGet = require('./httpGet')
const Modules = [
  require('./Map')
]

let modules = []
let options
let route

function updateStatus (data) {
  if ('at' in data) {
    document.getElementById('at').value = data.at
    document.getElementById('at-100').value = +data.at - 100
    document.getElementById('at-25').value = +data.at - 25
    document.getElementById('at+25').value = +data.at + 25
    document.getElementById('at+100').value = +data.at + 100
    options.at = data.at
  }

  history.replaceState(options, "", "?" + queryString.stringify(options))

  if (route) {
    document.getElementById('route-sign').innerHTML = route.render(options)
  }

  modules.forEach(module => module.updateStatus(options))
}
global.updateStatus = updateStatus

function load () {
  httpGet('data/' + options.file + '.yml', {}, (err, result) => {
    if (err) {
      return alert(err)
    }

    route = new Route(yaml.parse(result.body))
    document.getElementById('route-sign').innerHTML = route.render(options)

    modules.forEach(module => module.setRoute(route))

    modules.forEach(module => module.updateStatus(options))
  })
}

window.onload = function () {
  options = queryString.parse(location.search)

  Modules.forEach(Module => modules.push(new Module()))

  if (options.file) {
    load()
  }

  const forms = document.getElementsByTagName('form')
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i]

    form.onsubmit = () => {
      let data = {}

      for (let j = 0; j < form.elements.length; j++) {
        const element = form.elements[j]

        if (element.name) {
          data[element.name] = element.value
        }
      }

      updateStatus(data)

      return false
    }
  }
}
