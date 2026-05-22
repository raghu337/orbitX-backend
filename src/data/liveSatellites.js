// Lightweight curated satellite list. Add or update entries as needed.
export const LIVE_SATELLITES = [
  { name: 'ISS (ZARYA)', category: 'Manned', noradId: 25544, n2yoId: 25544, altitude: 420, speed: 7.66, orbitType: 'LEO', visibility: true, signalStrength: 0.95, nextPass: 'TBD' },
  { name: 'HUBBLE', category: 'Telescope', noradId: 20580, n2yoId: 20580, altitude: 540, speed: 7.5, orbitType: 'LEO', visibility: true, signalStrength: 0.92, nextPass: 'TBD' },
  { name: 'STARLINK-1013', category: 'Constellation', noradId: 44238, n2yoId: 44238, altitude: 550, speed: 7.7, orbitType: 'LEO', visibility: true, signalStrength: 0.85, nextPass: 'TBD' },
  { name: 'NOAA 19', category: 'Weather', noradId: 33591, n2yoId: 33591, altitude: 824, speed: 7.3, orbitType: 'SSO', visibility: true, signalStrength: 0.8, nextPass: 'TBD' },
  { name: 'GPS IIF-10', category: 'Navigation', noradId: 39227, n2yoId: 39227, altitude: 20200, speed: 3.9, orbitType: 'MEO', visibility: false, signalStrength: 0.75, nextPass: 'TBD' },
  { name: 'SPACE X', category: 'Commercial', noradId: 45235, n2yoId: 45235, altitude: 550, speed: 7.7, orbitType: 'LEO', visibility: true, signalStrength: 0.78, nextPass: 'TBD' },
];

export default LIVE_SATELLITES;
