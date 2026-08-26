/**
 * Turn-by-turn in-app navigation service for Vrinda Tours
 */

export async function fetchNavigationRoute(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return null;
  }

  const startLng = origin.lng;
  const startLat = origin.lat;
  const endLng = destination.lng;
  const endLat = destination.lat;

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Routing service returned ' + res.status);

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM returns GeoJSON coordinates [lng, lat] -> convert to Leaflet [lat, lng]
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMins = Math.max(1, Math.round(route.duration / 60));

      // Calculate ETA arrival time
      const arrivalDate = new Date(Date.now() + durationMins * 60 * 1000);
      const arrivalTime = arrivalDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

      // Clean road summary
      const rawSummary = route.legs?.[0]?.summary || '';
      const summary = rawSummary ? `via ${rawSummary}` : 'Fastest route';

      return {
        success: true,
        coordinates,
        distanceKm,
        durationMins,
        arrivalTime,
        summary,
        steps: route.legs?.[0]?.steps || [],
      };
    }
  } catch (err) {
    console.warn('In-app routing fetch error, fallback needed:', err);
  }

  return null;
}

export function openExternalGoogleMaps(origin, destination) {
  if (origin?.lat && origin?.lng && destination?.lat && destination?.lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`, '_blank');
  } else if (destination?.lat && destination?.lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`, '_blank');
  }
}
