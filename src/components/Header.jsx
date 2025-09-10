import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, MapPin, Clock } from 'lucide-react';
import { autocompleteSearch } from '../lib/places.js';
import useSearchStore from '../store/searchStore.js';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Header({ setActiveSection }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();


  const { setQuery, setCenterLocation } = useSearchStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = async (value) => {
    setSearchQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await autocompleteSearch(value);
        setSuggestions(results);
        setShowSuggestions(true);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        console.error('Autocomplete search failed:', error);
        setSuggestions([]);
      }
    }, 300);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions.length > 0) {
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setQuery(searchQuery.trim());
      setShowSuggestions(false);

      // Điều hướng sang /destination/<searchQuery>
      navigate(`/destination/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    setQuery(suggestion.name);

    navigate(`/destination/${encodeURIComponent(suggestion.name)}`);
  };


  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">GoTogether</span>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Bạn muốn đi đâu?"
                className="input-field pl-10 pr-4"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
                aria-activedescendant={
                  activeSuggestionIndex >= 0
                    ? `suggestion-${activeSuggestionIndex}`
                    : undefined
                }
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto z-10"
                  role="listbox"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      id={`suggestion-${index}`}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${index === activeSuggestionIndex ? 'bg-slate-50' : ''
                        }`}
                      role="option"
                      aria-selected={index === activeSuggestionIndex}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900">{suggestion.name}</div>
                          <div className="text-sm text-slate-600 truncate">
                            {suggestion.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-primary">
              Log out
            </Link>
            {/* <Link to="/register" className="btn-primary">
              Sign up
            </Link> */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <div className="relative" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bạn muốn đi đâu?"
              className="input-field pl-10 pr-4"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-activedescendant={
                activeSuggestionIndex >= 0
                  ? `suggestion-mobile-${activeSuggestionIndex}`
                  : undefined
              }
            />

            {/* Mobile suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    id={`suggestion-mobile-${index}`}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${index === activeSuggestionIndex ? 'bg-slate-50' : ''
                      }`}
                    role="option"
                    aria-selected={index === activeSuggestionIndex}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-900">{suggestion.name}</div>
                        <div className="text-sm text-slate-600 truncate">
                          {suggestion.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-slate-200">
            <div className="flex flex-col gap-3 p-4">
              <button className="btn-secondary justify-center">
                Log in
              </button>
              <button className="btn-primary justify-center">
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}