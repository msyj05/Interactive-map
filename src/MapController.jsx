import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), {
        animate: true,
        duration: 2, // seconds, adjust for speed
      });
    }
  }, [position, map]);

  return null;
}

export default MapController;
