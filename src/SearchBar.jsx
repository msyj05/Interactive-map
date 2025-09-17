import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onSelectTown }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&limit=5`
      );
      const data = await res.json();

      // Map results to a simpler format
      const locations = data.map((place) => ({
        name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
      }));

      setResults(locations);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (location) => {
    setSearchTerm(location.name);
    setResults([]);
    onSelectTown([location.lat, location.lon]);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for a place..."
        value={searchTerm}
        onChange={handleChange}
        className="search-input"
      />

      {results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((location, index) => (
            <li
              key={index}
              className="search-option"
              onClick={() => handleSelect(location)}
            >
              {location.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
