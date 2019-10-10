#!/usr/bin/env node
console.log('Content-Type: text/html; charset=utf8')
console.log('')

const route = require('./src/route')

console.log(route())
