module.exports = function updateInput (query, value, options = {}) {
  if (options.document) {
    document = options.document
  }

  let elements = document.querySelectorAll(query)
  for (let i = 0; i < elements.length; i++) {
    elements[i].value = value
    elements[i].setAttribute('value', value)
  }
}
