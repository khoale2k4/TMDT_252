"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../Button";
import useGoogleLocationSearch from "@/hooks/useGoogleLocationSearch";

const SPORTS = [
  { id: "soccer", name: "Bóng đá" },
  { id: "basketball", name: "Bóng rổ" },
  { id: "volleyball", name: "Bóng chuyền" },
  { id: "badminton", name: "Cầu lông" },
  { id: "tennis", name: "Tennis" },
  { id: "pickle", name: "Pickleball" },
  { id: "swimming", name: "Bơi lội" }
];

const dropdownArrowStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center"
};

interface HeroSearchBarProps {
  isGoogleMapsLoaded?: boolean;
  googleMapsLoadError?: Error | undefined;
}

export default function SearchBar({
  isGoogleMapsLoaded,
  googleMapsLoadError
}: HeroSearchBarProps) {
  const router = useRouter();
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
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
    isGoogleMapsLoaded,
    googleMapsLoadError,
  });
  const today = new Date().toISOString().split("T")[0];

  const handleSearch = () => {
    if (!coordinates) {
      toast.error("Vui lòng chọn địa điểm từ gợi ý hoặc dùng nút Gần tôi để lấy tọa độ.");
      return;
    }

    const query = new URLSearchParams({
      lat: coordinates.lat.toString(),
      lng: coordinates.lng.toString(),
      loc: location,
      sport_types: sport,
      date: date,
      time_from: time
    });

    router.push(`/search?${query.toString()}`);
  };

  if (loadError) return <div className="p-4 text-rose-500">Lỗi tải Google Maps. Vui lòng thử lại sau.</div>;
  if (!isLoaded) return <div className="p-4 text-slate-500">Đang tải bản đồ...</div>;

  return (
    <div className="w-full rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Tìm sân nhanh</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">Chọn địa điểm, môn và thời gian</h2>
        </div>
        <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 md:block">
          Gợi ý gần bạn
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        {/* Địa điểm */}
        <div className="relative flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Địa điểm / Tên sân</label>
          <div className="relative">
            <MapPin size={15} strokeWidth={2.2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                onLocationInputChange(e.target.value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isLoadingAddress}
              placeholder="Nhập tên sân hoặc địa điểm"
              className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-9 pr-10 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            {location.length > 0 && !isLoadingAddress && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  clearLocation();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            )}

            {/* Dropdown Gợi ý */}
            {showSuggestions && suggestionsData.length > 0 && (
              <ul className="absolute top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {suggestionsData.map(({ placeId, description }) => (
                  <li
                    key={placeId}
                    onMouseDown={() => selectSuggestion(placeId, description)}
                    className="cursor-pointer border-b border-slate-50 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700 last:border-0"
                  >
                    {description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit rounded-full px-2 py-1 font-semibold"
            onClick={getCurrentLocation}
            disabled={isLoadingAddress}
          >
            <Navigation size={11} strokeWidth={2.5} className={isLoadingAddress ? "animate-pulse" : ""} />
            {isLoadingAddress ? "Đang tìm..." : "Gần tôi"}
          </Button>
        </div>

        {/* Môn thể thao */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Môn thể thao</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
            style={dropdownArrowStyle}
          >
            <option value="" disabled>Chọn môn</option>
            {SPORTS.map((sportOption) => (
              <option key={sportOption.id} value={sportOption.id}>
                {sportOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ngày */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Ngày</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>

        {/* Giờ */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Giờ</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSearch}
        className="mt-4 rounded-2xl bg-linear-to-r from-sky-600 to-blue-600 py-3 font-bold shadow-[0_14px_30px_rgba(37,99,235,0.28)] hover:brightness-110 active:scale-[0.99]"
      >
        <Search size={16} strokeWidth={2.5} />
        Tìm kiếm sân
      </Button>
    </div>
  );
}