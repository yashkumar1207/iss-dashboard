import { useState, useEffect, useRef } from 'react';
import { fetchISSPosition, fetchAstronauts, fetchLocationName } from '../services/issService';
import { calculateSpeed } from '../utils/haversine';

export function useISSData() {
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Fetching...');
  const [astronauts, setAstronauts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prevPositionRef = useRef(null);

  const fetchData = async () => {
    try {
      const posData = await fetchISSPosition();
      const newPos = { lat: posData.lat, lng: posData.lon, timestamp: posData.timestamp };
      
      setPosition(newPos);
      
      setPath(prevPath => {
        const updatedPath = [...prevPath, [newPos.lat, newPos.lng]];
        // Keep last 15 positions
        return updatedPath.length > 15 ? updatedPath.slice(updatedPath.length - 15) : updatedPath;
      });

      // Calculate speed
      if (prevPositionRef.current) {
        const timeDiff = newPos.timestamp - prevPositionRef.current.timestamp;
        const speed = calculateSpeed(
          prevPositionRef.current.lat,
          prevPositionRef.current.lng,
          newPos.lat,
          newPos.lng,
          timeDiff
        );
        
        // Sometimes open-notify returns the exact same timestamp/position if called too fast.
        // We'll only update speed if timeDiff > 0 and position actually changed.
        if (timeDiff > 0 && speed >= 0) {
           // ISS average speed is around 27,600 km/h. If we get a crazy number due to API glitch, clamp or ignore it.
           const validSpeed = speed > 40000 ? 27600 : speed; 
           setCurrentSpeed(validSpeed);
           setSpeedHistory(prev => {
             const updatedHistory = [...prev, { time: new Date(newPos.timestamp * 1000).toLocaleTimeString(), speed: validSpeed }];
             // Keep last 30 measurements
             return updatedHistory.length > 30 ? updatedHistory.slice(updatedHistory.length - 30) : updatedHistory;
           });
        }
      } else {
        // Mock initial speed just to show something before next tick
        setCurrentSpeed(27600);
      }

      prevPositionRef.current = newPos;

      // Reverse geocoding
      const locName = await fetchLocationName(newPos.lat, newPos.lng);
      setLocationName(locName);

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ISS data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Fetch astronauts once
    fetchAstronauts().then(data => setAstronauts(data)).catch(console.error);

    // Poll every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return {
    position,
    path,
    currentSpeed,
    speedHistory,
    locationName,
    astronauts,
    loading,
    error,
    refetch: fetchData
  };
}
