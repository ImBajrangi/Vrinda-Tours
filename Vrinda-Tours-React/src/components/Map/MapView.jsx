import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useFavorites } from '../../hooks/useFavorites';
import { prefetchBrajMapRegion } from '../../utils/offlineMapPreloader';
import './MapView.css';

const MARKER_BASE = '/marker/';

function getCategoryPinData(category) {
  switch (category) {
    case 'Temple':
      return {
        key: 'temple',
        gradTop: '#f59e0b',
        gradMid: '#d97706',
        gradBot: '#b45309',
        // Sacred Hindu Temple Mandir with Kalash & Shikhara
        glyph: `<path d="M12 2L13.5 5.5H10.5L12 2Z" fill="currentColor"/><path d="M12 5.5L15 9.5H9L12 5.5Z" fill="currentColor"/><rect x="7" y="9.5" width="10" height="2" rx="0.5" fill="currentColor"/><rect x="8" y="11.5" width="8" height="7.5" fill="currentColor"/><path d="M10.5 19V15C10.5 14.2 11.2 13.5 12 13.5C12.8 13.5 13.5 14.2 13.5 15V19" fill="#b45309"/><line x1="5" y1="19" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
      };
    case 'Holy Site':
      return {
        key: 'holy-site',
        gradTop: '#10b981',
        gradMid: '#059669',
        gradBot: '#047857',
        // Sacred Lotus Blossom
        glyph: `<path d="M12 3C12 3 9.5 7.5 9.5 11C9.5 12.4 10.6 13.5 12 13.5C13.4 13.5 14.5 12.4 14.5 11C14.5 7.5 12 3 12 3Z" fill="currentColor"/><path d="M7.5 7C7.5 7 5.5 10.5 6 13C6.4 14.8 8 16 9.8 15.8C10.6 15.7 11.4 15.2 12 14.5C11 13 10.5 11 10.5 9C10.5 8.2 10.7 7.5 11 6.8C9.6 6.3 8.3 6.5 7.5 7Z" fill="currentColor"/><path d="M16.5 7C16.5 7 18.5 10.5 18 13C17.6 14.8 16 16 14.2 15.8C13.4 15.7 12.6 15.2 12 14.5C13 13 13.5 11 13.5 9C13.5 8.2 13.3 7.5 13 6.8C14.4 6.3 15.7 6.5 16.5 7Z" fill="currentColor"/><path d="M4 18C7 16.5 10 17.5 12 18.5C14 17.5 17 16.5 20 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
      };
    case 'Dining':
    case 'Restaurant':
      return {
        key: 'dining',
        gradTop: '#f97316',
        gradMid: '#ea580c',
        gradBot: '#c2410c',
        // Culinary Fork & Spoon
        glyph: `<path d="M18 2v6a3 3 0 0 1-3 3v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6 2v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8 9v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
      };
    case 'Hotel':
      return {
        key: 'hotel',
        gradTop: '#6366f1',
        gradMid: '#4f46e5',
        gradBot: '#3730a3',
        // Bed / Ashram Stay
        glyph: `<path d="M2 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 9h18a2 2 0 0 1 2 2v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 17h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 9v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
      };
    case 'Information':
      return {
        key: 'info',
        gradTop: '#0ea5e9',
        gradMid: '#0284c7',
        gradBot: '#0369a1',
        // Information Guide
        glyph: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="8" r="1.3" fill="currentColor"/>`,
      };
    case 'Town':
    default:
      return {
        key: 'town',
        gradTop: '#64748b',
        gradMid: '#475569',
        gradBot: '#1e293b',
        // Heritage Town Landmark
        glyph: `<path d="M12 21s-6-5.33-6-10a6 6 0 0 1 12 0c0 4.67-6 10-6 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.5" fill="currentColor"/>`,
      };
  }
}

function createIcon(category, isActive = false) {
  const pin = getCategoryPinData(category);

  return L.divIcon({
    className: 'marker-wrapper',
    html: `
      <div class="vt-map-pin ${isActive ? 'is-active' : ''} cat-${pin.key}">
        <svg width="38" height="42" viewBox="0 0 38 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pin-grad-${pin.key}" x1="19" y1="3" x2="19" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${pin.gradTop}"/>
              <stop offset="50%" stop-color="${pin.gradMid}"/>
              <stop offset="100%" stop-color="${pin.gradBot}"/>
            </linearGradient>
            <linearGradient id="pin-sheen-${pin.key}" x1="19" y1="4" x2="19" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <!-- Apple Maps & Uber Luxury Floating POI Badge Body -->
          <path d="M 19 3 C 27.28 3, 34 9.72, 34 18 C 34 23.6, 30.6 28.3, 25.8 30.6 L 19 40.5 L 12.2 30.6 C 7.4 28.3, 4 23.6, 4 18 C 4 9.72, 10.72 3, 19 3 Z" 
                fill="url(#pin-grad-${pin.key})" 
                stroke="#ffffff" 
                stroke-width="1.8" 
                stroke-linejoin="round"/>

          <!-- Specular Upper Rim Highlight -->
          <path d="M 8 16 C 9 10 13.5 5.5 19 5.5 C 24.5 5.5 29 10 30 16 C 26 11 21 8.5 15 9.5 C 11.5 10 9 13 8 16 Z" 
                fill="url(#pin-sheen-${pin.key})"/>

          <!-- Inset Medallion Bezel (Preserving circular framing) -->
          <circle cx="19" cy="18" r="10.5" fill="rgba(0, 0, 0, 0.14)" stroke="rgba(255, 255, 255, 0.28)" stroke-width="0.8"/>

          <!-- Pure White Category Icon (Apple Maps & Google Maps Worldwide POI Standard) -->
          <g transform="translate(12.5, 11.5) scale(0.54)" color="#ffffff">
            ${pin.glyph}
          </g>

          <!-- Precision Anchor Tip Dot -->
          <circle cx="19" cy="40.5" r="0.9" fill="#ffffff"/>
        </svg>
        ${isActive ? `
          <div class="vt-water-ripple-container">
            <div class="vt-water-ripple wave-1"></div>
            <div class="vt-water-ripple wave-2"></div>
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [38, 42],
    iconAnchor: [19, 41.4],
    popupAnchor: [0, -42],
  });
}

// Butter-smooth camera glide to focus a target coordinate with zero flickering or tile jitter
function smoothCenterOn(map, lat, lng, { targetZoom = null, offsetY = 0, duration = 0.45 } = {}) {
  if (!map || lat == null || lng == null) return;
  map.stop(); // Cleanly abort any in-flight conflicting transitions

  const currentZoom = map.getZoom();
  const destZoom = targetZoom ? Math.max(currentZoom, targetZoom) : currentZoom;
  const targetLatLng = L.latLng(lat, lng);

  // If zoomed far out (< 14), gracefully zoom into neighborhood first
  if (destZoom > currentZoom + 1) {
    map.setView(targetLatLng, destZoom, { animate: true, duration: 0.5 });
    return;
  }

  // Calculate pixel delta in current viewport
  const pt = map.latLngToContainerPoint(targetLatLng);
  const size = map.getSize();
  const desiredX = size.x / 2;
  const desiredY = Math.max(60, (size.y / 2) + offsetY);
  const deltaX = pt.x - desiredX;
  const deltaY = pt.y - desiredY;

  // If already centered within 6 pixels, stay completely stable (prevents micro-shaking!)
  if (Math.hypot(deltaX, deltaY) < 6) {
    return;
  }

  map.panBy([deltaX, deltaY], {
    animate: true,
    duration,
    easeLinearity: 0.25,
  });
}

export default function MapView({ 
  locations, 
  drivers = [], 
  activeFilter, 
  userPosition, 
  activeLocation, 
  activeRoute, 
  mapStyle = 'carto',
  isDark = false,
  onSelectLocation 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterRef = useRef(null);
  const driverClusterRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const driverMarkersRef = useRef({}); // { driverId: { marker, status, lat, lng } }
  const userMarkerRef = useRef(null);
  const activeMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const onSelectLocationRef = useRef(onSelectLocation);
  const { favorites } = useFavorites();

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const filteredLocations = useMemo(() => {
    let raw = [];
    if (activeFilter === 'favourites') {
      raw = locations.filter((l) => favorites.includes(l.name));
    } else if (activeFilter === 'all' || activeFilter === '__drivers__') {
      raw = locations;
    } else {
      raw = locations.filter((l) => l.category === activeFilter);
    }

    const uniqueMap = new Map();
    raw.forEach((loc) => {
      if (loc.name && !uniqueMap.has(loc.name)) {
        uniqueMap.set(loc.name, loc);
      }
    });
    return Array.from(uniqueMap.values());
  }, [locations, activeFilter, favorites]);


  // Initialize map once
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    // Reset container leaflet ID to prevent StrictMode re-mount collision
    if (mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
    }

    const map = L.map(mapRef.current, {
      center: [27.64, 77.38],
      zoom: 13,
      minZoom: 2,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      inertia: true,
      inertiaDeceleration: 3000,
      easeLinearity: 0.2,
    });

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: false,
      spiderLegPolylineOptions: { weight: 0, opacity: 0 },
      removeOutsideVisibleBounds: true,
      animate: true,
      maxClusterRadius: 55,
      animateAddingMarkers: true,
      iconCreateFunction: function (c) {
        const count = c.getChildCount();
        let cSize = 'marker-cluster-small';
        if (count > 50) cSize = 'marker-cluster-large';
        else if (count > 15) cSize = 'marker-cluster-medium';
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${cSize}`,
          iconSize: L.point(40, 40),
        });
      },
    });

    // Dedicated Luxury Driver Marker Cluster Group for seamless merge on zoom out
    const driverCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: false,
      spiderLegPolylineOptions: { weight: 0, opacity: 0 },
      removeOutsideVisibleBounds: true,
      animate: true,
      maxClusterRadius: 46,
      animateAddingMarkers: true,
      iconCreateFunction: function (c) {
        const count = c.getChildCount();
        return L.divIcon({
          html: `
            <div class="driver-cluster-badge">
              <div class="driver-cluster-pod">
                <span class="driver-cluster-icon">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 16L8 5h8l3 11H5z"/><circle cx="7.5" cy="18.5" r="2"/><circle cx="16.5" cy="18.5" r="2"/>
                  </svg>
                </span>
                <span class="driver-cluster-count">${count}</span>
              </div>
              <span class="driver-cluster-radar"></span>
            </div>
          `,
          className: 'driver-cluster-wrapper',
          iconSize: L.point(46, 32),
          iconAnchor: [23, 16]
        });
      },
    });

    map.addLayer(cluster);
    map.addLayer(driverCluster);

    map.on('click', (e) => {
      // Don't deselect location if a marker, popup, cluster, or UI control was clicked
      const target = e?.originalEvent?.target;
      if (target && target.closest?.('.leaflet-marker-icon, .leaflet-popup, .marker-cluster, .modern-driver-marker, .vt-map-pin, .leaflet-control')) {
        return;
      }
      onSelectLocationRef.current?.(null);
    });

    mapInstanceRef.current = map;
    clusterRef.current = cluster;
    driverClusterRef.current = driverCluster;

    window.__vtCloseDriverPopup = () => {
      try {
        mapInstanceRef.current?.closePopup();
      } catch (err) {
        console.warn('Error closing driver popup:', err);
      }
    };

    // Warm up Braj Mandal region tiles in offline cache during idle time
    const cartoKey = import.meta.env.VITE_CARTO_BASEMAP_KEY || 'cb1_25xx_1_ef24909b63d9228a6de7508f';
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => prefetchBrajMapRegion(cartoKey));
    } else {
      setTimeout(() => prefetchBrajMapRegion(cartoKey), 2500);
    }

    return () => {
      delete window.__vtCloseDriverPopup;
      if (driverClusterRef.current) {
        driverClusterRef.current.clearLayers();
      }
      if (clusterRef.current) {
        clusterRef.current.clearLayers();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current._leaflet_id = null;
      }
    };
  }, []);

  // Dynamically switch basemap tile layers (CARTO default, Google on-demand, Satellite on-demand, OSM backup)
  // BILLING OPTIMIZATION: Google Maps API key is ONLY read & tile URLs constructed when user explicitly
  // selects 'google' or 'satellite' style. Default CARTO and OSM never touch the Google API.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
      activeTileLayerRef.current = null;
    }

    let tileLayer;
    const needsGoogle = mapStyle === 'google' || mapStyle === 'satellite';

    if (needsGoogle) {
      // Only read Google Maps API key when actually needed — saves billing on every other map style
      const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!googleKey) {
        // No API key configured — fallback to free OSM instead of leaking a hardcoded key
        tileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          {
            maxZoom: 19,
            minZoom: 2,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        );
      } else if (mapStyle === 'google') {
        // Google Maps Roadmap — only loaded on explicit user action
        tileLayer = L.tileLayer(
          `https://mt{s}.google.com/vt/lyrs=m&apistyle=s.t:33|p.v:off|s.t:3|p.v:off|s.t:2|p.v:off&x={x}&y={y}&z={z}&key=${googleKey}`,
          {
            maxZoom: 20,
            minZoom: 2,
            subdomains: ['0', '1', '2', '3'],
            attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
          }
        );
      } else {
        // Google Satellite / Hybrid — only loaded on explicit user action
        tileLayer = L.tileLayer(
          `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleKey}`,
          {
            maxZoom: 20,
            minZoom: 2,
            subdomains: ['0', '1', '2', '3'],
            attribution: '&copy; <a href="https://maps.google.com">Google Earth</a>',
          }
        );
      }
    } else if (mapStyle === 'osm') {
      // OpenStreetMap HOT — free, no API key needed
      tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          minZoom: 2,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      );
    } else {
      // Primary Default: CARTO Voyager (Light) or CARTO Dark Matter (Dark)
      const cartoKey = import.meta.env.VITE_CARTO_BASEMAP_KEY || '';
      const cartoSuffix = cartoKey ? `?key=${cartoKey}` : '';
      const cartoVariant = isDark ? 'dark_all' : 'voyager';
      tileLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/rastertiles/${cartoVariant}/{z}/{x}/{y}{r}.png${cartoSuffix}`,
        {
          maxZoom: 20,
          minZoom: 2,
          subdomains: 'abcd',
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      );
    }

    tileLayer.on('tileerror', () => {
      // Silent fail — tiles will show blank for that region
    });

    tileLayer.addTo(map);
    tileLayer.bringToBack();
    activeTileLayerRef.current = tileLayer;
  }, [mapStyle, isDark]);

  // Update location markers when filteredLocations OR activeRoute changes
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersRef.current = [];

    const activeDestName = (activeRoute?.destName || '').toLowerCase().trim();

    filteredLocations.forEach((loc) => {
      // Exclude destination location from cluster when navigating to avoid cluster-badge swallowing and duplicate ghost markers
      if (activeRoute && loc.name.toLowerCase().trim() === activeDestName) {
        return;
      }

      const marker = L.marker([loc.lat, loc.lng], { icon: createIcon(loc.category, false) });
      marker._locData = loc;
      marker.on('click', (e) => {
        if (e?.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        L.DomEvent.stop(e);
        onSelectLocationRef.current?.(loc);
      });
      
      // Interactive on-hover POI info tag
      marker.bindTooltip(
        `<div class="map-poi-hover-tag">
           <span class="poi-tag-title">${loc.name}</span>
         </div>`,
        {
          direction: 'top',
          offset: [0, -38],
          className: 'map-poi-tooltip-custom',
          opacity: 1,
          sticky: false,
        }
      );

      cluster.addLayer(marker);
      markersRef.current.push(marker);
    });
  }, [filteredLocations, activeRoute]);

  // Highlight active location marker & centralize cleanly in visible viewport
  useEffect(() => {
    // Only reset previous marker if the new active location is different
    if (activeMarkerRef.current && activeMarkerRef.current._locData?.name !== activeLocation?.name) {
      const prev = activeMarkerRef.current;
      prev.setIcon(createIcon(prev._locData.category, false));
      activeMarkerRef.current = null;
    }

    if (activeLocation && activeLocation.lat && activeLocation.lng) {
      const map = mapInstanceRef.current;
      const cluster = clusterRef.current;

      const marker = markersRef.current.find((m) => m._locData?.name === activeLocation.name);
      if (marker && marker !== activeMarkerRef.current) {
        marker.setIcon(createIcon(activeLocation.category, true));
        activeMarkerRef.current = marker;
      }

      if (map) {
        // If marker is inside a cluster, use markercluster's native zoomToShowLayer to smoothly uncluster it first
        if (marker && cluster && cluster.hasLayer(marker) && cluster.getVisibleParent(marker) !== marker) {
          cluster.zoomToShowLayer(marker, () => {
            smoothCenterOn(map, activeLocation.lat, activeLocation.lng, { targetZoom: 15, offsetY: -70 });
          });
        } else {
          // Marker is already visible or a standalone/destination marker: Glide directly as smooth as butter!
          smoothCenterOn(map, activeLocation.lat, activeLocation.lng, { targetZoom: 15, offsetY: -70 });
        }
      }
    } else {
      if (activeMarkerRef.current) {
        activeMarkerRef.current.setIcon(createIcon(activeMarkerRef.current._locData.category, false));
        activeMarkerRef.current = null;
      }
    }
  }, [activeLocation]);

  // Draw in-app navigation route polyline directly on the platform map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous route layer
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      const group = L.featureGroup();

      // 1. Subtle soft halo casing for contrast on any map style
      const haloCasing = L.polyline(activeRoute.coordinates, {
        color: '#ffffff',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // 2. Core Google royal-blue navigation highway path
      const coreHighway = L.polyline(activeRoute.coordinates, {
        color: '#2563eb',
        weight: 4.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'core-highway-line',
      });

      haloCasing.addTo(group);
      coreHighway.addTo(group);

// Generate smooth parabolic arc curve between two lat/lng coordinates
function generateParabolicArc(p0, p1, numPoints = 24, bend = 0.22) {
  const [lat0, lng0] = p0;
  const [lat1, lng1] = p1;
  const dLat = lat1 - lat0;
  const dLng = lng1 - lng0;
  
  // Perpendicular offset for parabolic arc height
  const midLat = (lat0 + lat1) / 2 - dLng * bend;
  const midLng = (lng0 + lng1) / 2 + dLat * bend;

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const inv = 1 - t;
    // Quadratic Bezier interpolation
    const lat = inv * inv * lat0 + 2 * inv * t * midLat + t * t * lat1;
    const lng = inv * inv * lng0 + 2 * inv * t * midLng + t * t * lng1;
    points.push([lat, lng]);
  }
  return points;
}

      // 3. Start Origin Dot & Off-road connector parabolic arc (Uber/Google Maps style)
      if (activeRoute.origin?.lat && activeRoute.origin?.lng) {
        const originDot = L.circleMarker([activeRoute.origin.lat, activeRoute.origin.lng], {
          radius: 6,
          color: '#ffffff',
          weight: 2.5,
          fillColor: '#2563eb',
          fillOpacity: 1,
        });
        originDot.bindTooltip('Your Start Location', { direction: 'top', offset: [0, -8] });
        originDot.addTo(group);

        const firstCoord = activeRoute.coordinates[0];
        const startDist = Math.hypot(firstCoord[0] - activeRoute.origin.lat, firstCoord[1] - activeRoute.origin.lng);
        if (startDist > 0.0001) {
          const arcPoints = generateParabolicArc([activeRoute.origin.lat, activeRoute.origin.lng], firstCoord);
          const startConnector = L.polyline(arcPoints, {
            color: '#2563eb',
            weight: 3,
            dashArray: '5, 8',
            opacity: 0.9,
            className: 'uber-walking-connector',
            lineCap: 'round',
          });
          startConnector.addTo(group);
        }
      }

      // 4. Standalone Unclustered Destination Marker & Drop-off walking parabolic connector
      if (activeRoute.destination?.lat && activeRoute.destination?.lng) {
        const destLoc = filteredLocations.find((l) => l.name === activeRoute.destName) || {
          name: activeRoute.destName,
          category: 'Temple',
          lat: activeRoute.destination.lat,
          lng: activeRoute.destination.lng,
        };
        const destMarker = L.marker([activeRoute.destination.lat, activeRoute.destination.lng], {
          icon: createIcon(destLoc.category || 'Temple', true, false),
          zIndexOffset: 8000,
        });
        destMarker.bindTooltip(
          `<div class="dest-map-tooltip"><span>${activeRoute.destName}</span></div>`,
          { permanent: false, direction: 'top', className: 'dest-permanent-label', offset: [0, -44] }
        );
        // Show briefly on route activation for quick orientation, then allow hover/tap
        destMarker.openTooltip();
        setTimeout(() => {
          if (destMarker.isTooltipOpen()) {
            destMarker.closeTooltip();
          }
        }, 3200);
        destMarker.on('click', (e) => {
          if (e?.originalEvent) {
            L.DomEvent.stopPropagation(e.originalEvent);
          }
          L.DomEvent.stop(e);
          onSelectLocationRef.current?.(destLoc);
        });
        destMarker.addTo(group);

        // Uber-style parabolic dotted walking line connecting road drop-off point to exact marker pin
        const lastCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
        const endDist = Math.hypot(lastCoord[0] - activeRoute.destination.lat, lastCoord[1] - activeRoute.destination.lng);
        if (endDist > 0.0001) {
          const arcPoints = generateParabolicArc(lastCoord, [activeRoute.destination.lat, activeRoute.destination.lng]);
          const endConnector = L.polyline(arcPoints, {
            color: '#2563eb',
            weight: 3,
            dashArray: '5, 8',
            opacity: 0.9,
            className: 'uber-walking-connector',
            lineCap: 'round',
          });
          endConnector.bindTooltip('Walking to pin', { sticky: true, className: 'route-interactive-tooltip' });
          endConnector.addTo(group);
        }
      }

      group.addTo(map);
      routeLayerRef.current = group;

      // Fit map view to the full route with comfortable padding
      map.fitBounds(group.getBounds(), {
        paddingTopLeft: [90, 90],
        paddingBottomRight: [90, 180],
        maxZoom: 16,
        animate: true,
      });
    }
  }, [activeRoute]);

  // Update user location marker using Uber-grade vector GPS precision beacon
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPosition) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const icon = L.divIcon({
      className: 'user-marker-wrapper',
      html: `
        <div class="uber-user-beacon" title="Your Live Location">
          <div class="uub-pulse-wave"></div>
          <div class="uub-pulse-ring"></div>
          <div class="uub-core-halo">
            <div class="uub-core-dot"></div>
          </div>
          <div class="uub-tag">YOU</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([userPosition.lat, userPosition.lng], {
      icon,
      zIndexOffset: 3000
    }).addTo(map);

    userMarkerRef.current = marker;
  }, [userPosition]);

  // Update live driver markers with luxury obsidian design and cluster merging on zoom out
  useEffect(() => {
    const driverCluster = driverClusterRef.current;
    if (!driverCluster) return;

    const currentMap = driverMarkersRef.current;

    // Remove markers for offline/removed drivers
    Object.keys(currentMap).forEach((id) => {
      if (!drivers.find(d => d.id === id)) {
        driverCluster.removeLayer(currentMap[id].marker);
        delete currentMap[id];
      }
    });

    drivers.forEach((d) => {
      const status = d.status || 'available';
      const loc = d.location;

      if ((status === 'available' || status === 'busy') && loc?.lat && loc?.lng) {
        const isTaxi = d.vehicleType === 'Taxi' || d.vehicleType === 'Cab';
        const vehicleSvg = isTaxi
          ? `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7L7.5 3.5C7.8 2.8 8.5 2.5 9.2 2.5H14.8C15.5 2.5 16.2 2.8 16.5 3.5L18 7" fill="currentColor" fill-opacity="0.12"/><rect x="4" y="7" width="16" height="13" rx="3.5" fill="currentColor" fill-opacity="0.16"/><path d="M6 11H18M6 15H18"/><circle cx="7" cy="18" r="1.3" fill="currentColor"/><circle cx="17" cy="18" r="1.3" fill="currentColor"/><rect x="10" y="2" width="4" height="1.8" rx="0.9" fill="#10b981" stroke="#10b981"/></svg>`
          : `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8C5 6.3 6.3 5 8 5H16C17.7 5 19 6.3 19 8V16C19 17.1 18.1 18 17 18H7C5.9 18 5 17.1 5 16V8Z" fill="currentColor" fill-opacity="0.14"/><path d="M5 10H19M8 5V18M16 5V18"/><circle cx="12" cy="3.5" r="1.5" fill="#10b981" stroke="#10b981"/><rect x="3.5" y="13" width="1.5" height="4" rx="0.75" fill="currentColor"/><rect x="19" y="13" width="1.5" height="4" rx="0.75" fill="currentColor"/></svg>`;

        const existing = currentMap[d.id];

        // Check if marker needs icon re-render
        if (!existing || existing.status !== status || existing.vehicleType !== d.vehicleType || existing.name !== d.name) {
          if (existing) driverCluster.removeLayer(existing.marker);

          const icon = L.divIcon({
            className: 'driver-marker-wrapper',
            html: `
              <div class="modern-driver-marker">
                <div class="driver-ground-shadow"></div>
                <div class="driver-pod ${status} ${isTaxi ? 'is-cab' : 'is-rickshaw'}">
                  <div class="driver-veh-icon">
                    ${vehicleSvg}
                  </div>
                  <div class="driver-live-dot ${status}">
                    <span class="driver-dot-radar"></span>
                  </div>
                </div>
                <div class="driver-hover-pill">
                  <span class="driver-pill-name">${d.name || 'Driver'}</span>
                  <span class="driver-pill-rating">★ 4.9</span>
                </div>
              </div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
            popupAnchor: [0, -28]
          });

          const popupContent = `
            <div class="driver-popup-card">
              <div class="dpc-header">
                <div class="dpc-avatar-wrap">
                  <div class="dpc-avatar">
                    ${d.photo ? `<img src="${d.photo}" alt="${d.name || 'Driver'}" />` : (d.name || 'D')[0].toUpperCase()}
                  </div>
                  <span class="dpc-avatar-live-indicator" title="Active Sarathi"></span>
                </div>
                <div class="dpc-info-col">
                  <div class="dpc-name-row">
                    <strong class="dpc-name" title="${d.name || 'Driver'}">${d.name || 'Driver'}</strong>
                    <span class="dpc-verified-badge" title="Verified Sarathi">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  </div>
                  <div class="dpc-meta-row">
                    <span class="dpc-vehicle">${d.vehicleType || 'Vrinda Prime'}</span>
                    <span class="dpc-meta-dot">•</span>
                    <span class="dpc-plate">${d.vehicleNo || 'UP-85'}</span>
                  </div>
                </div>
                <button type="button" class="dpc-close-btn" onclick="window.__vtCloseDriverPopup && window.__vtCloseDriverPopup()" aria-label="Close driver popup">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="dpc-status-row">
                <div class="dpc-status ${status}">
                  <span class="dpc-status-dot"></span>
                  <span class="dpc-status-label">${status === 'available' ? 'Available now' : 'On a ride'}</span>
                </div>
                <div class="dpc-eta-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <span>2 min away</span>
                </div>
              </div>
              <div class="dpc-actions">
                <a href="tel:${d.phone || '+918000000000'}" class="dpc-btn-call">
                  <span class="dpc-call-icon-wrap">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </span>
                  <span class="dpc-call-text">Call Driver</span>
                  <span class="dpc-call-rating">★ 4.9</span>
                </a>
              </div>
            </div>
          `;

          const marker = L.marker([loc.lat, loc.lng], { icon, zIndexOffset: 800 });
          marker.bindPopup(popupContent, { 
            className: 'leaflet-driver-popup', 
            maxWidth: 295,
            minWidth: 265,
            autoPan: false,
            offset: L.point(0, -6),
            closeButton: false
          });

          marker.on('click', (e) => {
            if (e?.originalEvent) {
              L.DomEvent.stopPropagation(e.originalEvent);
            }
            L.DomEvent.stop(e);
            smoothCenterOn(mapInstanceRef.current, loc.lat, loc.lng, { targetZoom: 15, offsetY: 70 });
          });

          driverCluster.addLayer(marker);

          currentMap[d.id] = {
            marker,
            status,
            lat: loc.lat,
            lng: loc.lng,
            name: d.name,
            vehicleType: d.vehicleType
          };
        } else {
          // Smoothly animate position update if coords changed
          if (existing.lat !== loc.lat || existing.lng !== loc.lng) {
            existing.marker.setLatLng([loc.lat, loc.lng]);
            existing.lat = loc.lat;
            existing.lng = loc.lng;
          }
        }
      } else if (currentMap[d.id]) {
        driverCluster.removeLayer(currentMap[d.id].marker);
        delete currentMap[d.id];
      }
    });
  }, [drivers]);

  // Expose zoom and center functions via window for FAB/zoom buttons
  useEffect(() => {
    window.__vtMap = {
      zoomIn: () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1, { animate: true }),
      zoomOut: () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1, { animate: true }),
      flyTo: (lat, lng, zoom) => mapInstanceRef.current?.flyTo([lat, lng], zoom || 14, { duration: 1.2 }),
    };
    return () => { delete window.__vtMap; };
  }, []);

  return <div ref={mapRef} id="map" className={`map-style-${mapStyle} ${isDark ? 'dark-map-theme dark-theme' : 'light-map-theme'}`} />;
}
