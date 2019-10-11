#!/usr/bin/env node
var queryString = require('query-string')

console.log('Content-Type: text/html; charset=utf8')
console.log('')

console.log('<!DOCTYPE html>')
console.log('<html><head>')
console.log('  <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css">')
console.log('  <link rel="stylesheet" href="style.css">')
console.log('</head><body>')

const route = require('./src/route')
let options = queryString.parse(process.env.QUERY_STRING)

console.log(route(options))

let at = (+options.at) || 0
console.log('<form method="get">Location: <input type="submit" name="at" value="' + (at - 100) + '"><input type="submit" name="at" value="' + (at + 100) + '"></form>')

console.log('</body></html>')
