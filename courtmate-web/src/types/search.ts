export type Venue = {
  venue_id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  distance_km?: number;
  sport_types?: string[];
  amenities?: string[];
  courts_available?: number;
  price_range?: { min?: number; max?: number };
  rating?: { average?: number; total_reviews?: number };
  cover_image_url?: string;
  is_open_now?: boolean;
  next_available_slot?: string;
};

export type SearchFilters = {
  lat?: string;
  lng?: string;
  radius_km?: string;
  date?: string;
  time_from?: string;
  time_to?: string;
  price_min?: string;
  price_max?: string;
  sort_by?: string;
  sport_types?: string;
  amenities?: string;
  surface_types?: string;
};

export type NearbyVenueResponse = {
  data?: {
    venues?: Venue[];
  };
  venues?: Venue[];
};

const SPORT_TYPE_LABELS: Record<string, string> = {
  pickleball: "Pickleball",
  badminton: "Cầu lông",
  tennis: "Tennis",
  soccer: "Bóng đá",
  football: "Bóng đá",
  basketball: "Bóng rổ",
  volleyball: "Bóng chuyền",
  swimming: "Bơi lội",
};

const SPORT_TYPE_COLORS: Record<string, string> = {
  pickleball: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30",
  badminton: "bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-400/30",
  tennis: "bg-lime-100 text-lime-700 ring-1 ring-lime-200 dark:bg-lime-500/20 dark:text-lime-300 dark:ring-lime-400/30",
  soccer: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30",
  football: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30",
  basketball: "bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:ring-orange-400/30",
  volleyball: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30",
  swimming: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:ring-cyan-400/30",
};

export const getSportTypeLabel = (sportType: string) => SPORT_TYPE_LABELS[sportType] || sportType;

export const getSportTypeColorClass = (sportType: string) =>
  SPORT_TYPE_COLORS[sportType] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-500/50";