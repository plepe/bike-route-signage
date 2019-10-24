#!/usr/bin/env node
var queryString = require('query-string')
const yaml = require('yaml')
const fs = require('fs')
const JSDOM = require('jsdom').JSDOM

const Route = require('./src/Route')
const updateInput = require('./src/updateInput')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

const dom = new JSDOM(fs.readFileSync('index.html', 'utf-8'))
const document = dom.window.document

let options = queryString.parse(process.env.QUERY_STRING)

global.files = []
fs.readdirSync('data/', {})
  .forEach(file => {
    let m = file.match(/^([^\.].*)\.yml$/)
    if (m) {
      global.files.push(m[1])
    }
  })
global.files.map(file =>
  new Route(file, yaml.parse(fs.readFileSync('data/' + file + '.yml', 'utf8')))
)

let text = ''
text += '<script>var files = ' + JSON.stringify(global.files) + '</script>'
if (!('file' in options)) {
  text += '<ul>'
  global.files.forEach(name => {
    text += '<li><a href="?file=' + name + '">' + name + '</a></li>'
  })
  text += '<li><a href="?file=">Neue Datei</a></li>'
  text += '</ul>'
} else {
  if (options.file.match(/\/\./)) {
    text += 'Invalid file'
  } else if (!fs.existsSync('data/' + options.file + '.yml')) {
    text += 'File does not exist'
  } else {
    let route
    if (options.file === '') {
      route = new Route('', { route: [] })
    } else {
      route = Route.get(options.file)
    }

    while (route.data.length && options.at > route.data.length && route.data.continue) {
      options.file = route.data.continue.file
      options.at = options.at - route.data.length + route.data.continue.at
      route = Route.get(options.file)
    }

    text += route.render(options)
  }
}

document.getElementById('route-sign').innerHTML = text

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
