import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 10); // 👈 recenters map only when position changes
    }
  }, [position, map]);

  return null;
}

export default MapController;
