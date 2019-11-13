/* global L:false */

require('leaflet.polylinemeasure')

let control

function polylineMeasure (map) {
  // Measurement plugin
  if (L.control.polylineMeasure) {
    control =  L.control.polylineMeasure({
    }).addTo(map)
  }

  control.blockPopup = function () {
    console.log(control)
    return control.measuring
  }

  return control
}

module.exports = polylineMeasure
