#!/usr/bin/env node
var queryString = require('query-string')
const yaml = require('yaml')
const fs = require('fs')
const JSDOM = require('jsdom').JSDOM

const Route = require('./src/Route')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

const dom = new JSDOM(fs.readFileSync('index.html', 'utf-8'))
const document = dom.window.document

let options = queryString.parse(process.env.QUERY_STRING)

let text
if (!('file' in options)) {
  text = '<ul>'
  fs.readdirSync('data/', {})
    .forEach(file => {
      let m = file.match(/^([^\.].*)\.yml$/)
      if (m) {
        text += '<li><a href="?file=' + m[1] + '">' + m[1] + '</a></li>'
      }
    })
  text += '<li><a href="?file=">Neue Datei</a></li>'
  text += '</ul>'
} else {
  if (options.file.match(/\/\./)) {
    text = 'Invalid file'
  } else {
    let route
    if (options.file === '') {
      route = new Route({ route: [] })
    } else {
      route = new Route(yaml.parse(fs.readFileSync('data/' + options.file + '.yml', 'utf8')))
    }

    text = route.render(options)
  }
}

document.getElementById('route-sign').innerHTML = text

let at = (+options.at) || 0
document.getElementById('at-100').value = at - 100
document.getElementById('at-25').value = at - 100
document.getElementById('at').value = at
document.getElementById('at+25').value = at + 25
document.getElementById('at+100').value = at + 100
let elements = document.querySelectorAll('input[name=file]')
for (let i = 0; i < elements.length; i++) {
  elements[i].setAttribute('value', options.file)
}

console.log(dom.serialize())
