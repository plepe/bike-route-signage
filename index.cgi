#!/usr/bin/env node
var queryString = require('query-string')
const yaml = require('yaml')
const fs = require('fs')

const Route = require('./src/Route')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

console.log('<!DOCTYPE html>')
console.log('<html><head>')
console.log('  <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css">')
console.log('  <link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css">')
console.log('  <link rel="stylesheet" href="node_modules/leaflet-draw/dist/leaflet.draw.css">')
console.log('  <link rel="stylesheet" href="node_modules/modulekit-form/dist/modulekit-form.css">')
console.log('  <link rel="stylesheet" href="style.css">')
console.log('  <script src="dist/app.js"></script>')
console.log('</head><body lang="de">')

let options = queryString.parse(process.env.QUERY_STRING)

if (!(options.file)) {
  console.log('<ul>')
  fs.readdirSync('data/', {})
    .forEach(file => {
      let m = file.match(/^([^\.].*)\.yml$/)
      if (m) {
        console.log('<li><a href="?file=' + m[1] + '">' + m[1] + '</a></li>')
      }
    })
  console.log('</ul>')
} else {
  if (options.file.match(/\/\./)) {
    console.log('Invalid file')
  } else {
    const route = new Route(yaml.parse(fs.readFileSync('data/' + options.file + '.yml', 'utf8')))

    console.log('<div id="environment">')
    console.log('<div id="route-sign">')
    console.log(route.render(options))
    console.log('</div>')
    console.log('<div id="floor"></div>')
    console.log('</div>')
  }

  let at = (+options.at) || 0
  console.log('<div id="menu">')
  console.log('Location: ')
  console.log('<form method="get"><input type="hidden" name="file" value="' + options.file + '"><input type="hidden" id="at-100" name="at" value="' + (at - 100) + '"><input type="submit" value="-100&#x202F;m"></form>')
  console.log('<form method="get"><input type="hidden" name="file" value="' + options.file + '"><input type="hidden" id="at-25" name="at" value="' + (at - 25) + '"><input type="submit" value="-25&#x202F;m"></form>')
  console.log('<form method="get"><input type="hidden" name="file" value="' + options.file + '"><input type="text" id="at" name="at" value="' + at + '">&#x202F;m</form>')
  console.log('<form method="get"><input type="hidden" name="file" value="' + options.file + '"><input type="hidden" id="at+25" name="at" value="' + (at + 25) + '"><input type="submit" value="+25&#x202F;m"></form>')
  console.log('<form method="get"><input type="hidden" name="file" value="' + options.file + '"><input type="hidden" id="at+100" name="at" value="' + (at + 100) + '"><input type="submit" value="+100&#x202F;m"></form>')
  console.log('</div>')
  console.log('<div id="map-container"></div>')
}

console.log('</body></html>')
