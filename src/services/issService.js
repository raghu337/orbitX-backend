import axios from 'axios';

const ISS_LOCATION_URL =
  'https://api.wheretheiss.at/v1/satellites/25544';

const ISS_PASS_URL =
  'https://api.open-notify.org/iss-pass.json';

/* ---------------- DEGREES TO RADIANS ---------------- */
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/* ---------------- DISTANCE CALCULATION ---------------- */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/* ---------------- ISS LOCATION ---------------- */
export const getISSLocation = async () => {
  try {
    const response = await axios.get(ISS_LOCATION_URL, {
      timeout: 10000,
    });

    if (!response.data) {
      return {
        latitude: null,
        longitude: null,
        altitude: null,
        error: 'No data',
      };
    }

    return {
      latitude: parseFloat(response.data.latitude),
      longitude: parseFloat(response.data.longitude),
      altitude: parseFloat(response.data.altitude),
      timestamp: response.data.timestamp,
      error: null,
    };

  } catch (error) {
    console.log(
      'ISS LOCATION SAFE:',
      error?.message || error
    );

    return {
      latitude: null,
      longitude: null,
      altitude: null,
      error: error?.message || 'Fetch failed',
    };
  }
};

/* ---------------- ISS POSITION ---------------- */
export const getISSPosition = async () => {
  const position = await getISSLocation();

  if (
    !position ||
    position.latitude == null ||
    position.longitude == null
  ) {
    return null;
  }

  return {
    latitude: position.latitude,
    longitude: position.longitude,
    altitude: position.altitude,
    timestamp: position.timestamp,
  };
};

/* ---------------- NEXT PASS ---------------- */
export const getNextPass = async (latitude, longitude) => {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return null;
  }

  try {
    const response = await axios.get(ISS_PASS_URL, {
      timeout: 10000,
      params: {
        lat: latitude,
        lon: longitude,
        n: 1,
      },
    });

    const pass = response.data?.response?.[0];

    if (!pass) {
      return null;
    }

    return {
      time: new Date(pass.risetime * 1000),
      duration: pass.duration,
    };

  } catch (error) {
    console.log(
      'TRACKER SAFE:',
      error?.message || error
    );

    return null;
  }
};

/* ---------------- VISIBILITY ---------------- */
export const checkISSVisibility = async (
  latitude,
  longitude
) => {
  const issLocation = await getISSLocation();

  const nextPass = await getNextPass(
    latitude,
    longitude
  );

  const minutesLeft = nextPass
    ? Math.max(
        0,
        Math.round(
          (nextPass.time.getTime() - Date.now()) / 60000
        )
      )
    : null;

  return {
    visible:
      minutesLeft != null && minutesLeft <= 10,

    minutesLeft,

    distance:
      issLocation.latitude != null &&
      issLocation.longitude != null
        ? getDistanceKm(
            latitude,
            longitude,
            issLocation.latitude,
            issLocation.longitude
          )
        : null,
  };
};