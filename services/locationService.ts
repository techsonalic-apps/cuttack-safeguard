
export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  googleMapsLink: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          timestamp: position.timestamp,
          googleMapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`
        });
      },
      (error) => {
        let msg = "Unknown location error";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied. Please enable GPS.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location info unavailable. Check your network/GPS.";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out.";
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
