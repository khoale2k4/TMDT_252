"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import { ChevronRight } from "lucide-react";
import SearchMapBackground, { type Bounds } from "@/components/search/SearchMapBackground";
import SearchSidebar from "@/components/search/SearchSidebar";
import VenueMapBubble from "@/components/search/VenueMapBubble";
import useVenueMarkers from "@/hooks/useVenueMarkers";
import useVenueSlots from "@/hooks/useVenueSlots";
import axiosClient from "@/services/axiosClient";
import API_ENDPOINTS from "@/services/apiEndpoints";
import type { NearbyVenueResponse, SearchFilters, Venue } from "@/types/search";

const mapLibraries: ("places" | "marker")[] = ["places", "marker"];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [openFilterSignal, setOpenFilterSignal] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState<Bounds | null>(null);
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID";
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: mapLibraries,
    version: "weekly",
  });

  const venueMarkers = useVenueMarkers(venues, isMapLoaded);
  const {
    selectedVenueSlots,
    slotLoading,
    slotError,
    clearVenueSlots,
  } = useVenueSlots(selectedVenueId);

  const fallbackCenter = useMemo(() => {
    const lat = Number(searchParams.get("lat") || "10.7769");
    const lng = Number(searchParams.get("lng") || "106.7009");

    return {
      lat: Number.isFinite(lat) ? lat : 10.7769,
      lng: Number.isFinite(lng) ? lng : 106.7009,
    };
  }, [searchParams]);

  const mapCenter = useMemo(
    () => venueMarkers[0]?.position || fallbackCenter,
    [fallbackCenter, venueMarkers]
  );

  const selectedMarkerPosition = useMemo(() => {
    if (!selectedVenueId) {
      return null;
    }

    return venueMarkers.find((marker) => marker.venueId === selectedVenueId)?.position || null;
  }, [selectedVenueId, venueMarkers]);

  const handleVenueSelect = useCallback((venueId: string) => {
    setSelectedVenueId(venueId);
  }, []);

  const fetchVenues = useCallback(async (filters: SearchFilters = {}, bounds?: Bounds | null) => {
    setLoading(true);

    let params: any = { ...filters };

    if (bounds) {
       params.min_lat = bounds.minLat;
       params.max_lat = bounds.maxLat;
       params.min_lng = bounds.minLng;
       params.max_lng = bounds.maxLng;
    } else {
       params.lat = filters.lat || searchParams.get("lat") || "10.7769";
       params.lng = filters.lng || searchParams.get("lng") || "106.7009";
       params.radius_km = filters.radius_km || searchParams.get("radius_km") || "10";
    }

    try {
      const res = await axiosClient.get<NearbyVenueResponse>(API_ENDPOINTS.VENUES.NEARBY, { params });
      const normalizedVenues = res.data?.data?.venues || res.data?.venues || [];
      setVenues(normalizedVenues);
      console.log("Kết quả tìm kiếm:", normalizedVenues);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sân:", error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Gọi API lần đầu khi vừa vào trang
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Gọi API khi thay đổi Bounds (kéo map)
  useEffect(() => {
    const handler = setTimeout(() => {
        if (mapBounds) {
            fetchVenues({}, mapBounds);
        }
    }, 500);
    return () => clearTimeout(handler);
  }, [mapBounds, fetchVenues]);

  const bubbleContent = useMemo(() => {
    if (!selectedVenueId) {
      return null;
    }

    if (slotLoading) {
      return (
        <div className="w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-xl">
          Đang tải lịch sân...
        </div>
      );
    }

    if (slotError) {
      return (
        <div className="w-64 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-600 shadow-xl">
          {slotError}
          <button
            type="button"
            className="mt-3 block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
            onClick={() => {
              setSelectedVenueId(null);
              clearVenueSlots();
            }}
          >
            Đóng
          </button>
        </div>
      );
    }

    if (!selectedVenueSlots) {
      return null;
    }

    return (
      <VenueMapBubble
        data={selectedVenueSlots}
        onClose={() => {
          setSelectedVenueId(null);
          clearVenueSlots();
        }}
      />
    );
  }, [clearVenueSlots, selectedVenueId, selectedVenueSlots, slotError, slotLoading]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <SearchMapBackground
        isMapLoaded={isMapLoaded}
        mapLoadError={mapLoadError}
        mapId={mapId}
        center={mapCenter}
        venueMarkers={venueMarkers}
        selectedVenueId={selectedVenueId}
        selectedMarkerPosition={selectedMarkerPosition}
        bubbleContent={bubbleContent}
        onMarkerSelect={handleVenueSelect}
        onBoundsChange={(bounds) => setMapBounds(bounds)}
      />

      {isSidebarOpen && (
        <div className="absolute bottom-0 left-0 z-10 h-[85vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 md:w-1/3 md:rounded-tr-3xl md:rounded-tl-none lg:w-1/4">
          <SearchSidebar
            onApplyFilters={fetchVenues}
            onVenueSelect={handleVenueSelect}
            defaultLocation={searchParams.get("loc") || ""}
            defaultLatitude={searchParams.get("lat") || "10.7769"}
            defaultLongitude={searchParams.get("lng") || "106.7009"}
            venues={venues}
            isLoading={loading}
            isGoogleMapsLoaded={isMapLoaded}
            googleMapsLoadError={mapLoadError}
            openFilterSignal={openFilterSignal}
            onToggleSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg ring-1 ring-slate-200 backdrop-blur transition hover:bg-white dark:bg-slate-900/95 dark:text-slate-100 dark:ring-slate-700"
          aria-label="Mở Search Sidebar"
          title="Mở Search Sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}