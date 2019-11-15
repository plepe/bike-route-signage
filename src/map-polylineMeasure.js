/* global L:false */

require('leaflet.polylinemeasure')

let control

function polylineMeasure (map) {
  // Measurement plugin
  if (L.control.polylineMeasure) {
    control = L.control.polylineMeasure({
    }).addTo(map)
  }

  return {
    blockPopup () {
      return control._measuring
    }
  }
}

module.exports = polylineMeasure
