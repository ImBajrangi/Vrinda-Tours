/**
 * Vrinda Tours — PlaceSearchProvider & Geospatial Geocoding Engine
 * Multi-Tier Search Architecture:
 * 1. Fast Local Memory / Indexed Cache
 * 2. Supabase Full-Text & Trigram Places Search
 * 3. Explicit Routes & Parikrama Corridors Discovery
 * 4. Governed OpenStreetMap Photon Provider Fallback (with client throttling & attribution)
 */

import { fetchPlaces } from './realtimeDatabaseService';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { calculateDistance, formatDistance } from '../utils/distance';
import { locations } from '../data/locations';

const MEMORY_CACHE = new Map();
const CACHE_MAX_SIZE = 250;
let lastExternalQueryTime = 0;
const EXTERNAL_THROTTLE_MS = 400; // Rate-limiting compliance

/**
 * Categorize place type enum strictly
 */
export function classifyPlaceType(category) {
  const c = (category || '').toUpperCase();
  if (c === 'TEMPLE') return 'TEMPLE';
  if (c === 'HOTEL' || c === 'STAY' || c === 'ASHRAM') return 'HOTEL';
  if (c === 'RESTAURANT' || c === 'DINING' || c === 'FOOD') return 'RESTAURANT';
  if (c === 'GHAT' || c === 'KUND' || c === 'LANDMARK' || c === 'HOLY SITE') return 'LANDMARK';
  if (c === 'ROUTE' || c === 'PARIKRAMA') return 'ROUTE';
  if (c === 'AREA' || c === 'TOWN' || c === 'VILLAGE') return 'AREA';
  if (c === 'SERVICE' || c === 'DARSHAN') return 'SERVICE';
  return 'PLACE';
}

/**
 * PlaceSearchProvider Primary Entry Point
 */
export async function searchAllPlacesAndAreas(query, userCoords = null) {
  if (!query || !query.trim()) {
    const defaultPlaces = await fetchPlaces();
    if (defaultPlaces && defaultPlaces.length > 0) {
      return defaultPlaces.slice(0, 20).map(p => enrichPlaceResult(p, userCoords));
    }
    return (locations || []).map(p => enrichPlaceResult(p, userCoords));
  }

  const q = query.trim().toLowerCase();

  // 1. Check in-memory LRU cache
  if (MEMORY_CACHE.has(q)) {
    const cached = MEMORY_CACHE.get(q);
    return cached.map(p => enrichPlaceResult(p, userCoords));
  }

  const results = [];
  const seenIds = new Set();

  // 2. Query explicit Routes if query matches parikrama or travel corridors
  const isRouteQuery = /parikrama|marg|route|road|corridor|expressway|yatra path/i.test(q);
  if (isRouteQuery && isSupabaseConfigured()) {
    try {
      const { data: routesData } = await supabase
        .from('routes')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(3);

      if (routesData) {
        routesData.forEach(r => {
          seenIds.add(r.id);
          results.push({
            id: r.id,
            name: r.name,
            hindiName: r.hindi_name,
            town: r.origin_name,
            category: 'ROUTE',
            subtitle: `${r.distance_km} km • ${r.typical_duration_mins} mins typical`,
            lat: r.origin_lat,
            lng: r.origin_lng,
            description: r.description || `Sacred pilgrimage path from ${r.origin_name} to ${r.dest_name}`,
            distanceKm: userCoords ? calculateDistance(userCoords.lat, userCoords.lng, r.origin_lat, r.origin_lng) : null,
            source: 'routes_table'
          });
        });
      }
    } catch (err) {
      console.warn('[SearchProvider] Routes query warning:', err);
    }
  }

  // 3. Query Supabase Indexed Places Database
  const dbPlaces = await fetchPlaces({ search: q });
  (dbPlaces || []).forEach(p => {
    if (!seenIds.has(p.id) && !seenIds.has(p.name.toLowerCase())) {
      seenIds.add(p.id);
      seenIds.add(p.name.toLowerCase());
      results.push(enrichPlaceResult(p, userCoords));
    }
  });

  // 4. Governed External Geocoder Fallback (Only if database results are scarce)
  if (results.length < 4) {
    const now = Date.now();
    if (now - lastExternalQueryTime > EXTERNAL_THROTTLE_MS) {
      lastExternalQueryTime = now;
      const externalPlaces = await queryGovernedPhotonGeocode(q, userCoords);
      externalPlaces.forEach(ep => {
        if (!seenIds.has(ep.name.toLowerCase())) {
          seenIds.add(ep.name.toLowerCase());
          results.push(ep);
        }
      });
    }
  }

  // 5. Rank & Sort: Exact Prefix Matches First, then Nearest Distance
  const sorted = results.sort((a, b) => {
    const aPrefix = a.name.toLowerCase().startsWith(q);
    const bPrefix = b.name.toLowerCase().startsWith(q);
    if (aPrefix && !bPrefix) return -1;
    if (!aPrefix && bPrefix) return 1;
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  }).slice(0, 10);

  // Store in cache
  if (MEMORY_CACHE.size >= CACHE_MAX_SIZE) {
    const firstKey = MEMORY_CACHE.keys().next().value;
    MEMORY_CACHE.delete(firstKey);
  }
  MEMORY_CACHE.set(q, sorted);

  return sorted;
}

/**
 * Format place result with category pill, distance, and subtitle
 */
function enrichPlaceResult(place, userCoords) {
  const dist = userCoords?.lat && userCoords?.lng && place.lat && place.lng
    ? calculateDistance(userCoords.lat, userCoords.lng, place.lat, place.lng)
    : null;

  const categoryType = classifyPlaceType(place.category);

  return {
    id: place.id || `place_${place.name.replace(/\s+/g, '_')}`,
    name: place.name,
    hindiName: place.hindiName,
    town: place.town || 'Vrindavan',
    category: categoryType,
    subtitle: `${place.town || 'Vrindavan'} • ${categoryType}`,
    lat: place.lat,
    lng: place.lng,
    description: place.description,
    image: place.image,
    rating: place.rating || 4.8,
    priceRange: place.priceRange,
    distanceKm: dist,
    distanceText: dist !== null ? formatDistance(dist) : null,
    source: 'supabase_indexed'
  };
}

/**
 * Compute Real Dynamic Geospatial Nearby Attractions from Coordinates
 */
export async function getNearbyAttractionsForLocation(lat, lng, currentName = '', limit = 3) {
  if (!lat || !lng) return [];

  const allPlaces = await fetchPlaces();
  if (!allPlaces || allPlaces.length === 0) return [];

  return allPlaces
    .filter(p => p.name !== currentName && p.lat && p.lng)
    .map(p => {
      const dist = calculateDistance(lat, lng, p.lat, p.lng);
      return {
        name: p.name,
        category: classifyPlaceType(p.category),
        distanceKm: dist,
        distanceText: formatDistance(dist)
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Governed OpenStreetMap Photon Geocoding with Brij bounding box bias
 */
async function queryGovernedPhotonGeocode(query, userCoords) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) return [];

  try {
    const biasLat = userCoords?.lat || 27.5818;
    const biasLng = userCoords?.lng || 77.7010;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=${biasLat}&lon=${biasLng}&limit=4`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const json = await res.json();
    if (json?.features) {
      return json.features.map((f, i) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const lng = coords[0];
        const lat = coords[1];
        const dist = userCoords ? calculateDistance(userCoords.lat, userCoords.lng, lat, lng) : null;

        const subParts = [props.street, props.district, props.city, props.state].filter(Boolean);
        const subtitle = subParts.length > 0 ? subParts.slice(0, 2).join(', ') : 'Place in Brij Region';

        return {
          id: `osm_${props.osm_id || i}`,
          name: props.name || props.street || trimmed,
          subtitle,
          category: props.osm_value === 'place_of_worship' ? 'TEMPLE' : 'PLACE',
          lat,
          lng,
          distanceKm: dist,
          distanceText: dist !== null ? formatDistance(dist) : null,
          source: 'osm_governed_fallback'
        };
      });
    }
  } catch (err) {
    // Fail silently without disrupting user flow
  }

  return [];
}
