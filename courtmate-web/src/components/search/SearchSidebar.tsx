"use client";

import { ArrowRight, ChevronLeft, MapPin, Navigation, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import SearchSidebarFilters from "./SearchSidebarFilters";
import SearchVenueResults from "./SearchVenueResults";
import useGoogleLocationSearch from "@/hooks/useGoogleLocationSearch";
import { type SearchFilters, type Venue } from "@/types/search";

const DEFAULT_RADIUS_KM = "10";

type SearchSidebarProps = {
  defaultLocation?: string;
  defaultLatitude: string;
  defaultLongitude: string;
  onApplyFilters: (filters: SearchFilters) => void;
  onVenueSelect: (venueId: string) => void;
  venues: Venue[];
  isLoading?: boolean;
  isGoogleMapsLoaded: boolean;
  googleMapsLoadError?: Error;
  openFilterSignal?: number;
  onToggleSidebar?: () => void;
};

export default function SearchSidebar({
  defaultLocation = "",
  defaultLatitude,
  defaultLongitude,
  onApplyFilters,
  onVenueSelect,
  venues,
  isLoading,
  isGoogleMapsLoaded,
  googleMapsLoadError,
  openFilterSignal,
  onToggleSidebar,
}: SearchSidebarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const initialLat = Number(defaultLatitude);
  const initialLng = Number(defaultLongitude);
  const initialCoordinates = Number.isFinite(initialLat) && Number.isFinite(initialLng)
    ? { lat: initialLat, lng: initialLng }
    : null;

  const {
    location,
    coordinates,
    isLoadingAddress,
    showSuggestions,
    suggestionsData,
    isLoaded,
    loadError,
    setShowSuggestions,
    onLocationInputChange,
    selectSuggestion,
    getCurrentLocation,
    clearLocation,
  } = useGoogleLocationSearch({
    initialLocation: defaultLocation,
    initialCoordinates,
    isGoogleMapsLoaded,
    googleMapsLoadError,
  });

  const getBaseSearchParams = () => ({
    lat: coordinates?.lat.toString() || defaultLatitude,
    lng: coordinates?.lng.toString() || defaultLongitude,
    radius_km: DEFAULT_RADIUS_KM,
  });

  useEffect(() => {
    if (typeof openFilterSignal === "number" && openFilterSignal > 0) {
      setIsFilterOpen(true);
    }
  }, [openFilterSignal]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden px-5 pb-6 pt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/40 text-white">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase dark:text-white">
            Khám phá sân {isLoading && "..."}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${isFilterOpen ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"}`}
            aria-label="Mở bộ lọc"
            title="Mở bộ lọc"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Đóng Search Sidebar"
              title="Đóng Search Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-30">
        {loadError && <p className="mb-2 text-xs text-rose-500">Không tải được Google Maps, bạn vẫn có thể nhập tay.</p>}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="sidebar-location"
              type="text"
              value={location}
              onChange={(e) => {
                onLocationInputChange(e.target.value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isLoadingAddress}
              placeholder="Nhập tên sân hoặc khu vực"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />

            {location.length > 0 && !isLoadingAddress && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  clearLocation();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Xóa nội dung"
                title="Xóa nội dung"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isLoaded && showSuggestions && suggestionsData.length > 0 && (
              <ul className="absolute top-full z-90 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-blue-100 bg-white py-1 shadow-2xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10">
                {suggestionsData.map(({ placeId, description }) => (
                  <li
                    key={placeId}
                    onMouseDown={() => selectSuggestion(placeId, description)}
                    className="cursor-pointer border-b border-slate-100 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 last:border-0 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {location.length > 0 && !isLoadingAddress && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFilters(getBaseSearchParams());
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
              aria-label="Tìm quanh đây"
              title="Tìm quanh đây"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              getCurrentLocation((coords, locationName) => {
                onApplyFilters({
                  ...getBaseSearchParams(),
                  lat: coords.lat.toString(),
                  lng: coords.lng.toString(),
                  loc: locationName
                });
              });
            }}
            disabled={isLoadingAddress || !isLoaded}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
          >
            <Navigation className={`h-3.5 w-3.5 ${isLoadingAddress ? "animate-pulse" : ""}`} />
            {isLoadingAddress ? "Đang tìm..." : "Gần tôi"}
          </button>
        </div>
      </div>

      <div className="relative z-10">
        {/* Panel Filters */}
        <div className={isFilterOpen ? "block" : "hidden"}>
          <SearchSidebarFilters
            onApply={(filters) => {
              onApplyFilters({ ...getBaseSearchParams(), ...filters });
              setIsFilterOpen(false);
            }}
          />
        </div>
      </div>

      {!isFilterOpen && (
        <SearchVenueResults
          venues={venues}
          isLoading={isLoading}
          onVenueSelect={onVenueSelect}
        />
      )}
    </div>
  );
}