const queryString = require('query-string')
const yaml = require('yaml')

const Route = require('./Route')
const httpGet = require('./httpGet')

let current
let route

function updateStatus (data) {
  if ('at' in data) {
    document.getElementById('at').value = data.at
    document.getElementById('at-100').value = +data.at - 100
    document.getElementById('at-25').value = +data.at - 25
    document.getElementById('at+25').value = +data.at + 25
    document.getElementById('at+100').value = +data.at + 100
    current.at = data.at
  }

  history.replaceState(current, "", "?" + queryString.stringify(current))

  if (route) {
    document.getElementById('route-sign').innerHTML = route.render(current)
  }
}

window.onload = function () {
  current = queryString.parse(location.search)

  httpGet('data/wiental.yml', {}, (err, result) => {
    if (err) {
      return alert(err)
    }

    route = new Route(yaml.parse(result.body))
    document.getElementById('route-sign').innerHTML = route.render(current)
  })

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
