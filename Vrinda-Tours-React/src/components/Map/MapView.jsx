import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
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

export default function MapView({ locations, drivers = [], activeFilter, userPosition, activeLocation, onSelectLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterRef = useRef(null);
  const markersRef = useRef([]);
  const driverMarkersRef = useRef({}); // { driverId: { marker, status, lat, lng } }
  const userMarkerRef = useRef(null);
  const activeMarkerRef = useRef(null);
  const onSelectLocationRef = useRef(onSelectLocation);

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const filteredLocations = useMemo(() => {
    const raw = (activeFilter === 'all' || activeFilter === '__drivers__')
      ? locations
      : locations.filter((l) => l.category === activeFilter);

    const uniqueMap = new Map();
    raw.forEach((loc) => {
      if (loc.name && !uniqueMap.has(loc.name)) {
        uniqueMap.set(loc.name, loc);
      }
    });
    return Array.from(uniqueMap.values());
  }, [locations, activeFilter]);


  // Initialize map once
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [27.64, 77.38],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      inertia: true,
      inertiaDeceleration: 3000,
      easeLinearity: 0.2,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      minZoom: 2,
    }).addTo(map);

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 60,
      animateAddingMarkers: true
    });


    map.addLayer(cluster);


    mapInstanceRef.current = map;
    clusterRef.current = cluster;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update location markers ONLY when filteredLocations changes
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersRef.current = [];

    filteredLocations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], { icon: createIcon(loc.category, false, true) });
      marker._locData = loc;
      marker.on('click', () => onSelectLocationRef.current?.(loc));
      cluster.addLayer(marker);
      markersRef.current.push(marker);

      setTimeout(() => {
        marker.setIcon(createIcon(loc.category, false, false));
      }, 2500);
    });
  }, [filteredLocations]);

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

  return <div ref={mapRef} id="map" />;
}
