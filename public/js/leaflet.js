const locations = JSON.parse(
  document.getElementById('map').dataset.locations || '[]'
)
console.log(locations)

const [lng, lat] = locations[0]?.coordinates || [0, 0] // GeoJSON is [lng, lat]
const map = L.map('map', {
  zoomControl: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  touchZoom: false,
  boxZoom: false,
})

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
}).addTo(map)

const bounds = L.latLngBounds()

locations.forEach((l) => {
  const [lng, lat] = l.coordinates
  const popupHtml = `
    <div class="popup">
      <strong>${l.description || 'Location'}</strong><br/>
      ${l.address || ''}<br/>
      ${l.day ? 'Day ' + l.day : ''}
    </div>
  `
  const marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(popupHtml, { closeButton: false, offset: [0, -10] })

  marker.on('mouseover', function () {
    this.openPopup()
  })
  marker.on('mouseout', function () {
    this.closePopup()
  })

  // 4. Extend the bounds to include the current marker's location
  bounds.extend([lat, lng])
})

if (locations.length > 0) {
  map.fitBounds(bounds, {
    padding: [50, 50], // [x, y] padding in pixels
  })
}
