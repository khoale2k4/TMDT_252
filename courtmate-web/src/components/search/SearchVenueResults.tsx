import { getSportTypeColorClass, getSportTypeLabel, type Venue } from "@/types/search";
import { useRouter } from "next/navigation";

type SearchVenueResultsProps = {
  venues: Venue[];
  isLoading?: boolean;
  onVenueSelect: (venueId: string) => void;
};

export default function SearchVenueResults({ venues, isLoading, onVenueSelect }: SearchVenueResultsProps) {
  const router = useRouter();
  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "-";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNextSlot = (value?: string) => {
    if (!value) return "Chưa có lịch trống";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa có lịch trống";

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  return (
    <div className="relative z-10 mt-4 min-h-0 flex-1 flex flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Kết quả tìm kiếm
        </h2>
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          {venues.length} sân
        </span>
      </div>

      <div className="h-full space-y-4 overflow-y-auto pb-6 pr-1 custom-scrollbar">
        {!isLoading && venues.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <svg className="mb-3 h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Chưa có sân phù hợp</p>
            <p className="mt-1 text-xs text-slate-500">Hãy đổi vị trí hoặc mở rộng bộ lọc để tìm thêm.</p>
          </div>
        )}

        {venues.map((venue) => (
          <article
            key={venue.venue_id}
            onClick={() => router.push(`/venues/${venue.venue_id}`)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
          >
            <div className="flex gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
                <img
                  src={venue.cover_image_url || "https://placehold.co/640x360/e2e8f0/334155?text=Venue"}
                  alt={venue.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute left-1.5 top-1.5">
                  <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md ${venue.is_open_now ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"}`}>
                    {venue.is_open_now ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>
                {typeof venue.distance_km === "number" && (
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {venue.distance_km.toFixed(1)} km
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                      {venue.name}
                    </h3>
                    <div className="flex shrink-0 items-center gap-0.5 rounded bg-amber-50 px-1 py-0.5 dark:bg-amber-500/10">
                      <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{venue.rating?.average || "-"}</span>
                    </div>
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {venue.address}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      Trống {venue.courts_available ?? 0} sân
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Slot: {formatNextSlot(venue.next_available_slot)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(venue.sport_types || []).slice(0, 2).map((sport) => (
                      <span
                        key={`${venue.venue_id}-${sport}`}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getSportTypeColorClass(sport)}`}
                      >
                        {getSportTypeLabel(sport)}
                      </span>
                    ))}
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Từ</span>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(venue.price_range?.min)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
