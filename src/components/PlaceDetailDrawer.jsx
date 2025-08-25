import { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, Globe, Clock, Plus, ExternalLink } from 'lucide-react';
import useSearchStore from '../store/searchStore.js';
import useItineraryStore from '../store/itineraryStore.js';
import { getPlaceDetails } from '../lib/places.js';

export default function PlaceDetailDrawer() {
  const { selectedResult, showDetailDrawer, setShowDetailDrawer, setSelectedResult } = useSearchStore();
  const { addStop } = useItineraryStore();
  const [placeDetails, setPlaceDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const placeRaw = placeDetails || selectedResult;

  useEffect(() => {
    if (showDetailDrawer && selectedResult?.placeId && selectedResult.source === 'google') {
      fetchPlaceDetails();
    } else if (showDetailDrawer && selectedResult) {
      // For OSM places, use the basic info
      setPlaceDetails(selectedResult);
    }
  }, [showDetailDrawer, selectedResult]);

  const fetchPlaceDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const details = await getPlaceDetails(selectedResult.placeId);
      setPlaceDetails(details || selectedResult);
    } catch (err) {
      console.error('Failed to fetch place details:', err);
      setError('Failed to load place details');
      setPlaceDetails(selectedResult); // Fallback to basic info
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowDetailDrawer(false);
    setSelectedResult(null);
    setPlaceDetails(null);
    setError(null);
  };

  const handleAddToItinerary = () => {
    if (placeDetails || selectedResult) {
      addStop(placeDetails || selectedResult);
      handleClose();
    }
  };

  if (!showDetailDrawer) return null;

  const place = placeRaw
    ? {
      ...placeRaw,
      // Map photos array từ images (backend)
      photos: placeRaw.photos
        ? placeRaw.photos
        : placeRaw.images?.map(img => img.imageUrl) ?? [],
      // Map photoUrl từ images (backend)
      photoUrl: placeRaw.photoUrl
        ? placeRaw.photoUrl
        : placeRaw.images?.[0]?.imageUrl ?? null,
      // Map address nếu null thì lấy từ destination
      address: placeRaw.address
        ? placeRaw.address
        : placeRaw.destination
          ? `${placeRaw.destination.name}, ${placeRaw.destination.country ?? ''}`.trim()
          : '',
    }
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transform animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Place Details</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <div className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-slate-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded-lg"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-2xl mb-2">⚠️</div>
              <h3 className="font-semibold text-slate-900 mb-2">Error</h3>
              <p className="text-slate-600">{error}</p>
            </div>
          ) : place ? (
            <div className="space-y-6">
              {/* Photos */}
              {place.photos && place.photos.length > 0 ? (
                <div className="space-y-4">
                  <img
                    src={place.photos[0]}
                    alt={place.name}
                    className="w-full h-64 object-cover"
                  />
                  {place.photos.length > 1 && (
                    <div className="px-6 grid grid-cols-4 gap-2">
                      {place.photos.slice(1, 5).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${place.name} ${index + 2}`}
                          className="w-full h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : place.photoUrl ? (
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="h-64 bg-slate-100 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-slate-400" />
                </div>
              )}

              {/* Info */}
              <div className="px-6 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{place.name}</h1>
                  {place.address && (
                    <p className="text-slate-600 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {place.address}
                    </p>
                  )}
                </div>

                {/* Rating and reviews */}
                {place.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{place.rating}</span>
                    </div>
                    {place.userRatingsTotal && (
                      <span className="text-slate-600">
                        ({place.userRatingsTotal.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Price level */}
                {place.priceLevel && place.priceLevel > 0 && (
                  <div>
                    <span className="text-slate-700 font-medium">Price: </span>
                    <span className="text-slate-600">
                      {'$'.repeat(place.priceLevel)}
                    </span>
                  </div>
                )}

                {/* Contact info */}
                <div className="space-y-3">
                  {place.phone && (
                    <a
                      href={`tel:${place.phone}`}
                      className="flex items-center gap-3 text-slate-700 hover:text-sky-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {place.phone}
                    </a>
                  )}

                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-slate-700 hover:text-sky-600 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Visit website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Opening hours */}
                {place.openingHours && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Opening Hours
                    </h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      {place.openingHours.map((hours, index) => (
                        <div key={index}>{hours}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current status */}
                {place.isOpenNow !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${place.isOpenNow ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    <span className={`font-medium ${place.isOpenNow ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {place.isOpenNow ? 'Open now' : 'Closed now'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Close
            </button>
            <button
              onClick={handleAddToItinerary}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={!place}
            >
              <Plus className="w-4 h-4" />
              Add to Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}