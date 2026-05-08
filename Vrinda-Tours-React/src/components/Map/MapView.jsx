import { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import './MapView.css';

const MARKER_BASE = 'https://imbajrangi.github.io/Company/Vrindopnishad%20Web/class/marker/';
const LOCAL_BASE = '../../Vrindopnishad Web/class/marker/';

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
  const driverMarkersRef = useRef({}); // { driverId: L.marker }
  const userMarkerRef = useRef(null);
  const activeMarkerRef = useRef(null);

  const filteredLocations = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === '__drivers__') return locations;
    return locations.filter((l) => l.category === activeFilter);
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
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let sizeClass = 'small';
        if (count >= 10) sizeClass = 'medium';
        if (count >= 20) sizeClass = 'large';
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: [40, 40],
        });
      },
    });
    map.addLayer(cluster);

    mapInstanceRef.current = map;
    clusterRef.current = cluster;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersRef.current = [];

    filteredLocations.forEach((loc) => {
      // Start with playing=true for the bounce-in effect
      const marker = L.marker([loc.lat, loc.lng], { icon: createIcon(loc.category, false, true) });
      marker._locData = loc;
      marker.on('click', () => onSelectLocation(loc));
      cluster.addLayer(marker);
      markersRef.current.push(marker);

      // Turn off animation state after initial entrance
      setTimeout(() => {
        marker.setIcon(createIcon(loc.category, false, false));
      }, 2500);
    });
  }, [filteredLocations, onSelectLocation]);

  // Highlight active marker
  useEffect(() => {
    // Reset previous
    if (activeMarkerRef.current) {
      const prev = activeMarkerRef.current;
      prev.setIcon(createIcon(prev._locData.category, false));
    }

    if (activeLocation) {
      const marker = markersRef.current.find((m) => m._locData.name === activeLocation.name);
      if (marker) {
        // Highlight and trigger one-time animation
        marker.setIcon(createIcon(activeLocation.category, true, true));
        activeMarkerRef.current = marker;
        mapInstanceRef.current?.flyTo([activeLocation.lat, activeLocation.lng], 15, { duration: 0.8 });

        // Remove playing class after animation ends
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

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPosition) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const icon = L.divIcon({
      className: 'user-marker-container',
      html: `
        <div class="user-pulse-ring"></div>
        <div class="user-center-dot">
          <div class="user-core"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([userPosition.lat, userPosition.lng], { 
      icon,
      zIndexOffset: 1000 
    }).addTo(map);
    
    userMarkerRef.current = marker;
  }, [userPosition]);

  // Update live driver markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = driverMarkersRef.current;
    
    // Remove markers for drivers no longer in list or offline
    Object.keys(currentMarkers).forEach((id) => {
      if (!drivers.find(d => d.id === id)) {
        map.removeLayer(currentMarkers[id]);
        delete currentMarkers[id];
      }
    });

    drivers.forEach((d) => {
      const status = d.status || 'offline';
      const loc = d.location;

      if ((status === 'available' || status === 'busy') && loc?.lat && loc?.lng) {
        const icon = L.divIcon({
          className: 'driver-marker-wrapper',
          html: `<div class="driver-map-marker">
                   <div class="car-icon ${status}">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                   </div>
                   <div class="status-pulse ${status}"></div>
                   <div class="driver-name-tag">${d.name}</div>
                 </div>`,
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        });

        if (currentMarkers[d.id]) {
          currentMarkers[d.id].setLatLng([loc.lat, loc.lng]);
          currentMarkers[d.id].setIcon(icon);
        } else {
          const marker = L.marker([loc.lat, loc.lng], { icon, zIndexOffset: 500 });
          marker.addTo(map);
          currentMarkers[d.id] = marker;
        }
      } else if (currentMarkers[d.id]) {
        map.removeLayer(currentMarkers[d.id]);
        delete currentMarkers[d.id];
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
