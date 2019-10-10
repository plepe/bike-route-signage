#!/usr/bin/env node
console.log('Content-Type: text/html; charset=utf8')
console.log('')

console.log('<!DOCTYPE html>')
console.log('<html><head>')
console.log('  <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css">')
console.log('</head><body>')

const route = require('./src/route')

console.log(route())

console.log('</body></html>')
