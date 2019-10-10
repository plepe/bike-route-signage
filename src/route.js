const fs = require('fs')
const yaml = require('yaml')

function route () {
  const data = yaml.parse(fs.readFileSync('wiental.yml', 'utf8'))

  data.route.reverse()

  let result = ''

  result += '<ul>'
  data.route.forEach(entry => {
    result += '<li>' + entry.name + '</li>'
  })
  result += '</ul>'

  return result
}

module.exports = route
