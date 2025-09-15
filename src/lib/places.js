import { calculateDistance } from "./geo.js";

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Cache for recent searches
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Search for places using Google Places API or OSM fallback
 */
export async function searchPlaces(query, centerLocation, options = {}) {
  const cacheKey = `${query}-${centerLocation.lat}-${centerLocation.lng}`;

  // Check cache first
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  let results;

  if (GOOGLE_PLACES_API_KEY) {
    results = await searchWithGoogle(query, centerLocation, options);
  } else {
    results = await searchWithOSM(query, centerLocation, options);
  }

  // Add distance calculations
  results = results.map((place) => ({
    ...place,
    distanceKm: calculateDistance(
      centerLocation.lat,
      centerLocation.lng,
      place.lat,
      place.lng
    ),
  }));

  // Cache results
  searchCache.set(cacheKey, {
    data: results,
    timestamp: Date.now(),
  });

  return results;
}

/**
 * Search using Google Places Text Search API
 */
async function searchWithGoogle(query, centerLocation, options = {}) {
  const radius = options.radius || 50000; // 50km default

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    url.searchParams.append("query", query);
    url.searchParams.append(
      "location",
      `${centerLocation.lat},${centerLocation.lng}`
    );
    url.searchParams.append("radius", radius.toString());
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return (data.results || []).map((place) => ({
      id: place.place_id,
      placeId: place.place_id,
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      openNow: place.opening_hours?.open_now,
      photoUrl: place.photos?.[0]
        ? getGooglePhotoUrl(place.photos[0].photo_reference)
        : null,
      types: place.types,
      category: mapGoogleTypeToCategory(place.types),
      source: "google",
    }));
  } catch (error) {
    console.error("Google Places search failed:", error);
    // Fallback to OSM
    return searchWithOSM(query, centerLocation, options);
  }
}

/**
 * Search using OpenStreetMap Nominatim API
 */
async function searchWithOSM(query, centerLocation, options = {}) {
  try {
    const url = new URL(`${NOMINATIM_BASE_URL}/search`);
    url.searchParams.append("q", query);
    url.searchParams.append("format", "json");
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("extratags", "1");
    url.searchParams.append("limit", "20");
    url.searchParams.append("viewbox", getViewBox(centerLocation, 50)); // 50km radius
    url.searchParams.append("bounded", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TravelPlannerApp/1.0",
      },
    });

    const data = await response.json();

    return data.map((place) => ({
      id: place.osm_id,
      placeId: place.place_id,
      name: place.display_name.split(",")[0],
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      address: place.display_name,
      category: mapOSMTypeToCategory(place.type, place.class),
      source: "osm",
    }));
  } catch (error) {
    console.error("OSM search failed:", error);
    return [];
  }
}

/**
 * Get place details using Google Places Details API
 */
export async function getPlaceDetails(placeId) {
  if (!GOOGLE_PLACES_API_KEY) {
    return null;
  }

  try {
    const fields = [
      "name",
      "formatted_address",
      "geometry",
      "photos",
      "rating",
      "user_ratings_total",
      "price_level",
      "opening_hours",
      "website",
      "formatted_phone_number",
      "url",
      "types",
    ].join(",");

    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    url.searchParams.append("place_id", placeId);
    url.searchParams.append("fields", fields);
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Place details error: ${data.status}`);
    }

    const place = data.result;

    return {
      placeId: placeId,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      website: place.website,
      phone: place.formatted_phone_number,
      url: place.url,
      openingHours: place.opening_hours?.weekday_text,
      isOpenNow: place.opening_hours?.open_now,
      photos:
        place.photos
          ?.slice(0, 5)
          .map((photo) =>
            getGooglePhotoUrl(photo.photo_reference, { maxWidth: 800 })
          ) || [],
      types: place.types,
      category: mapGoogleTypeToCategory(place.types),
    };
  } catch (error) {
    console.error("Failed to get place details:", error);
    return null;
  }
}

/**
 * Autocomplete search for destinations
 */
// FE/src/lib/places.js

export async function autocompleteSearch(query, limit = 10) {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `http://localhost:8080/api/destinations/search?q=${encodeURIComponent(
        query
      )}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Backend search failed");
    }

    const result = await response.json();

    // Backend đã trả về {status, message, data}, nên mình lấy data
    return result.data || [];
  } catch (error) {
    console.error("Backend autocomplete failed:", error);
    return [];
  }
}

/**
 * Google Places Autocomplete
 */
async function autocompleteWithGoogle(query, options = {}) {
  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    );
    url.searchParams.append("input", query);
    url.searchParams.append("types", options.types || "establishment");
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);

    if (options.location) {
      url.searchParams.append(
        "location",
        `${options.location.lat},${options.location.lng}`
      );
      url.searchParams.append("radius", "50000");
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Autocomplete error: ${data.status}`);
    }

    return (data.predictions || []).map((prediction) => ({
      id: prediction.place_id,
      placeId: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      description: prediction.description,
      types: prediction.types,
      source: "google",
    }));
  } catch (error) {
    console.error("Google autocomplete failed:", error);
    return autocompleteWithOSM(query, options);
  }
}

/**
 * OSM Autocomplete fallback
 */
async function autocompleteWithOSM(query, options = {}) {
  try {
    const url = new URL(`${NOMINATIM_BASE_URL}/search`);
    url.searchParams.append("q", query);
    url.searchParams.append("format", "json");
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("limit", "10");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TravelPlannerApp/1.0",
      },
    });

    const data = await response.json();

    return data.map((place) => ({
      id: place.osm_id,
      placeId: place.place_id,
      name: place.display_name.split(",")[0],
      description: place.display_name,
      source: "osm",
    }));
  } catch (error) {
    console.error("OSM autocomplete failed:", error);
    return [];
  }
}

// Helper functions

function getGooglePhotoUrl(photoReference, options = {}) {
  const maxWidth = options.maxWidth || 400;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}

function getViewBox(center, radiusKm) {
  const kmToDegree = 1 / 111; // Rough conversion
  const delta = radiusKm * kmToDegree;

  return [
    center.lng - delta, // min longitude
    center.lat + delta, // max latitude
    center.lng + delta, // max longitude
    center.lat - delta, // min latitude
  ].join(",");
}

function mapGoogleTypeToCategory(types) {
  if (!types) return "establishment";

  const categoryMap = {
    restaurant: "restaurant",
    food: "restaurant",
    meal_takeaway: "restaurant",
    cafe: "cafe",
    museum: "museum",
    tourist_attraction: "tourist_attraction",
    park: "park",
    shopping_mall: "shopping_mall",
    church: "church",
    hospital: "hospital",
    school: "school",
    lodging: "lodging",
  };

  for (const type of types) {
    if (categoryMap[type]) {
      return categoryMap[type];
    }
  }

  return "establishment";
}

function mapOSMTypeToCategory(type, osm_class) {
  const categoryMap = {
    restaurant: "restaurant",
    cafe: "cafe",
    museum: "museum",
    attraction: "tourist_attraction",
    park: "park",
    shop: "shopping_mall",
    church: "church",
    hospital: "hospital",
    school: "school",
    hotel: "lodging",
  };

  return categoryMap[type] || categoryMap[osm_class] || "establishment";
}
