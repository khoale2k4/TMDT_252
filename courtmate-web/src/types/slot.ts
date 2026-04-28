export interface Venue {
  venue_id: string;
  name: string;
  address: string;
  distance_km: number;
  sport_types: string[];
  amenities: string[];
  courts_available: number;
  price_range: { min: number; max: number };
  rating: { average: number; total_reviews: number };
  cover_image_url: string;
  is_open_now: boolean;
}

export type Slot = {
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'locked';
  price: number;
  version: number;
}

export type Court = {
  court_id: string;
  court_name: string;
  sport_type: string;
  slots: Slot[];
}

export type SlotsResponse = {
  data: {
    venue_id: string;
    courts: Court[];
  };
}

export type VenueSlotsData = {
  venue_id: string;
  courts: Court[];
};