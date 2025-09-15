import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { autocompleteSearch } from "../lib/places.js";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../store/searchStore.js";

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const { setQuery } = useSearchStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInput = (value) => {
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

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
        console.error("Autocomplete search failed:", error);
        setSuggestions([]);
      }
    }, 300);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions.length > 0) {
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else {
        await handleSearch();
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  // 🔥 Sửa: Search theo id (từ API)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Nếu user đã chọn suggestion rồi (có active index)
    if (activeSuggestionIndex >= 0 && suggestions.length > 0) {
      selectSuggestion(suggestions[activeSuggestionIndex]);
      return;
    }

    try {
      // Gọi API backend để tìm
      const response = await fetch(
        `http://localhost:8080/api/destinations/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`
      );
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        const destination = result.data[0];
        navigate(`/destination/${destination.id}`);
      } else {
        alert("Không tìm thấy địa điểm phù hợp!");
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    setQuery(suggestion.name);
    navigate(`/destination/${suggestion.id}`);
  };

  return (
    <div className="w-full relative" ref={searchRef}>
      {/* Ô input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bạn muốn đi đâu?"
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4
           focus:outline-none focus:ring-2 focus:ring-sky-500
           text-sm md:text-base"
        />
      </div>

      {/* Dropdown gợi ý */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto z-50"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  index === activeSuggestionIndex ? "bg-slate-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {suggestion.description}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-slate-500 text-sm italic">
              Không tìm thấy địa điểm phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
}
