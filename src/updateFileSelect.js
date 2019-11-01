module.exports = function updateFileSelect (files, options, document) {
  if (!files) {
    if (options.file) {
      files = [ options.file ]
    } else {
      files = []
    }
  }

  let fileSelect = document.querySelectorAll('select[name=file]')
  if (fileSelect.length) {
    files.forEach(file => {
      let option = document.createElement('option')
      option.setAttribute('value', file)
      if (file === options.file) {
        option.setAttribute('selected', 'true')
      }
      option.appendChild(document.createTextNode(file))
      fileSelect[0].appendChild(option)
    })
  }
}
