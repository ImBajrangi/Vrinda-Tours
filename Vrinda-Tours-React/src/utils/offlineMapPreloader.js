// Convert lat/lng to tile coordinates (x, y at given zoom)
export function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const rad = (lat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

// Pre-warms/caches map tiles for the Braj region in the background
export async function prefetchBrajMapRegion(apiKey) {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open('vrinda-map-tiles-v1');
    const zooms = [12, 13, 14]; // Core zooms covering all of Braj 84 Kos
    
    // Braj Mandal bounding box (Barsana, Govardhan, Vrindavan, Mathura)
    const minLat = 27.48, maxLat = 27.68;
    const minLng = 77.35, maxLng = 77.72;

    const urlsToFetch = [];

    zooms.forEach((z) => {
      const p1 = latLngToTile(maxLat, minLng, z);
      const p2 = latLngToTile(minLat, maxLng, z);

      for (let x = Math.min(p1.x, p2.x); x <= Math.max(p1.x, p2.x); x++) {
        for (let y = Math.min(p1.y, p2.y); y <= Math.max(p1.y, p2.y); y++) {
          const sub = ['a', 'b', 'c', 'd'][(x + y) % 4];
          const url = apiKey
            ? `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png?key=${apiKey}`
            : `https://tile.openstreetmap.fr/hot/${z}/${x}/${y}.png`;
          urlsToFetch.push(url);
        }
      }
    });

    // Fetch batch with concurrency control to keep UI silky smooth
    const BATCH_SIZE = 6;
    for (let i = 0; i < urlsToFetch.length; i += BATCH_SIZE) {
      const batch = urlsToFetch.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (url) => {
          const exists = await cache.match(url);
          if (!exists) {
            try {
              const res = await fetch(url);
              if (res.ok) await cache.put(url, res);
            } catch (err) {
              // Ignore single tile fetch error
            }
          }
        })
      );
    }
    console.log(`Braj offline map pack cached (${urlsToFetch.length} tiles).`);
  } catch (err) {
    console.warn('Offline map preloader error:', err);
  }
}
