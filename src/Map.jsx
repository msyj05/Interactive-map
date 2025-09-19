import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  LayersControl,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchBar from "./SearchBar.jsx";
import WeatherWidget from "./WeatherWidget.jsx";
import MapController from "./MapController.jsx";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// MapHoverClickListener listens for hover & click
function MapHoverClickListener({ onHoverDebounced, onClickImmediate }) {
  useMapEvents({
    mousemove: (e) => {
      const { lat, lng } = e.latlng;
      onHoverDebounced(lat, lng);
    },
    click: (e) => {
      const { lat, lng } = e.latlng;
      onClickImmediate(lat, lng);
    },
  });
  return null;
}

function Map() {
  const [hoveredTown, setHoveredTown] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null); // initially no marker

  const fetchTimerRef = useRef(null);

  const fetchWeatherImmediate = async (lat, lon, label) => {
    setHoveredTown(label ?? "Loading...");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=c6edca7f913ce1f9e177bd943a9113b7`
      );
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();

      setWeatherData({
        temp: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      });

      setHoveredTown(
        data.name && data.name !== ""
          ? data.name
          : label ?? `Lat: ${lat.toFixed(2)}, Lng: ${lon.toFixed(2)}`
      );
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setWeatherData({
        temp: 28,
        condition: "Sunny",
        humidity: 50,
        windSpeed: 12,
      });
      setHoveredTown(label ?? `Lat: ${lat.toFixed(2)}, Lng: ${lon.toFixed(2)}`);
    }
  };

  const scheduleFetchWeather = (lat, lon, label) => {
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
    fetchTimerRef.current = setTimeout(() => {
      fetchWeatherImmediate(lat, lon, label);
      fetchTimerRef.current = null;
    }, 1000);
  };

  const handleMapClickImmediate = (lat, lon) => {
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
    setSelectedPosition([lat, lon]); // show marker on click
    fetchWeatherImmediate(lat, lon, "Selected Location");
  };

  const handleTownSelect = (position) => {
    const [lat, lon] = position;

  // Get the map instance manually using the leaflet object
  const map = window.leafletMap; // We'll store the map globally in MapController
  if (map) {
    map.flyTo([lat, lon], 10, {
      animate: true,
      duration: 2,
    });

    map.once("moveend", () => {
      // Only set marker after map finishes flying
      setSelectedPosition([lat, lon]);
    });
  } else {
    // fallback if map isn't ready yet
    setSelectedPosition([lat, lon]);
  }

  fetchWeatherImmediate(lat, lon, "Searched Location");
  };

  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-container">
      <SearchBar onSelectTown={handleTownSelect} />

      <MapContainer
        center={[7.9465, -1.0232]}
        zoom={7}
        style={{ height: "100vh", width: "100%" }}
      >
        <MapController position={selectedPosition ?? [7.9465, -1.0232]} />

        <MapHoverClickListener
          onHoverDebounced={(lat, lon) => scheduleFetchWeather(lat, lon)}
          onClickImmediate={(lat, lon) => handleMapClickImmediate(lat, lon)}
        />

        <LayersControl position="topright" className="layers-control">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="StadiaMaps"
              url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenTopoMap">
            <TileLayer
              attribution="OpenTopoMap"
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="CartoDB Dark">
            <TileLayer
              attribution="&copy; CartoDB contributors"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Render marker only if user selected/search a place */}
        {selectedPosition && (
          <Marker position={selectedPosition}>
            <Popup>{hoveredTown ?? "Selected Location"}</Popup>
          </Marker>
        )}
      </MapContainer>

      <WeatherWidget town={hoveredTown} weather={weatherData} />
    </div>
  );
}

export default Map;
