"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { GoogleMap, OverlayView, OverlayViewF } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { VenueMarker } from "@/types/map";

export type Bounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

type SearchMapBackgroundProps = {
  isMapLoaded: boolean;
  mapLoadError?: Error;
  mapId: string;
  center: google.maps.LatLngLiteral;
  venueMarkers: VenueMarker[];
  selectedVenueId?: string | null;
  selectedMarkerPosition?: google.maps.LatLngLiteral | null;
  bubbleContent?: ReactNode;
  onMarkerSelect?: (venueId: string) => void;
  onBoundsChange?: (bounds: Bounds) => void;
};

export default function SearchMapBackground({
  isMapLoaded,
  mapLoadError,
  mapId,
  center,
  venueMarkers,
  selectedVenueId,
  selectedMarkerPosition,
  bubbleContent,
  onMarkerSelect,
  onBoundsChange,
}: SearchMapBackgroundProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const advancedMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const focusMapOnPosition = (position: google.maps.LatLngLiteral) => {
    if (!mapRef.current) return;

    mapRef.current.panTo(position);
    mapRef.current.setZoom(16);
  };

  useEffect(() => {
    const mapInstance = mapRef.current;
    const advancedMarkerCtor = window.google?.maps?.marker?.AdvancedMarkerElement;

    if (!isMapLoaded || !mapInstance || !advancedMarkerCtor) {
      return;
    }

    markerListenersRef.current.forEach((listener) => listener.remove());
    markerListenersRef.current = [];

    advancedMarkersRef.current.forEach((marker) => {
      marker.map = null;
    });
    advancedMarkersRef.current = [];

    advancedMarkersRef.current = venueMarkers.map((markerData) => {
      const marker = new advancedMarkerCtor({
        position: markerData.position,
        title: markerData.name,
      });

      const listener = marker.addListener("click", () => {
        focusMapOnPosition(markerData.position);
        onMarkerSelect?.(markerData.venueId);
      });

      markerListenersRef.current.push(listener);
      return marker;
    });

    if (clustererRef.current) {
        clustererRef.current.clearMarkers();
    }
    clustererRef.current = new MarkerClusterer({
        map: mapInstance,
        markers: advancedMarkersRef.current,
    });

    return () => {
      if (clustererRef.current) {
          clustererRef.current.clearMarkers();
      }
      markerListenersRef.current.forEach((listener) => listener.remove());
      markerListenersRef.current = [];

      advancedMarkersRef.current.forEach((marker) => {
        marker.map = null;
      });
      advancedMarkersRef.current = [];
    };
  }, [isMapLoaded, onMarkerSelect, venueMarkers]);

  useEffect(() => {
    if (!selectedVenueId) return;

    const marker = venueMarkers.find((item) => item.venueId === selectedVenueId);
    if (!marker) return;

    focusMapOnPosition(marker.position);
  }, [selectedVenueId, venueMarkers]);

  return (
    <div className="absolute inset-0 z-0">
      {mapLoadError && <div className="h-full w-full bg-slate-200" />}

      {!mapLoadError && isMapLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={13}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onIdle={() => {
            if (mapRef.current && onBoundsChange) {
               const bounds = mapRef.current.getBounds();
               if (bounds) {
                 const ne = bounds.getNorthEast();
                 const sw = bounds.getSouthWest();
                 onBoundsChange({
                   minLat: sw.lat(),
                   maxLat: ne.lat(),
                   minLng: sw.lng(),
                   maxLng: ne.lng()
                 });
               }
            }
          }}
          onUnmount={() => {
            if (clustererRef.current) {
                clustererRef.current.clearMarkers();
            }
            markerListenersRef.current.forEach((listener) => listener.remove());
            markerListenersRef.current = [];

            advancedMarkersRef.current.forEach((marker) => {
              marker.map = null;
            });
            advancedMarkersRef.current = [];
            mapRef.current = null;
          }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
            clickableIcons: false,
            mapId,
          }}
        >
          {selectedMarkerPosition && bubbleContent && (
            <OverlayViewF
              position={selectedMarkerPosition}
              mapPaneName={OverlayView.FLOAT_PANE}
            >
              <div className="pointer-events-auto -translate-y-full translate-x-5">
                {bubbleContent}
              </div>
            </OverlayViewF>
          )}
        </GoogleMap>
      )}

      {!mapLoadError && !isMapLoaded && <div className="h-full w-full bg-slate-200" />}
    </div>
  );
}