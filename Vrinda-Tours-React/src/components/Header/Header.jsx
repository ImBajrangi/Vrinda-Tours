import { useState, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { locations } from '../../data/locations';
import './Header.css';

export default function Header({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const handleSearch = (value) => {
    setQuery(value);
    if (value.length < 2) { setResults([]); return; }
    const q = value.toLowerCase();
    setResults(
      locations.filter(
        (l) => l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  };

  const handleSelect = (loc) => {
    setQuery(loc.name);
    setResults([]);
    onSelectLocation(loc);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="search-bar">
          <Search size={20} color="#9E9E9E" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Where do you want to go?"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setResults([]), 200)}
          />
        </div>
        <button className="icon-btn" id="user-btn">
          <User size={22} />
        </button>
      </div>

      {results.length > 0 && (
        <div className="search-results visible">
          {results.map((loc) => (
            <div key={loc.name} className="search-result-item" onMouseDown={() => handleSelect(loc)}>
              <div className="sr-icon"><Search size={16} /></div>
              <div className="sr-text">
                <h4>{loc.name}</h4>
                <span>{loc.category} • +{loc.points} points</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
