import { useEffect, useState } from 'react';
import { Star, MapPin, Clock, ExternalLink, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useSearchStore from '../store/searchStore.js';
import useItineraryStore from '../store/itineraryStore.js';
import { formatDistance, calculateDistance } from '../lib/geo.js';
import PlaceDetailDrawer from './PlaceDetailDrawer.jsx';
import FiltersBar from './FiltersBar.jsx';
import ResultsSkeleton from './ResultsSkeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { SearchPlaces } from '../service/api.admin.service.jsx';

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
    centerLocation,
    setResults,
    setLoading,
    setError,
    setHoveredResult,
    currentPage,
    setCurrentPage
  } = useSearchStore();

  const { addStop } = useItineraryStore();
  const [isSearching, setIsSearching] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (query && query.trim()) {
      performSearch();
    }
  }, [query, centerLocation, currentPage, filters, sortBy]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      const res = await SearchPlaces({
        destinationName: query.trim(),
        categoryId: filters.category !== 'all' ? filters.category : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        sortBy: sortBy === 'relevance' ? 'name' : sortBy,
        sortDirection: 'asc',
        page: currentPage - 1,
        size: 20,
      });
      const page = res?.data ?? res;
      const content = page?.content ?? [];
      setTotalElements(page?.totalElements ?? 0);
      setTotalPages(page?.totalPages ?? 1);

      const mapped = content.map(p => {
        const lat = Number(p.lat);
        const lng = Number(p.lon);
        const photoUrl = p.images?.[0]?.imageUrl ?? null;
        const distanceKm =
          centerLocation?.lat != null && centerLocation?.lng != null && lat && lng
            ? calculateDistance(centerLocation.lat, centerLocation.lng, lat, lng)
            : undefined;

        return {
          id: p.id,
          placeId: p.id,
          name: p.name,
          lat,
          lng,
          address: p.address ?? (p.destination ? `${p.destination.name}, ${p.destination.country ?? ''}`.trim() : ''),
          rating: p.rating ?? null,
          userRatingsTotal: null,
          priceLevel: null,
          openNow: undefined,
          photoUrl,
          category: p.category?.name ?? 'establishment',
          source: 'backend',
          distanceKm,
        };
      });
      setResults(mapped);
      // setHasSearched(true); // Nếu cần
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search places. Please try again.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleAddToItinerary = (place) => {
    addStop(place);
  };

  const handleMouseEnter = (resultId) => {
    setHoveredResult(resultId);
  };

  const handleMouseLeave = () => {
    setHoveredResult(null);
  };

  const renderPriceLevel = (priceLevel) => {
    if (!priceLevel || priceLevel === 0) return null;
    return (
      <span className="text-slate-600">
        {'$'.repeat(priceLevel)}
      </span>
    );
  };

  const renderPlaceCard = (place) => {
    const isHovered = hoveredResultId === place.id;

    return (
      <div
        key={place.id}
        className={`card-elevated p-4 cursor-pointer transition-all duration-200 ${isHovered ? 'ring-2 ring-sky-300 shadow-xl scale-[1.02]' : ''}`}
        onMouseEnter={() => handleMouseEnter(place.id)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Place Image */}
        <div className="relative mb-3 h-48 bg-slate-100 rounded-xl overflow-hidden">
          {place.photoUrl ? (
            <img
              src={place.photoUrl}
              alt={place.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <MapPin className="w-12 h-12" />
            </div>
          )}

          {/* Add to itinerary button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToItinerary(place);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 group"
            title="Add to itinerary"
          >
            <Plus className="w-4 h-4 text-slate-600 group-hover:text-sky-600" />
          </button>
        </div>

        {/* Place Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-sky-900">
            {place.name}
          </h3>

          {place.address && (
            <p className="text-sm text-slate-600 line-clamp-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {place.address}
            </p>
          )}

          {/* Rating and Price */}
          <div className="flex items-center gap-3 text-sm">
            {place.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{place.rating}</span>
                {place.userRatingsTotal && (
                  <span className="text-slate-500">({place.userRatingsTotal})</span>
                )}
              </div>
            )}

            {renderPriceLevel(place.priceLevel)}
          </div>

          {/* Distance and Status */}
          <div className="flex items-center justify-between text-sm">
            {place.distanceKm && (
              <span className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {formatDistance(place.distanceKm)}
              </span>
            )}

            {place.openNow !== undefined && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${place.openNow
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}>
                <Clock className="w-3 h-3 mr-1" />
                {place.openNow ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || isSearching) {
    return (
      <div className="space-y-6">
        <FiltersBar />
        <ResultsSkeleton />
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
          <button
            onClick={performSearch}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (results.length === 0) {
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

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          Found {totalElements} places
          {query && (
            <span> for "<strong>{query}</strong>"</span>
          )}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-sm text-slate-600">
              {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {results.map(renderPlaceCard)}
      </div>

      {/* Load more button for mobile */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPage === totalPages ? 'No more results' : 'Load more'}
          </button>
        </div>
      )}

      <PlaceDetailDrawer />
    </div >
  );
}