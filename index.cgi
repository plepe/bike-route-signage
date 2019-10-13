#!/usr/bin/env node
var queryString = require('query-string')
const yaml = require('yaml')
const fs = require('fs')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

console.log('<!DOCTYPE html>')
console.log('<html><head>')
console.log('  <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css">')
console.log('  <link rel="stylesheet" href="style.css">')
console.log('  <script src="dist/app.js"></script>')
console.log('</head><body lang="de">')

console.log('<div id="environment">')
console.log('<div id="route-sign">')
const Route = require('./src/Route')
const route = new Route(yaml.parse(fs.readFileSync('data/wiental.yml', 'utf8')))
let options = queryString.parse(process.env.QUERY_STRING)

console.log(route.render(options))
console.log('</div>')
console.log('<div id="floor">')
console.log('</div>')
console.log('</div>')

let at = (+options.at) || 0
console.log('<div id="menu">')
console.log('Location: ')
console.log('<form method="get"><input type="hidden" id="at-100" name="at" value="' + (at - 100) + '"><input type="submit" value="-100&#x202F;m"></form>')
console.log('<form method="get"><input type="hidden" id="at-25" name="at" value="' + (at - 25) + '"><input type="submit" value="-25&#x202F;m"></form>')
console.log('<form method="get"><input type="text" id="at" name="at" value="' + at + '">&#x202F;m</form>')
console.log('<form method="get"><input type="hidden" id="at+25" name="at" value="' + (at + 25) + '"><input type="submit" value="+25&#x202F;m"></form>')
console.log('<form method="get"><input type="hidden" id="at+100" name="at" value="' + (at + 100) + '"><input type="submit" value="+100&#x202F;m"></form>')
console.log('</div>')

console.log('</body></html>')
