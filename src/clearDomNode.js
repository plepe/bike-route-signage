module.exports = function clearDomNode (node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}
