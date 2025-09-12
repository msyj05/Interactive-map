import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SearchBar from './SearchBar.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import MapController from './MapController.jsx'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hardcoded list of regional capitals
const capitals = [
  { name: "Accra", lat: 5.6145, lon: -0.2056 },
  { name: "Kumasi", lat: 6.6885, lon: -1.6244 },
  { name: "Tamale", lat: 9.4000, lon: -0.8400 },
  { name: "Sekondi-Takoradi", lat: 4.9433, lon: -1.7040 },
  { name: "Sunyani", lat: 7.3333, lon: -2.3333 },
  { name: "Cape Coast", lat: 5.1000, lon: -1.2500 },
  { name: "Koforidua", lat: 6.0910, lon: -0.2600 },
  { name: "Ho", lat: 6.6000, lon: 0.4700 },
  { name: "Bolgatanga", lat: 10.7856, lon: -0.8514 },
  { name: "Wa", lat: 10.0607, lon: -2.5019 },
  { name: "Damongo", lat: 9.0833, lon: -1.8167 },
  { name: "Techiman", lat: 7.5833, lon: -1.9333 },
  { name: "Sefwi Wiawso", lat: 6.1969, lon: -2.4900 },
  { name: "Nalerigu", lat: 10.5333, lon: -0.3833 },
  { name: "Dambai", lat: 7.7833, lon: 0.2833 },
  { name: "Goaso", lat: 6.8000, lon: -2.5167 },
];


function Map() {
  const [hoveredTown, setHoveredTown] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState([7.9465, -1.0232]);

  const handleMarkerHover = async (town) => {
    setHoveredTown(town.name);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${town.lat}&lon=${town.lon}&units=metric&appid=c6edca7f913ce1f9e177bd943a9113b7`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();

      setWeatherData({
        temp: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      });
    } catch (error) {
      console.error('Weather fetch failed:', error);
      setWeatherData({
        temp: 28,
        condition: 'Sunny',
        humidity: 50,
        windSpeed: 12,
      });
    }
  };

  //when user selects a town from search
  const handleTownSelect = (position) => {
    setSelectedPosition(position);
    // Find town object by matching position
    const town = capitals.find(
      (t) => t.lat === position[0] && t.lon === position[1]
    );
    if (town) handleMarkerHover(town); // Fetch weather automatically
  };



  return (
    <div className="map-container">
      <SearchBar capitals={capitals} onSelectTown={handleTownSelect} />

      <MapContainer
        center={[7.9465, -1.0232]}
        zoom={7}
        style={{ height: '100vh', width: '100%' }}
      >
        <MapController position={selectedPosition} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {capitals.map((town) => (
          <Marker
            key={town.name}
            position={[town.lat, town.lon]}
            eventHandlers={{
              mouseover: () => handleMarkerHover(town)
            }}
          >
            <Popup>{town.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <WeatherWidget town={hoveredTown} weather={weatherData} />
    </div>
  );
}

export default Map;
