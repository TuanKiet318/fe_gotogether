// SearchResults.jsx (final)
import { useEffect, useState, useMemo } from 'react';
import { Star, MapPin, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useSearchStore from '../store/searchStore.js';
import useItineraryStore from '../store/itineraryStore.js';
import { formatDistance, calculateDistance } from '../lib/geo.js';
import PlaceDetailDrawer from './PlaceDetailDrawer.jsx';
import FiltersBar from './FiltersBar.jsx';
import ResultsSkeleton from './ResultsSkeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { SearchPlaces } from '../service/api.admin.service.jsx';
import { groupBy } from 'lodash';

export default function SearchResults() {
  const {
    query,
    filters,
    sortBy,
    results,
    isLoading,
    error,
    hasSearched,
    hoveredResultId,
    setCenterLocation,
    setResults,
    setLoading,
    setError,
    setHoveredResult,
    currentPage,
    setCurrentPage,
    setSelectedResult,
    setShowDetailDrawer
  } = useSearchStore();

  const { addStop } = useItineraryStore();

  const [isSearching, setIsSearching] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // per-category pagination
  const ITEMS_PER_CATEGORY = 3;
  const [categoryPageMap, setCategoryPageMap] = useState({});

  const groupedEntries = useMemo(() => {
    if (!results) return [];
    return Object.entries(results).sort((a, b) => b[1].length - a[1].length);
  }, [results]);

  useEffect(() => {
    if (!results) {
      setCategoryPageMap({});
      return;
    }
    const init = {};
    Object.keys(results).forEach(cat => { init[cat] = 1; });
    setCategoryPageMap(init);
  }, [results]);

  useEffect(() => {
    if (query && query.trim()) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, sortBy, filters?.category, filters?.minRating]);

  const performSearch = async () => {
    if (!query || !query.trim()) return;

    setIsSearching(true);
    setLoading?.(true);
    setError?.(null);

    try {
      const res = await SearchPlaces({
        destinationName: query.trim(),
        categoryId: filters?.category !== 'all' ? filters.category : undefined,
        minRating: filters?.minRating > 0 ? filters.minRating : undefined,
        sortBy: sortBy === 'relevance' ? 'name' : sortBy,
        sortDirection: 'asc',
        page: currentPage - 1,
        size: 100,
      });

      const page = res?.data ?? res;
      const content = page?.content ?? [];
      const center = content.length > 0 ? { lat: Number(content[0].lat), lng: Number(content[0].lon) } : null;

      setCenterLocation?.(center);
      setTotalElements(page?.totalElements ?? content.length);
      setTotalPages(page?.totalPages ?? 1);

      const mapped = content.map(p => {
        const lat = Number(p.lat);
        const lng = Number(p.lon);
        const photoUrl = p.images?.[0]?.imageUrl ?? null;
        const distanceKm =
          center?.lat != null && center?.lng != null && lat && lng
            ? calculateDistance(center.lat, center.lng, lat, lng)
            : undefined;

        return {
          id: p.id,
          placeId: p.id,
          name: p.name,
          lat,
          lng,
          address: p.address ?? (p.destination ? `${p.destination.name}, ${p.destination.country ?? ''}`.trim() : ''),
          rating: p.rating ?? null,
          photoUrl,
          category: p.category?.name ?? 'Other',
          distanceKm,
        };
      });

      const grouped = groupBy(mapped, "category");
      setResults?.(grouped);
    } catch (err) {
      console.error('Search failed:', err);
      setError?.('Failed to search places. Please try again.');
    } finally {
      setLoading?.(false);
      setIsSearching(false);
    }
  };

  const handleAddToItinerary = (place) => {
    addStop(place);
  };

  const handleMouseEnter = (resultId) => {
    setHoveredResult?.(resultId);
  };

  const handleMouseLeave = () => {
    setHoveredResult?.(null);
  };

  const setCategoryPage = (category, page) => {
    setCategoryPageMap(prev => ({ ...prev, [category]: page }));
  };

  const openDetail = (place) => {
    setSelectedResult?.(place);
    setShowDetailDrawer?.(true);
  };

  const renderPlaceCard = (place) => {
    const isHovered = hoveredResultId === place.id;

    return (
      <div
        key={place.id}
        className={`card-elevated p-4 cursor-pointer transition-all duration-200 ${isHovered ? 'ring-2 ring-sky-300 shadow-xl scale-[1.02]' : ''}`}
        onMouseEnter={() => handleMouseEnter(place.id)}
        onMouseLeave={handleMouseLeave}
        onClick={() => openDetail(place)}
      >
        <div className="relative mb-3 h-48 bg-slate-100 rounded-xl overflow-hidden">
          {place.photoUrl ? (
            <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <MapPin className="w-12 h-12" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToItinerary(place);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:shadow-md"
            title="Add to itinerary"
          >
            <Plus className="w-4 h-4 text-slate-600 hover:text-sky-600" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{place.name}</h3>
          {place.address && (
            <p className="text-sm text-slate-600 line-clamp-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {place.address}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm">
            {place.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{place.rating}</span>
              </div>
            )}
          </div>
          {place.distanceKm && (
            <div className="text-sm text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formatDistance(place.distanceKm)}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading || isSearching) {
    return (
      <div className="space-y-6">
        <FiltersBar />
        <ResultsSkeleton onClickSkeleton={() => setShowDetailDrawer(true)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <FiltersBar />
        <div className="card-elevated p-8 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Search Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button onClick={performSearch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (!hasSearched) return null;

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="space-y-6">
        <FiltersBar />
        <EmptyState
          title="No places found"
          description="Try adjusting your search terms or filters to find more results."
          icon="🔍"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <FiltersBar />

      {/* <div className="flex items-center justify-between">
        <p className="text-slate-600">
          Found {totalElements} places{query && (<span> for "<strong>{query}</strong>"</span>)}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-slate-600">{currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div> */}
      {/* Results grouped by category */}
      {groupedEntries.map(([category, places]) => {
        const total = places.length;
        const totalPagesCat = Math.max(1, Math.ceil(total / ITEMS_PER_CATEGORY));
        const currentCatPage = categoryPageMap[category] ?? 1;
        const startIdx = (currentCatPage - 1) * ITEMS_PER_CATEGORY;
        const visiblePlaces = places.slice(startIdx, startIdx + ITEMS_PER_CATEGORY);

        return (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">{category}</h2>

            <div className="relative">
              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visiblePlaces.map(renderPlaceCard)}
              </div>

              {/* Nút trái */}
              {total > ITEMS_PER_CATEGORY && currentCatPage > 1 && (
                <button
                  onClick={() => setCategoryPage(category, Math.max(1, currentCatPage - 1))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Nút phải */}
              {total > ITEMS_PER_CATEGORY && currentCatPage < totalPagesCat && (
                <button
                  onClick={() => setCategoryPage(category, Math.min(totalPagesCat, currentCatPage + 1))}
                  className="absolute right-0 top-1/2 translate-y-[-50%] translate-x-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Optional: hiển thị số trang */}
            {total > ITEMS_PER_CATEGORY && (
              <div className="text-center text-sm text-slate-600">
                {currentCatPage} / {totalPagesCat}
              </div>
            )}
          </div>
        );
      })}


      <PlaceDetailDrawer />
    </div>
  );
}
