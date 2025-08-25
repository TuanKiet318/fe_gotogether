const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Load Google Maps JavaScript API
 */
export function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key not provided'));
      return;
    }
    
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    
    document.head.appendChild(script);
  });
}

/**
 * Check if Google Maps is available
 */
export function isGoogleMapsAvailable() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

/**
 * Create map options with custom styling
 */
export function getMapOptions(center = { lat: 10.762622, lng: 106.660172 }) {
  return {
    center,
    zoom: 13,
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    gestureHandling: 'cooperative',
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };
}

/**
 * Create custom marker icons
 */
export function createMarkerIcon(type = 'default', isSelected = false) {
  const icons = {
    default: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: isSelected ? '#0ea5e9' : '#64748b',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
    },
    itinerary: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: isSelected ? '#ec4899' : '#f43f5e',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.8,
    }
  };
  
  return icons[type] || icons.default;
}

/**
 * Create polyline options for routes
 */
export function getPolylineOptions() {
  return {
    strokeColor: '#0ea5e9',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    geodesic: true,
  };
}

/**
 * Fit map to bounds with padding
 */
export function fitMapToBounds(map, bounds, padding = 50) {
  if (!map || !bounds) return;
  
  map.fitBounds(bounds, {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding,
  });
}

/**
 * Create info window content
 */
export function createInfoWindowContent(place) {
  const rating = place.rating ? `⭐ ${place.rating} (${place.userRatingsTotal || 0} reviews)` : '';
  const priceLevel = place.priceLevel ? '💰'.repeat(place.priceLevel) : '';
  
  return `
    <div class="p-3 max-w-xs">
      ${place.photoUrl ? `<img src="${place.photoUrl}" alt="${place.name}" class="w-full h-32 object-cover rounded-lg mb-2">` : ''}
      <h3 class="font-semibold text-gray-900 mb-1">${place.name}</h3>
      ${place.address ? `<p class="text-sm text-gray-600 mb-2">${place.address}</p>` : ''}
      <div class="flex items-center gap-2 text-sm">
        ${rating ? `<span>${rating}</span>` : ''}
        ${priceLevel ? `<span>${priceLevel}</span>` : ''}
      </div>
      ${place.openNow !== undefined ? `
        <div class="mt-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            place.openNow 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }">
            ${place.openNow ? 'Open now' : 'Closed'}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}