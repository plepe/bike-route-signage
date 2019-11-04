/* global L:false */

require('leaflet.polylinemeasure')

module.exports = function polylineMeasure (map) {
  // Measurement plugin
  if (L.control.polylineMeasure) {
    L.control.polylineMeasure({
    }).addTo(map)
  }
}
