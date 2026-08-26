import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useFavorites } from '../../hooks/useFavorites';
import { prefetchBrajMapRegion } from '../../utils/offlineMapPreloader';
import './MapView.css';

const MARKER_BASE = '/marker/';

function getCategoryIcon(category) {
  switch (category) {
    case 'Temple':
      return `${MARKER_BASE}marker-ios-17-outlined/icons8-marker-100.gif`;
    case 'Holy Site':
      return `${MARKER_BASE}place-marker-ios-17-filled/icons8-place-marker-100.gif`;
    case 'Dining':
    case 'Restaurant':
      return `${MARKER_BASE}pin-3.png`;
    case 'Hotel':
    case 'Information':
      return `${MARKER_BASE}pin-2.png`;
    case 'Town':
      return `${MARKER_BASE}marker-ink/icons8-marker-96.png`;
    default:
      return `${MARKER_BASE}marker-ink/icons8-marker-96.png`;
  }
}

function createIcon(category, isActive = false, isPlaying = false) {
  const hasAnim = category === 'Temple' || category === 'Holy Site';

  if (isActive) {
    return L.divIcon({
      className: 'marker-wrapper',
      html: `<div class="image-marker active destination ${isPlaying ? 'playing' : ''}">
               <img src="${MARKER_BASE}flag-3.png" class="static" alt="Destination">
             </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    });
  }

  const iconUrl = getCategoryIcon(category);
  const baseStaticUrl = `${MARKER_BASE}marker-ink/icons8-marker-96.png`;
  const staticUrl = hasAnim ? baseStaticUrl : iconUrl;

  return L.divIcon({
    className: 'marker-wrapper',
    html: `<div class="image-marker ${isPlaying ? 'playing' : ''} ${hasAnim ? 'has-animation' : 'is-static'}">
             <img src="${staticUrl}" class="static" alt="${category}">
             ${hasAnim ? `<img src="${iconUrl}" class="animated" alt="${category}">` : ''}
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
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
  onSelectLocation 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterRef = useRef(null);
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
      animateAddingMarkers: true
    });

    map.addLayer(cluster);

    map.on('click', () => {
      onSelectLocationRef.current?.(null);
    });

    mapInstanceRef.current = map;
    clusterRef.current = cluster;

    // Warm up Braj Mandal region tiles in offline cache during idle time
    const cartoKey = import.meta.env.VITE_CARTO_BASEMAP_KEY || 'cb1_25xx_1_ef24909b63d9228a6de7508f';
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => prefetchBrajMapRegion(cartoKey));
    } else {
      setTimeout(() => prefetchBrajMapRegion(cartoKey), 2500);
    }

    return () => {
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
      // Primary Default: CARTO Voyager — free tier, no Google API usage
      const cartoKey = import.meta.env.VITE_CARTO_BASEMAP_KEY || '';
      const cartoSuffix = cartoKey ? `?key=${cartoKey}` : '';
      tileLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoSuffix}`,
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
  }, [mapStyle]);

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

      const marker = L.marker([loc.lat, loc.lng], { icon: createIcon(loc.category, false, true) });
      marker._locData = loc;
      marker.on('click', (e) => {
        if (e) {
          L.DomEvent.stopPropagation(e);
        }
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

      setTimeout(() => {
        marker.setIcon(createIcon(loc.category, false, false));
      }, 2500);
    });
  }, [filteredLocations, activeRoute]);

  // Highlight active location marker
  useEffect(() => {
    if (activeMarkerRef.current) {
      const prev = activeMarkerRef.current;
      prev.setIcon(createIcon(prev._locData.category, false));
    }

    if (activeLocation) {
      const marker = markersRef.current.find((m) => m._locData.name === activeLocation.name);
      if (marker) {
        marker.setIcon(createIcon(activeLocation.category, true, true));
        activeMarkerRef.current = marker;
        mapInstanceRef.current?.flyTo([activeLocation.lat, activeLocation.lng], 15, { duration: 0.8 });

        setTimeout(() => {
          if (activeMarkerRef.current === marker) {
            marker.setIcon(createIcon(activeLocation.category, true, false));
          }
        }, 2500);
      }
    } else {
      activeMarkerRef.current = null;
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
          if (e) {
            L.DomEvent.stopPropagation(e);
          }
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

  // Update user location marker using user-marker-crop.gif with remove-bg SVG filter
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPosition) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const icon = L.divIcon({
      className: 'user-marker-wrapper',
      html: `
        <div class="image-marker user-location-marker">
          <img src="/user-marker-crop.gif" alt="Your Location" />
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44]
    });

    const marker = L.marker([userPosition.lat, userPosition.lng], {
      icon,
      zIndexOffset: 2000
    }).addTo(map);

    userMarkerRef.current = marker;
  }, [userPosition]);




  // Update live driver markers safely without flickering
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMap = driverMarkersRef.current;

    // Remove markers for offline/removed drivers
    Object.keys(currentMap).forEach((id) => {
      if (!drivers.find(d => d.id === id)) {
        map.removeLayer(currentMap[id].marker);
        delete currentMap[id];
      }
    });

    drivers.forEach((d) => {
      const status = d.status || 'offline';
      const loc = d.location;

      if ((status === 'available' || status === 'busy') && loc?.lat && loc?.lng) {
        const vehicleEmoji = d.vehicleType === 'Taxi' ? '🚗' : (d.vehicleType === 'Bike' ? '🛵' : '🛺');

        const existing = currentMap[d.id];

        // Check if marker needs icon re-render
        if (!existing || existing.status !== status || existing.vehicleType !== d.vehicleType || existing.name !== d.name) {
          if (existing) map.removeLayer(existing.marker);

          const icon = L.divIcon({
            className: 'driver-marker-wrapper',
            html: `<div class="driver-map-marker">
                     <div class="car-icon ${status}">
                       <span style="font-size:16px;">${vehicleEmoji}</span>
                     </div>
                     <div class="status-pulse ${status}"></div>
                     <div class="driver-name-tag">${d.name}</div>
                   </div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
            popupAnchor: [0, -22]
          });

          const popupContent = `
            <div class="driver-popup-card">
              <div class="dpc-header">
                <div class="dpc-avatar">
                  ${d.photo ? `<img src="${d.photo}" alt="${d.name}" />` : (d.name || 'D')[0].toUpperCase()}
                </div>
                <div class="dpc-info-col">
                  <strong class="dpc-name">${d.name}</strong>
                  <span class="dpc-sub">${d.vehicleType || 'E-Rickshaw'} • ${d.vehicleNo || 'UP-85'}</span>
                </div>
              </div>
              <div class="dpc-status ${status}">${status === 'available' ? 'Available now' : 'On a ride'}</div>
              <div class="dpc-actions">
                <a href="tel:${d.phone}" class="dpc-btn-call">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>Call Driver</span>
                </a>
              </div>
            </div>
          `;

          const marker = L.marker([loc.lat, loc.lng], { icon, zIndexOffset: 500 });
          marker.bindPopup(popupContent, { className: 'leaflet-driver-popup', maxWidth: 220 });
          marker.addTo(map);

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
        map.removeLayer(currentMap[d.id].marker);
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

  return <div ref={mapRef} id="map" className={`map-style-${mapStyle}`} />;
}
