const queryString = require('query-string')
const yaml = require('yaml')
const forEach = require('for-each')
const asyncForEach = require('async-each')

const Route = require('./Route')
const httpGet = require('./httpGet')
const Modules = {
  map: require('./Map'),
  menu: require('./Menu'),
  edit: require('./Edit')
}

let modules = {}
let options
let route

global.loadFile = (file, callback) => {
  httpGet('data/' + file + '.yml', {}, (err, result) => {
    if (err) {
      return callback(err)
    }

    let data = yaml.parse(result.body)
    callback(null, data)
  })
}

function updateStatus (data) {
  if ('file' in data && data.file !== options.file) {
    options.file = data.file
    Route.get(data.file, (err, _route) => {
      if (err) {
        return console.error(err)
      }

      setRoute(_route)
      updateStatus(data)
    })
    return
  }

  if ('at' in data) {
    options.at = data.at

    if (route.data.length && options.at > route.data.length && route.data.continue) {
      data.file = route.data.continue.file
      data.at = options.at - route.data.length + route.data.continue.at
      return updateStatus(data)
    }
  }

  if ('pick' in data) {
    options.pick = data.pick
  }

  history.replaceState(options, "", "?" + queryString.stringify(options))

  if (route) {
    route.render(options, (err, result) => {
      if (err) {
        document.getElementById('route-sign').innerHTML = ''
        return console.error(err)
      }

      document.getElementById('route-sign').innerHTML = result
    })
  }

  forEach(modules, module => module.updateStatus(options))
}
global.updateStatus = updateStatus

function setRoute (_route) {
  route = _route
  forEach(modules, module => module.setRoute(route))
  updateStatus(options)
}
global.setRoute = setRoute

function _load2 () {
  Route.get(options.file, (err, route) => setRoute(route))
}

function load () {
  if (options.file === '') {
    route = new Route('', { route: [] })
    _load2()
    return
  }

  if (!global.files) {
    global.files = [ options.file ]
  }

  _load2()
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
  result += '<li><a><label><input id="upload" type="file" style="position: fixed; top: -1000px" onchange="form.submit()">Lokale Datei öffnen</label></a></li>'
  result += '</ul>'

  document.getElementById('route-sign').innerHTML = result

  document.getElementById('upload').onchange = e => {
    Array.from(e.target.files).forEach(file => {
      var reader = new FileReader()
      reader.onload = (e) => {
        var contents = e.target.result
        let m = file.name.match(/^(.*)\.yml$/)
        this.setRoute(new Route(m || file.name, yaml.parse(contents)))
      }
      reader.readAsText(file)
    })

    return false
  }
}

window.onload = function () {
  options = queryString.parse(location.search)

  let app = { modules }
  forEach(Modules, (Module, k) => modules[k] = new Module(app))

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
