import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import useSearchStore from '../store/searchStore.js';
import { categories, priceLevels } from '../data/destinations.js';

export default function FiltersBar() {
  const [showFilters, setShowFilters] = useState(false);
  const { filters, sortBy, setFilters, setSortBy, resetFilters } = useSearchStore();

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleResetFilters = () => {
    resetFilters();
    setShowFilters(false);
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.minRating > 0 ||
    filters.priceLevel !== 'all' ||
    filters.openNow;

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${showFilters || hasActiveFilters
              ? 'bg-sky-50 border-sky-200 text-sky-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="card-elevated p-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ ⭐</option>
                <option value="4">4+ ⭐</option>
                <option value="4.5">4.5+ ⭐</option>
              </select>
            </div>

            {/* Price level filter (ẩn nếu chưa dùng) */}
            {/* <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price Level
              </label>
              <select
                value={filters.priceLevel}
                onChange={(e) => handleFilterChange('priceLevel', e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300"
              >
                {priceLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Open now filter (ẩn nếu chưa dùng) */}
            {/* <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Availability
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/50"
                />
                <span className="text-sm text-slate-700">Open now</span>
              </label>
            </div> */}
          </div>

          {/* Filter actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleResetFilters}
                className="btn-secondary"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}