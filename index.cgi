#!/usr/bin/env node
var queryString = require('query-string')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

console.log('<!DOCTYPE html>')
console.log('<html><head>')
console.log('  <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css">')
console.log('  <link rel="stylesheet" href="style.css">')
console.log('</head><body lang="de">')

console.log('<div id="environment">')
console.log('<div id="route-sign">')
const route = require('./src/route')
let options = queryString.parse(process.env.QUERY_STRING)

console.log(route(options))
console.log('</div>')
console.log('<div id="floor">')
console.log('</div>')
console.log('</div>')

let at = (+options.at) || 0
console.log('<div id="menu">')
console.log('Location: ')
console.log('<form method="get"><input type="hidden" name="at" value="' + (at - 100) + '"><input type="submit" value="-100m"></form>')
console.log('<form method="get"><input type="hidden" name="at" value="' + (at - 25) + '"><input type="submit" value="-25m"></form>')
console.log(at + 'm')
console.log('<form method="get"><input type="hidden" name="at" value="' + (at + 25) + '"><input type="submit" value="+25m"></form>')
console.log('<form method="get"><input type="hidden" name="at" value="' + (at + 100) + '"><input type="submit" value="+100m"></form>')
console.log('</div>')

console.log('</body></html>')
