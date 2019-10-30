const { saveAs } = require('file-saver')

const Route = require('./Route')
const updateInput = require('./updateInput')

turn = {
  left: 'right',
  right: 'left',
  diagleft: 'diagright',
  diagright: 'diagleft',
  straight: 'straight',
  both: 'both'
}

module.exports = class Navigation {
  constructor () {
    this.dom = document.getElementById('navigation')

    let div = document.createElement('div')
    this.dom.appendChild(div)

    let a = document.createElement('a')
    a.href = '#'
    a.onclick = () => {
      let blob = new Blob([ this.route.save() ], {
        type: 'text/vnd.yaml;charset=utf-8'
      })

      saveAs(blob, 'x.yml')
      return false
    }
    a.appendChild(document.createTextNode('Download file'))
    div.appendChild(a)
  }

  setRoute (route) {
    this.route = route
  }

  updateStatus (options) {
    updateInput('input[name=file]', options.file)
    updateInput('input[name=at]', options.at || 0)

    document.getElementById('at-100').value = +options.at - 100
    document.getElementById('at-25').value = +options.at - 25
    document.getElementById('at+25').value = +options.at + 25
    document.getElementById('at+100').value = +options.at + 100
  }
}
