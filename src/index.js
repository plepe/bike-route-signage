/* global FileReader:false, alert:false, location:false */

const queryString = require('query-string')
const yaml = require('yaml')
const forEach = require('for-each')
const Tabs = require('modulekit-tabs').Tabs
const Tab = require('modulekit-tabs').Tab

const Route = require('./Route')
const httpGet = require('./httpGet')
const clearDomNode = require('./clearDomNode')
const getEmSize = require('./getEmSize')
const App = require('./App')
const Modules = {
  map: require('./Map'),
  navigation: require('./Navigation'),
  configureView: require('./ConfigureView'),
  edit: require('./Edit'),
  source: require('./Source'),
  geolocation: require('./Geolocation')
}

const modules = {}
let app = new App()
let options
let route
let environmentTab

global.loadFile = (file, callback) => {
  httpGet('data/' + file + '.yml', {}, (err, result) => {
    if (err) {
      return callback(err)
    }

    const data = yaml.parse(result.body)
    callback(null, data)
  })
}

function updateStatus (data) {
  if ('file' in data && (!route || data.file !== options.id)) {
    options.file = data.file

    if (!route || route.id !== data.file) {
      if (data.file === '') {
        setRoute(new Route('', { route: [] }))
      } else {
        Route.get(data.file, (err, _route) => {
          if (err) {
            return console.error(err)
          }

          setRoute(_route)
          updateStatus(data)
        })
        return
      }
    }
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

  global.history.replaceState(options, '', '?' + queryString.stringify(options))

  update()
}
global.updateStatus = updateStatus

function update () {
  if (route) {
    route.render(options, (err, result) => {
      if (err) {
        document.getElementById('route-sign').innerHTML = ''
        return console.error(err)
      }

      document.getElementById('route-sign').innerHTML = result

      forEach(modules, module => module.updateStatus(options))
    })
  }
}

function setRoute (_route) {
  if (route) {
    route.removeListener('update', update)
  }

  route = _route
  forEach(modules, module => module.setRoute(route))
  updateStatus({ file: route.id })

  route.on('update', update)
}
global.setRoute = setRoute

function _load2 () {
  Route.get(options.file, (err, route) => {
    if (err) {
      return alert(err)
    }

    setRoute(route)
  })
}

function load () {
  if (options.file === '') {
    route = new Route('', { route: [] })
    _load2()
    return
  }

  _load2()
}

let loadListCallbacks
function loadList (callback) {
  global.files = [ 'arndt-margareten-oper', 'oper-margareten-arndt' ]
  if (global.files) {
    return callback(null, global.files)
  }

  if (loadListCallbacks) {
    loadListCallbacks.push(callback)
    return
  }

  loadListCallbacks = [callback]
  const files = []

  httpGet('data/', {}, (err, result) => {
    if (err) {
      return callback(err)
    }

    const regexp = new RegExp(/href="(.*data\/)?([^"]+)\.yml"/g)
    let m
    // grep all files from page
    while (m = regexp.exec(result.body)) { // eslint-disable-line
      files.push(decodeURIComponent(m[2]))
    }

    global.files = files

    loadListCallbacks.forEach(cb => cb(null, files))
    loadListCallbacks = null
  })
}
global.loadList = loadList

window.onload = function () {
  options = queryString.parse(location.search)

  let tabs = new Tabs(document.getElementById('menu'))

  app.modules = modules
  app.tabs = tabs
  app.options = options

  forEach(Modules, (Module, k) => {
    modules[k] = new Module(app)
  })

  if ('file' in options) {
    load()
  }

  const forms = document.getElementsByTagName('form')
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i]

    form.onsubmit = () => {
      const data = {}

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

  checkResponsive()
  window.onresize = checkResponsive
}

function checkResponsive () {
  const environment = document.getElementById('environment')
  const size = getEmSize(environment)
  const bodyWidthEm = document.body.offsetWidth / size

  if (bodyWidthEm < 50 && !environmentTab) {
    environmentTab = new Tab({ id: 'environment', weight: -1 })
    app.tabs.add(environmentTab)
    environmentTab.select()

    environmentTab.header.innerHTML = 'Routentafel'
    environmentTab.content.appendChild(environment)
    document.body.classList.add('environment-tabbed')
  }
  if (bodyWidthEm >= 50 && environmentTab) {
    let isSelected = environmentTab.isSelected()
    document.body.appendChild(environment)
    app.tabs.remove(environmentTab)
    environmentTab = null
    document.body.classList.remove('environment-tabbed')
    if (isSelected && app.tabs.list.length) {
      app.tabs.list[0].select()
    }
  }

  app.emit('resize')
}
