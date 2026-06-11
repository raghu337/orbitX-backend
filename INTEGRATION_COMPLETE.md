import axios from 'axios';

const BACKEND_URL = 'http://YOUR-IP:8000';

const liveSatelliteService = {
  subscribe: (satelliteGroups, callback) => {

    const fetchData = async () => {

      try {

        const response = await axios.get(
          `${BACKEND_URL}/api/v1/satellites/n2yo-positions?ids=25544,43013,27424,33591&lat=15.5047&lng=77.3760&alt=0`
        );

        console.log('SUCCESS DATA:', response.data);

        callback(response.data);

      } catch (err) {

        console.log('API ERROR:', err);

      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  },
};

export default liveSatelliteService;
