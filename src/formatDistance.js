const numeral = require('numeraljs')

// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
function roundToPrecision(x, precision) {
    var y = +x + (precision === undefined ? 0.5 : precision/2)
    return y - (y % (precision === undefined ? 1 : +precision))
}

module.exports = function formatDistance (distance) {
  if (isNaN(distance)) {
    return ''
  }

  if (distance < 100) {
    return numeral(roundToPrecision(distance, 5)).format('0') + 'm'
  }
  if (distance < 800) {
    return numeral(roundToPrecision(distance, 50)).format('0') + 'm'
  }
  if (distance < 4000) {
    return numeral(roundToPrecision(distance / 1000, 0.1)).format('0.0') + 'km'
  }
  return numeral(roundToPrecision(distance / 1000, 1)).format('0') + 'km'
}
