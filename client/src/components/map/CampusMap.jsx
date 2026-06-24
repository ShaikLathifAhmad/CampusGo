import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSelector } from 'react-redux'

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) => new L.Icon({
  iconUrl:      `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl:    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
})

const ICON_MAP = {
  hospital:   makeIcon('red'),
  college:    makeIcon('blue'),
  hostel:     makeIcon('green'),
  restaurant: makeIcon('yellow'),
  quarters:   makeIcon('grey'),
  default:    makeIcon('blue'),
}

function FitRoute({ route }) {
  const map = useMap()
  useEffect(() => {
    if (route?.coordinates?.length > 1) {
      const bounds = L.latLngBounds(route.coordinates.map((c) => [c.lat, c.lng]))
      map.fitBounds(bounds, { padding: [80, 80] })
    }
  }, [route, map])
  return null
}

export default function CampusMap({ locations = [] }) {
  const route    = useSelector((s) => s.map.route)
  const highlight = useSelector((s) => s.chat.highlightLocation)
  const multiHL   = useSelector((s) => s.chat.highlightMultipleLocations)

  const bounds = [[10.95000, 78.74544], [10.96135, 78.75984]]
  const center = [10.9556, 78.7526]

  const isHighlighted = (name) =>
    highlight === name || multiHL.includes(name)

  return (
    <MapContainer
      center={center}
      zoom={16}
      minZoom={15}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles © Esri"
      />

      {locations.map((loc) => {
        const icon = isHighlighted(loc.name)
          ? makeIcon('orange')
          : (ICON_MAP[loc.type] || ICON_MAP.default)

        return (
          <Marker key={loc.name} position={[loc.lat, loc.lng]} icon={icon}>
            <Popup>
              <strong>{loc.name}</strong>
              {loc.connections && (
                <p className="text-xs mt-1 text-gray-500">
                  Connected to: {loc.connections.slice(0, 3).join(', ')}
                  {loc.connections.length > 3 ? '...' : ''}
                </p>
              )}
            </Popup>
          </Marker>
        )
      })}

      {route?.coordinates?.length > 1 && (
        <>
          <Polyline
            positions={route.coordinates.map((c) => [c.lat, c.lng])}
            color="var(--color-secondary)"
            weight={5}
            opacity={0.9}
          />
          <FitRoute route={route} />
        </>
      )}
    </MapContainer>
  )
}
