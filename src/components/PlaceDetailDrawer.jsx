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
      setPlaceDetails(selectedResult);
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
      photos: placeRaw.photos ?? placeRaw.images?.map(img => img.imageUrl) ?? [],
      photoUrl: placeRaw.photoUrl ?? placeRaw.images?.[0]?.imageUrl ?? null,
      address: placeRaw.address ?? (placeRaw.destination ? `${placeRaw.destination.name}, ${placeRaw.destination.country ?? ''}`.trim() : ''),
    }
    : null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header with image */}
        <div className="relative h-56 w-full">
          {place?.photos?.length > 0 ? (
            <img src={place.photos[0]} alt={place.name} className="w-full h-full object-cover" />
          ) : place?.photoUrl ? (
            <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <MapPin className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow"
          >
            <X className="w-5 h-5 text-slate-800" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : place ? (
            <>
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{place.name}</h1>
                {place.rating && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{place.rating}</span>
                    {place.userRatingsTotal && (
                      <span className="text-slate-600 text-sm">
                        ({place.userRatingsTotal.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Address */}
              {place.address && (
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  {place.address}
                </div>
              )}

              {/* Info blocks */}
              <div className="divide-y divide-slate-200">
                {place.phone && (
                  <a href={`tel:${place.phone}`} className="flex items-center gap-3 py-3 text-slate-700 hover:text-sky-600">
                    <Phone className="w-4 h-4" />
                    {place.phone}
                  </a>
                )}

                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 text-slate-700 hover:text-sky-600"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {place.openingHours && (
                  <div className="py-3">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Opening Hours
                    </h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      {place.openingHours.map((hours, idx) => (
                        <div key={idx}>{hours}</div>
                      ))}
                    </div>
                  </div>
                )}

                {place.isOpenNow !== undefined && (
                  <div className="py-3 flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${place.isOpenNow ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span className={`font-medium ${place.isOpenNow ? 'text-green-700' : 'text-red-700'}`}>
                      {place.isOpenNow ? 'Open now' : 'Closed now'}
                    </span>
                  </div>
                )}
              </div>
              {/* Reviews (mock data for demo) */}
              {(!place.reviews || place.reviews.length === 0) ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Reviews</h3>
                  <div className="space-y-4">
                    {[
                      {
                        authorName: "Nguyễn Văn A",
                        rating: 5,
                        text: "Địa điểm tuyệt vời, nhân viên thân thiện và phục vụ nhanh chóng!",
                        relativeTimeDescription: "2 tuần trước",
                        profilePhotoUrl: "https://i.pravatar.cc/40?img=1"
                      },
                      {
                        authorName: "Trần Thị B",
                        rating: 4,
                        text: "Không gian đẹp, đồ ăn ngon nhưng hơi đông khách.",
                        relativeTimeDescription: "1 tháng trước",
                        profilePhotoUrl: "https://i.pravatar.cc/40?img=2"
                      },
                      {
                        authorName: "Lê Văn C",
                        rating: 3,
                        text: "Ổn nhưng không có gì đặc biệt, giá hơi cao.",
                        relativeTimeDescription: "3 tháng trước",
                        profilePhotoUrl: "https://i.pravatar.cc/40?img=3"
                      },
                    ].map((review, idx) => (
                      <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          {review.profilePhotoUrl ? (
                            <img
                              src={review.profilePhotoUrl}
                              alt={review.authorName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{review.authorName}</p>
                            {review.relativeTimeDescription && (
                              <p className="text-xs text-slate-500">{review.relativeTimeDescription}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-700 text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Reviews</h3>
                  <div className="space-y-4">
                    {place.reviews.slice(0, 5).map((review, idx) => (
                      <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          {review.profilePhotoUrl ? (
                            <img
                              src={review.profilePhotoUrl}
                              alt={review.authorName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{review.authorName}</p>
                            {review.relativeTimeDescription && (
                              <p className="text-xs text-slate-500">{review.relativeTimeDescription}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-700 text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Extra gallery */}
              {place.photos && place.photos.length > 1 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">Gallery</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {place.photos.slice(1).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${place.name}-${idx}`}
                        className="h-28 w-40 rounded-lg object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3">
          <button onClick={handleClose} className="flex-1 btn-secondary">
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
  );
}
