import React from 'react';
import './WeatherWidget.css';

function WeatherWidget({ town, weather }) {
  return (
    <div className="weather-widget">
      {town && weather ? (
        <>
          <h3>{town}</h3>
          <p>Temperature: {Math.round(weather.temp)}°C</p>
          <p>Condition: {weather.condition}</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind: {weather.windSpeed} km/h</p>
        </>
      ) : (
        <>
          <h3>Hover over a town</h3>
          <p>Temperature: --°C</p>
          <p>Condition: --</p>
          <p>Humidity: --%</p>
          <p>Wind: -- km/h</p>
        </>
      )}
    </div>
  );
}

export default WeatherWidget;
