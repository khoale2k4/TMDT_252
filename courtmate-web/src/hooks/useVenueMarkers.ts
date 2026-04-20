import { useEffect, useState } from "react";
import type { Venue } from "@/types/search";
import type { VenueMarker } from "@/types/map";

const getVenueCoordinates = (venue: Venue): google.maps.LatLngLiteral | null => {
  if (typeof venue.lat !== "number" || typeof venue.lng !== "number") {
    return null;
  }

  return { lat: venue.lat, lng: venue.lng };
};

export default function useVenueMarkers(venues: Venue[], isMapLoaded: boolean) {
  const [venueMarkers, setVenueMarkers] = useState<VenueMarker[]>([]);

  useEffect(() => {
    if (!isMapLoaded || !window.google) {
      return;
    }

    let isCancelled = false;

    const syncMarkers = async () => {
      const geocoder = new window.google.maps.Geocoder();

      const markerPromises = venues.map(async (venue) => {
        const directPosition = getVenueCoordinates(venue);
        if (directPosition) {
          return {
            venueId: venue.venue_id,
            name: venue.name,
            position: directPosition,
          };
        }

        if (!venue.address) {
          return null;
        }

        try {
          const response = await geocoder.geocode({ address: venue.address });
          const location = response.results?.[0]?.geometry?.location;

          if (!location) {
            return null;
          }

          return {
            venueId: venue.venue_id,
            name: venue.name,
            position: {
              lat: location.lat(),
              lng: location.lng(),
            },
          };
        } catch {
          return null;
        }
      });

      const resolvedMarkers = (await Promise.all(markerPromises)).filter(
        (marker): marker is VenueMarker => marker !== null
      );

      if (!isCancelled) {
        setVenueMarkers(resolvedMarkers);
      }
    };

    syncMarkers();

    return () => {
      isCancelled = true;
    };
  }, [isMapLoaded, venues]);

  return venueMarkers;
}
