import orbitxApi from './orbitxApi';

export const createAlert = async (satelliteId, alertType) => {
  try {
    const response = await orbitxApi.post('/alerts/create', null, {
      params: {
        satellite_id: satelliteId,
        alert_type: alertType,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    return null;
  }
};

export const getUserAlerts = async (userId) => {
  try {
    const response = await orbitxApi.get(`/alerts/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return null;
  }
};
