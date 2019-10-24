module.exports = function clone (ob) {
  return JSON.parse(JSON.stringify(ob))
}
