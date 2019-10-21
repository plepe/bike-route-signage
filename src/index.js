const queryString = require('query-string')
const yaml = require('yaml')

const Route = require('./Route')
const httpGet = require('./httpGet')
const Modules = [
  require('./Map'),
  require('./Menu'),
  require('./Edit')
]

let modules = []
let options
let route

function updateStatus (data) {
  if ('at' in data) {
    options.at = data.at
  }

  history.replaceState(options, "", "?" + queryString.stringify(options))

  if (route) {
    document.getElementById('route-sign').innerHTML = route.render(options)
  }

  modules.forEach(module => module.updateStatus(options))
}
global.updateStatus = updateStatus

function setRoute (_route) {
  route = _route
  document.getElementById('route-sign').innerHTML = route.render(options)
  modules.forEach(module => module.setRoute(route))
  modules.forEach(module => module.updateStatus(options))
}
global.setRoute = setRoute

function _load2 () {
  setRoute(route)
}

function load () {
  if (options.file === '') {
    route = new Route({ route: [] })
    _load2()
    return
  }

  httpGet('data/' + options.file + '.yml', {}, (err, result) => {
    if (err) {
      return alert(err)
    }

    route = new Route(yaml.parse(result.body))
    _load2()
  })
}

function loadList (callback) {
  if (global.files) {
    return callback(null, global.files)
  }

  let files = []

  httpGet('data/', {}, (err, result) => {
    if (err) {
      callback(err)
    }

    let regexp = new RegExp(/href=".*data\/([^"]+)\.yml"/g)
    let m
    while (m = regexp.exec(result.body)) {
      files.push(m[1])
    }

    callback(null, files)
  })
}

function showList (err, data) {
  let result = '<ul>\n'

  data.forEach(file => {
    result += '  <li><a href="?file=' + file + '">' + decodeURIComponent(file) + '</a></li>\n'
  })

  result += '<li><a href="?file=">Neue Datei</a></li>'
  result += '</ul>'

  document.getElementById('route-sign').innerHTML = result
}

window.onload = function () {
  options = queryString.parse(location.search)

  Modules.forEach(Module => modules.push(new Module()))

  if ('file' in options) {
    load()
  } else {
    loadList(showList)
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
