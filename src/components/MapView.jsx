import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { isGoogleMapsAvailable, loadGoogleMaps, getMapOptions, createMarkerIcon, getPolylineOptions, fitMapToBounds, createInfoWindowContent } from '../lib/maps.js';
import { calculateBounds } from '../lib/geo.js';
import useSearchStore from '../store/searchStore.js';
import useItineraryStore from '../store/itineraryStore.js';

export default function MapView() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { results, hoveredResultId, centerLocation } = useSearchStore();
  const { stops } = useItineraryStore();

  useEffect(() => {
    initializeMap();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
      updatePolyline();
      fitToMarkers();
    }
  }, [results, stops, hoveredResultId]);

  const initializeMap = async () => {
    if (!isGoogleMapsAvailable()) {
      setIsLoading(false);
      return;
    }

    try {
      await loadGoogleMaps();
      createMap();
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      setMapError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createMap = () => {
    if (!mapRef.current) return;

    const options = getMapOptions(centerLocation);
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, options);
    infoWindowRef.current = new window.google.maps.InfoWindow();

    updateMarkers();
    updatePolyline();
  };

  const cleanup = () => {
    clearMarkers();
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    // Add result markers
    results.forEach(result => {
      const marker = new window.google.maps.Marker({
        position: { lat: result.lat, lng: result.lng },
        map: mapInstanceRef.current,
        icon: createMarkerIcon('default', hoveredResultId === result.id),
        title: result.name
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent(result));
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Add itinerary markers
    stops.forEach((stop, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: mapInstanceRef.current,
        icon: createMarkerIcon('itinerary', false),
        title: `${index + 1}. ${stop.name}`,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        }
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent(stop));
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });
  };

  const updatePolyline = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    if (stops.length < 2) return;

    // Create path from itinerary stops
    const path = stops.map(stop => ({ lat: stop.lat, lng: stop.lng }));

    polylineRef.current = new window.google.maps.Polyline({
      path,
      ...getPolylineOptions(),
      map: mapInstanceRef.current
    });
  };

  const fitToMarkers = () => {
    if (!mapInstanceRef.current) return;

    const allCoordinates = [
      ...results.map(r => ({ lat: r.lat, lng: r.lng })),
      ...stops.map(s => ({ lat: s.lat, lng: s.lng }))
    ];

    if (allCoordinates.length === 0) {
      mapInstanceRef.current.setCenter(centerLocation);
      mapInstanceRef.current.setZoom(13);
      return;
    }

    if (allCoordinates.length === 1) {
      mapInstanceRef.current.setCenter(allCoordinates[0]);
      mapInstanceRef.current.setZoom(15);
      return;
    }

    const bounds = calculateBounds(allCoordinates);
    if (bounds) {
      const googleBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(bounds.south, bounds.west),
        new window.google.maps.LatLng(bounds.north, bounds.east)
      );
      fitMapToBounds(mapInstanceRef.current, googleBounds, 50);
    }
  };

  if (isLoading) {
    return (
      <div className="card-elevated h-[400px] lg:h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          </div>
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!isGoogleMapsAvailable() || mapError) {
    return (
      <div className="card-elevated h-[400px] lg:h-[600px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.626026352697!2d106.80308607586906!3d10.84112808929959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527e1e2b7e6b1%3A0x7b6e2c1b9b419add!2zVHLGsOG7nW5nIMSQ4buZbmcgU-G6oW0gS2nhu4d0IFRodeG6rWkgU-G7kSAoU1BLSFQp!5e0!3m2!1sen!2s!4v1690000000000"
          className="w-full h-full border-0 rounded-2xl"
          loading="lazy"
          title="Map"
          allowFullScreen
        />

        {mapError && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Map unavailable</h3>
              <p className="text-slate-600 mb-4">Using fallback map view</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${centerLocation.lat},${centerLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-elevated h-[400px] lg:h-[600px] relative">
      <div ref={mapRef} className="w-full h-full rounded-2xl" />

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${centerLocation.lat},${centerLocation.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-4 h-4 text-slate-600" />
        </a>
      </div>

      {/* Legend */}
      {(results.length > 0 || stops.length > 0) && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm">
          <div className="space-y-2 text-sm">
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                <span className="text-slate-700">Search results</span>
              </div>
            )}
            {stops.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-slate-700">Your itinerary</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}