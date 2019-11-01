#!/usr/bin/env node
var queryString = require('query-string')
const yaml = require('yaml')
const fs = require('fs')
const JSDOM = require('jsdom').JSDOM

const Route = require('./src/Route')
const updateInput = require('./src/updateInput')
const updateFileSelect = require('./src/updateFileSelect')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

const dom = new JSDOM(fs.readFileSync('index.html', 'utf-8'))
const document = dom.window.document

let options = queryString.parse(process.env.QUERY_STRING)

global.loadFile = (file, callback) => {
  fs.readFile('data/' + file + '.yml', 'utf8', (err, contents) => {
    if (err) {
      return callback(err)
    }

    let data = yaml.parse(contents)
    callback(null, data)
  })
}

global.files = []
fs.readdirSync('data/', {})
  .forEach(file => {
    let m = file.match(/^([^\.].*)\.yml$/)
    if (m) {
      global.files.push(m[1])
    }
  })

let text = ''
text += '<script>var files = ' + JSON.stringify(global.files) + '</script>'
if (!('file' in options)) {
  text += '<ul>'
  global.files.forEach(name => {
    text += '<li><a href="?file=' + name + '">' + name + '</a></li>'
  })
  text += '<li><a href="?file=">Neue Datei</a></li>'
  text += '</ul>'
  document.getElementById('route-sign').innerHTML = text
  final()
} else {
  if (options.file.match(/\/\./)) {
    text += 'Invalid file'
    document.getElementById('route-sign').innerHTML = text
  } else if (!fs.existsSync('data/' + options.file + '.yml')) {
    text += 'File does not exist'
    document.getElementById('route-sign').innerHTML = text
  } else {
    if (options.file === '') {
      render(new Route('', { route: [] }))
    } else {
      loadAndRender(options.file)
    }
  }
}

updateFileSelect(files, options, document)

function loadAndRender (id) {
  Route.get(id, (err, route) => {
    if (err) {
      return console.error(err)
    }

    if (route.data.length && options.at > route.data.length && route.data.continue) {
      options.file = route.data.continue.file
      options.at = options.at - route.data.length + route.data.continue.at
      return loadAndRender(options.file)
    }

    render(route)
  })
}

function render(route) {
  route.render(options,
    (err, result) => {
      if (err) {
        return console.error(err)
      }
      document.getElementById('route-sign').innerHTML = text + result
      final()
    }
  )
}

function final () {
  updateInput('input[name=file]', options.file, { document })
  updateInput('input[name=at]', options.at || 0, { document })
  if (options.pick) {
    updateInput('input[name=pick]', options.pick, { document })
  }

  let at = (+options.at) || 0
  document.getElementById('at-100').value = at - 100
  document.getElementById('at-25').value = at - 100
  document.getElementById('at+25').value = at + 25
  document.getElementById('at+100').value = at + 100

  console.log(dom.serialize())
}
