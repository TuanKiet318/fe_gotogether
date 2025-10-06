import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { autocompleteSearch } from "../lib/places.js";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../store/searchStore.js";

export default function SearchBox({
  onSelect, // callback khi chọn
  navigateOnSelect = true, // bật/tắt navigate (default: true)
  placeholder = "Bạn muốn đi đâu?",
  className = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const { setQuery } = useSearchStore();

  // Đóng dropdown khi click ra ngoài
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

  // Gõ input
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

  // Xử lý Enter / Arrow
  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (activeSuggestionIndex >= 0 && suggestions.length > 0) {
        // Người dùng chọn bằng mũi tên
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else if (searchQuery.trim() !== "") {
        let matched = null;

        // Nếu đã có suggestions sẵn → lấy cái đầu tiên
        if (suggestions.length > 0) {
          matched = suggestions[0];
        } else {
          // Nếu chưa có → gọi lại API
          try {
            const results = await autocompleteSearch(searchQuery.trim());
            if (results.length > 0) {
              matched = results[0];
            }
          } catch (error) {
            console.error("Search failed:", error);
          }
        }

        if (matched) {
          selectSuggestion(matched); // matched luôn có id hợp lệ
        } else {
          // fallback: không có gì thì KHÔNG navigate
          console.warn("Không tìm thấy địa điểm phù hợp");
          setShowSuggestions(false);
        }
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

  // Khi chọn 1 suggestion
  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    setQuery(suggestion.name);

    // callback ra ngoài
    if (onSelect) {
      onSelect(suggestion);
    }

    // chỉ navigate khi được bật
    if (navigateOnSelect) {
      navigate(`/destination/${suggestion.id}`);
    }
  };

  return (
    <div className={`w-full relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4
           focus:outline-none focus:ring-2 focus:ring-sky-500
           text-sm md:text-base"
        />
      </div>

      {/* Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto z-50">
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
                      {suggestion.country}
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
