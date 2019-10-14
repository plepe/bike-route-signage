const { saveAs } = require('file-saver')

module.exports = class Menu {
  constructor () {
    this.dom = document.getElementById('menu')

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
    document.getElementById('at').value = options.at
    document.getElementById('at-100').value = +options.at - 100
    document.getElementById('at-25').value = +options.at - 25
    document.getElementById('at+25').value = +options.at + 25
    document.getElementById('at+100').value = +options.at + 100
  }
}
