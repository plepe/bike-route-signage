var FullscreenControl = L.Control.extend({
  options: {
    position: 'topleft'
    // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-fullscreen')
    container.innerHTML = "<a href='#'><i class='fa fa-arrows-alt'></i></a>"
    container.title = 'Fullscreen'

    container.onclick = function () {
      document.body.classList.toggle('map-fullscreen')
      map.invalidateSize()
      return false
    }

    return container
  }
})

module.exports = function fullscreen (map) {
  map.addControl(new FullscreenControl())
}
