const locations = JSON.parse(
  document.getElementById('map').dataset.locations || '[]'
)
console.log(locations)

const [lng, lat] = locations[0]?.coordinates || [0, 0] // GeoJSON is [lng, lat]
const map = L.map('map', {
  center: [lat, lng],
  zoom: 8,
  zoomControl: false,
})

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
}).addTo(map)

locations.forEach((l) => {
  const [lng2, lat2] = l.coordinates
  L.marker([lat2, lng2]).addTo(map)
})
