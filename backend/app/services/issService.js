import axios from 'axios';

/* ---------------- ISS LIVE POSITION ---------------- */
export const getISSPosition = async () => {
  try {
    const res = await axios.get(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        timeout: 10000,
      }
    );

    console.log('API SUCCESS', res.data);

    return {
      latitude: 0,
      longitude: 0,
      altitude: 0,
      velocity: 0,
    };

  } catch (err) {
    console.log('ISS API Error:', err?.message || err);
    return null;
  }
};

/* ---------------- DISTANCE ---------------- */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------------- NEXT PASS ---------------- */
export async function getNextPass(userLat, userLon) {
  try {
    const iss = await getISSPosition();

    if (!iss) {
      return {
        time: null,
        distance: 0,
      };
    }

    const distance = getDistance(
      userLat,
      userLon,
      iss.latitude,
      iss.longitude
    );

    return {
      time: new Date(),
      distance: Math.round(distance),
    };

  } catch (err) {
    console.log('SAFE ERROR:', err?.message || err);

    return {
      time: null,
      distance: 0,
    };
  }
}

/* ---------------- VISIBILITY ---------------- */
export function checkISSVisibility(userLat, userLon) {
  return {
    visible: false,
    distance: 0,
  };
}

