export async function fetchISSPosition() {
  const response = await fetch('http://api.open-notify.org/iss-now.json');
  if (!response.ok) throw new Error('Failed to fetch ISS position');
  const data = await response.json();
  return {
    lat: parseFloat(data.iss_position.latitude),
    lon: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
  };
}

export async function fetchAstronauts() {
  const response = await fetch('http://api.open-notify.org/astros.json');
  if (!response.ok) throw new Error('Failed to fetch astronauts');
  const data = await response.json();
  return data;
}

export async function fetchLocationName(lat, lon) {
  try {
    // Adding a short delay or caching might be needed to avoid rate limits
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    
    if (data.error) {
      return "Over Ocean / Uncharted";
    }

    const address = data.address;
    if (address) {
      const city = address.city || address.town || address.village || address.county;
      const country = address.country;
      if (city && country) return `${city}, ${country}`;
      if (country) return country;
      if (city) return city;
    }
    return data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Error fetching location name:", error);
    return "Over Ocean / Uncharted";
  }
}
