console.log("LIVE SERVICE LOADED");

class LiveSatelliteService {
  constructor() {
    this.apiKey =
      '893ARH-FAXAAK-PGN6C6-5RBF';

    this.baseUrl =
      'https://api.n2yo.com/rest/v1/satellite';
  }

  async fetchSatellite(noradId) {
    try {
      const url =
        `${this.baseUrl}/positions/${noradId}/15.5047/77.3760/0/1?apiKey=${this.apiKey}`;

      console.log(
        "FETCHING:",
        url
      );

      const response =
        await fetch(url);

      console.log(
        "STATUS:",
        response.status
      );

      const data =
        await response.json();

      console.log(
        "DATA:",
        data
      );

      if (
        data.positions?.length > 0
      ) {
        const p =
          data.positions[0];

        return {
          noradId,

          name:
            data.info
              ?.satname ||
            `SAT ${noradId}`,

          latitude:
            p.satlatitude,

          longitude:
            p.satlongitude,

          altitude:
            p.sataltitude,

          speed:
            p.satvelocity,

          orbitType:
            "LEO",

          visibility:
            true,

          signalStrength:
            0.9,

          nextPass:
            new Date().toLocaleTimeString()
        };
      }

      return null;

    } catch (e) {
      console.log(
        "ERROR:",
        e
      );

      return null;
    }
  }

  subscribe(
    ids,
    callback,
    interval = 5000
  ) {
    const fetchAll =
      async () => {
        const results =
          await Promise.all(
            ids.map(id =>
              this.fetchSatellite(
                id
              )
            )
          );

        callback(
          results.filter(
            Boolean
          )
        );
      };

    fetchAll();

    const timer =
      setInterval(
        fetchAll,
        interval
      );

    return () =>
      clearInterval(timer);
  }
}

export default new LiveSatelliteService();