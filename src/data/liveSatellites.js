// Lightweight curated satellite list. Add or update entries as needed.
export const LIVE_SATELLITES = [
  { name: 'ISS (ZARYA)', category: 'Manned', noradId: 25544, n2yoId: 25544, altitude: 420, speed: 7.66, orbitType: 'LEO', visibility: true, signalStrength: 0.95, nextPass: 'TBD' },
  { name: 'HUBBLE', category: 'Telescope', noradId: 20580, n2yoId: 20580, altitude: 540, speed: 7.5, orbitType: 'LEO', visibility: true, signalStrength: 0.92, nextPass: 'TBD' },

  // Starlink cluster examples (many entries to render multiple markers)
  { name: 'STARLINK-1013', category: 'Starlink', noradId: 44238, n2yoId: 44238 },
  { name: 'STARLINK-1014', category: 'Starlink', noradId: 44239, n2yoId: 44239 },
  { name: 'STARLINK-1015', category: 'Starlink', noradId: 44240, n2yoId: 44240 },
  { name: 'STARLINK-1016', category: 'Starlink', noradId: 44241, n2yoId: 44241 },
  { name: 'STARLINK-1017', category: 'Starlink', noradId: 44242, n2yoId: 44242 },
  { name: 'STARLINK-1018', category: 'Starlink', noradId: 44243, n2yoId: 44243 },

  // NOAA weather satellites
  { name: 'NOAA 19', category: 'Weather', noradId: 33591, n2yoId: 33591 },
  { name: 'NOAA 18', category: 'Weather', noradId: 28654, n2yoId: 28654 },
  { name: 'NOAA 15', category: 'Weather', noradId: 25338, n2yoId: 25338 },

  // GPS/navigation satellites (example NORAD IDs)
  { name: 'GPS IIF-10', category: 'Navigation', noradId: 39227, n2yoId: 39227 },
  { name: 'GPS BIIF-4', category: 'Navigation', noradId: 38727, n2yoId: 38727 },
  { name: 'GPS IIF-7', category: 'Navigation', noradId: 40326, n2yoId: 40326 },

  // Additional LEO commercial and scientific satellites
  { name: 'TERRA', category: 'Science', noradId: 25994, n2yoId: 25994 },
  { name: 'AQUA', category: 'Science', noradId: 27424, n2yoId: 27424 },
  { name: 'SUOMI NPP', category: 'Weather', noradId: 37849, n2yoId: 37849 },

  // Fallback examples to ensure we hit 20+ rendered markers
  { name: 'COMMERCIAL-1', category: 'Commercial', noradId: 45235, n2yoId: 45235 },
  { name: 'COMMERCIAL-2', category: 'Commercial', noradId: 45236, n2yoId: 45236 },
  { name: 'COMMERCIAL-3', category: 'Commercial', noradId: 45237, n2yoId: 45237 },
  { name: 'COMMERCIAL-4', category: 'Commercial', noradId: 45238, n2yoId: 45238 },
  { name: 'COMMERCIAL-5', category: 'Commercial', noradId: 45239, n2yoId: 45239 },
];

export default LIVE_SATELLITES;
