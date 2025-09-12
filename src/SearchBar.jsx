import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ capitals, onSelectTown }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTowns, setFilteredTowns] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredTowns([]);
      return;
    }

    // Filter town names that match
    const results = capitals.filter((t) =>
      t.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTowns(results);
  };

  const handleSelect = (town) => {
    setSearchTerm(town.name);
    setFilteredTowns([]);
    onSelectTown([town.lat, town.lon]); // Pass position to Map.jsx
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for a town..."
        value={searchTerm}
        onChange={handleChange}
        className="search-input"
      />

      {filteredTowns.length > 0 && (
        <ul className="search-dropdown">
          {filteredTowns.map((town) => (
            <li
              key={town.name}
              className="search-option"
              onClick={() => handleSelect(town)}
            >
              {town.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
