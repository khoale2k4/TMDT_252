'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin, Star, Wifi, Car, Coffee,
  CheckCircle2, Lock, XCircle, Loader
} from 'lucide-react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import type { Venue } from '@/types/search';
import type { Court, Slot, SlotsResponse } from '@/types/slot';

const VenueDetailPage = () => {
  const params = useParams();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch venue details
        const venueResponse = await axiosClient.get(API_ENDPOINTS.VENUES.DETAIL(venueId));
        console.log('Venue Detail Response:', venueResponse.data);
        setVenue(venueResponse.data.venues);

        // Fetch slots
        const slotsResponse = await axiosClient.get<SlotsResponse>(API_ENDPOINTS.VENUES.SLOT(venueId));
        console.log('Slots Response:', slotsResponse.data);
        setCourts(slotsResponse.data.data.courts);
      } catch (err) {
        console.error('Error fetching venue data:', err);
        setError('Không thể tải thông tin sân. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchData();
    }
  }, [venueId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải thông tin sân...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{error || 'Không tìm thấy sân'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Hero Section */}
      <div className="relative h-64 md:h-96 w-full">
        <img
          src={venue.cover_image_url}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: INFO */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                  <p className="flex items-center text-gray-500 mt-2">
                    <MapPin className="w-4 h-4 mr-1 text-red-500" /> {venue.address}
                  </p>
                </div>
                <div className="text-right">
                  {venue.rating && (
                    <>
                      <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-600 fill-current mr-1" />
                        <span className="font-bold text-yellow-700">{venue.rating.average ?? 'N/A'}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{venue.rating.total_reviews ?? 0} reviews</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {venue.sport_types?.map(type => (
                  <span key={type} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium uppercase">
                    {type}
                  </span>
                ))}
              </div>

              <hr className="my-6 border-gray-100" />

              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-6">
                {venue.amenities?.includes('wifi') && <div className="flex items-center text-gray-600"><Wifi className="w-5 h-5 mr-2" /> Wi-Fi</div>}
                {venue.amenities?.includes('parking') && <div className="flex items-center text-gray-600"><Car className="w-5 h-5 mr-2" /> Parking</div>}
                {venue.amenities?.includes('canteen') && <div className="flex items-center text-gray-600"><Coffee className="w-5 h-5 mr-2" /> Canteen</div>}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: BOOKING GRID */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-50 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Select Slot</h2>
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  {venue.is_open_now ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="space-y-8">
                {courts.map((court) => (
                  <div key={court.court_id}>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                      {court.court_name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {court.slots.map((slot) => (
                        <SlotButton key={slot.slot_id} slot={slot} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200">
                Book Now
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Sub-component for individual slots
const SlotButton = ({ slot }: { slot: Slot }) => {
  const isAvailable = slot.status === 'available';
  const isLocked = slot.status === 'locked';
  const isBooked = slot.status === 'booked';

  const baseStyles = "flex flex-col items-center p-3 rounded-xl border transition-all text-left relative overflow-hidden";

  if (isBooked) return (
    <div className={`${baseStyles} bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed`}>
      <XCircle className="w-4 h-4 text-gray-400 mb-1" />
      <span className="text-xs font-bold text-gray-500">{slot.start_time}</span>
      <span className="text-[10px] text-gray-400 uppercase">Full</span>
    </div>
  );

  if (isLocked) return (
    <div className={`${baseStyles} bg-orange-50 border-orange-100 cursor-wait`}>
      <Lock className="w-4 h-4 text-orange-400 mb-1" />
      <span className="text-xs font-bold text-orange-600">{slot.start_time}</span>
      <span className="text-[10px] text-orange-400 uppercase">Pending</span>
    </div>
  );

  return (
    <button className={`${baseStyles} bg-white border-blue-100 hover:border-blue-500 hover:shadow-md group`}>
      <CheckCircle2 className="w-4 h-4 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-bold text-gray-900">{slot.start_time}</span>
      <span className="text-[11px] text-green-600 font-semibold">{slot.price.toLocaleString()}đ</span>
    </button>
  );
};

export default VenueDetailPage;