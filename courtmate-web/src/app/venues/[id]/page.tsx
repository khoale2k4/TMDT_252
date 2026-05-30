'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Coffee,
  Loader,
  Lock,
  MapPin,
  Star,
  Wifi,
  XCircle,
} from 'lucide-react';
import Button from '@/components/Button';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import type { BookingDraft } from '@/types/booking';
import type { Venue } from '@/types/search';
import type { Court, Slot, SlotsResponse } from '@/types/slot';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDisplayDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const VenueDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlotsOnly = async () => {
    try {
      const slotsResponse = await axiosClient.get<SlotsResponse>(API_ENDPOINTS.VENUES.SLOT(venueId));
      const nextCourts = slotsResponse.data.data.courts || [];
      setCourts(nextCourts);
      return nextCourts;
    } catch (err) {
      console.error('Error polling slots:', err);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const venueResponse = await axiosClient.get(API_ENDPOINTS.VENUES.DETAIL(venueId));
        setVenue(venueResponse.data.venues);

        const nextCourts = await fetchSlotsOnly();
        if (nextCourts.length > 0) {
          setSelectedCourtId((current) => current || nextCourts[0].court_id);
        }
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

  useEffect(() => {
    if (!venueId) return;

    const interval = setInterval(() => {
      fetchSlotsOnly();
    }, 3000);

    return () => clearInterval(interval);
  }, [venueId]);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.court_id === selectedCourtId) || null,
    [courts, selectedCourtId]
  );

  const availableDates = useMemo(() => {
    if (!selectedCourt) {
      return [];
    }

    return Array.from(
      new Set(
        selectedCourt.slots
          .filter((slot) => slot.status === 'available')
          .map((slot) => slot.date)
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [selectedCourt]);

  useEffect(() => {
    if (!availableDates.length) {
      setSelectedDate('');
      setSelectedSlotIds([]);
      return;
    }

    setSelectedDate((currentDate) => {
      if (currentDate && availableDates.includes(currentDate)) {
        return currentDate;
      }

      return availableDates[0];
    });
  }, [availableDates]);

  useEffect(() => {
    setSelectedSlotIds([]);
  }, [selectedCourtId, selectedDate]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedCourt || !selectedDate) {
      return [];
    }

    return selectedCourt.slots
      .filter((slot) => slot.date === selectedDate)
      .sort((left, right) => left.start_time.localeCompare(right.start_time));
  }, [selectedCourt, selectedDate]);

  const selectedSlots = useMemo(() => {
    const selectedIdSet = new Set(selectedSlotIds);

    return slotsForSelectedDate.filter((slot) => selectedIdSet.has(slot.slot_id));
  }, [selectedSlotIds, slotsForSelectedDate]);

  const totalPrice = useMemo(
    () => selectedSlots.reduce((sum, slot) => sum + slot.price, 0),
    [selectedSlots]
  );

  const toggleSlot = (slot: Slot) => {
    if (slot.status !== 'available') {
      return;
    }

    setSelectedSlotIds((currentIds) =>
      currentIds.includes(slot.slot_id)
        ? currentIds.filter((slotId) => slotId !== slot.slot_id)
        : [...currentIds, slot.slot_id].sort()
    );
  };

  const handleBookNow = async () => {
    if (!venue || !selectedCourt || !selectedDate || selectedSlots.length === 0) {
      return;
    }

    setBookingLoading(true);
    try {
      const lockPromises = selectedSlots.map(async (slot) => {
        const response = await axiosClient.post(`/slots/${slot.slot_id}/lock`, {
          expected_version: slot.version,
          lock_duration_minutes: 10,
        });
        return {
          slotId: slot.slot_id,
          lockToken: response.data.data.lock_token,
        };
      });

      const lockResults = await Promise.all(lockPromises);
      const lockTokens: Record<string, string> = {};
      lockResults.forEach((result) => {
        lockTokens[result.slotId] = result.lockToken;
      });

      const draft: BookingDraft & { lockTokens?: Record<string, string> } = {
        venueId: venue.venue_id,
        venueName: venue.name,
        venueAddress: venue.address,
        venueImage: venue.cover_image_url || 'https://placehold.co/640x360/e2e8f0/334155?text=CourtMate',
        sportType: selectedCourt.sport_type || venue.sport_types?.[0] || 'court',
        courtId: selectedCourt.court_id,
        courtName: selectedCourt.court_name,
        bookingDate: selectedDate,
        slotIds: selectedSlots.map((slot) => slot.slot_id),
        slotTimes: selectedSlots.map((slot) => slot.start_time),
        totalPrice,
        durationHours: selectedSlots.length,
        lockTokens,
      };

      sessionStorage.setItem('courtmate-booking-draft', JSON.stringify(draft));
      router.push('/checkout');
    } catch (err: any) {
      console.error('Error locking slots:', err);
      const errorMessage = err.response?.data?.error?.message || 'Không thể giữ chỗ sân lúc này. Vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">Đang tải thông tin sân...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-sm ring-1 ring-slate-200">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <p className="text-sm font-medium text-slate-700">{error || 'Không tìm thấy sân.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_22%,#ffffff_100%)] pb-16 pt-28 text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 lg:px-6">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
          <article className="overflow-hidden rounded-[32px] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
            <div className="relative h-72 w-full md:h-[420px]">
              <img
                src={venue.cover_image_url || 'https://placehold.co/1200x700/e2e8f0/334155?text=CourtMate'}
                onError={e => e.currentTarget.src = "https://placehold.co/1200x700/e2e8f0/334155?text=CourtMate"}
                alt={venue.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/35 via-transparent to-transparent" />
            </div>

            <div className="space-y-6 p-6 md:p-10">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
                    {(venue.sport_types?.[0] || 'Thể thao').toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                      {venue.name}
                    </h1>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {venue.address}
                    </p>
                  </div>
                </div>

                {venue.rating && (
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{venue.rating.average ?? 'N/A'}</span>
                    <span className="text-xs font-medium text-amber-600/80">
                      ({venue.rating.total_reviews ?? 0} đánh giá)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <AmenityCard
                  icon={<Wifi className="h-5 w-5 text-blue-600" />}
                  label="Wi-Fi"
                  active={venue.amenities?.includes('wifi')}
                />
                <AmenityCard
                  icon={<Car className="h-5 w-5 text-blue-600" />}
                  label="Bãi đỗ xe"
                  active={venue.amenities?.includes('parking')}
                />
                <AmenityCard
                  icon={<Coffee className="h-5 w-5 text-blue-600" />}
                  label="Canteen"
                  active={venue.amenities?.includes('canteen')}
                />
              </div>

              <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Thông tin sân</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {venue.description || "Không gian đặt sân được thiết kế để giữ flow đặt lịch thật rõ ràng: xem thông tin, chọn ngày chơi, chọn khung giờ, sau đó sang bước thanh toán và xác nhận."}
                </p>
              </div>

              {/* Đánh giá từ khách hàng */}
              <div className="rounded-[28px] bg-white border border-slate-100 p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Star className="h-4 w-4 fill-current text-amber-500" />
                    <span>{venue.rating?.average || 0} / 5</span>
                    <span className="text-xs text-amber-600 font-medium">({venue.rating?.total_reviews || 0} đánh giá)</span>
                  </div>
                </div>

                <div className="space-y-5 divide-y divide-slate-100">
                  {venue.reviews && venue.reviews.length > 0 ? (
                    venue.reviews.map((rev: any) => (
                      <div key={rev.id} className="pt-5 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-800">{rev.user_name}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(rev.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-4 w-4 ${
                                idx < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.comment && (
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                            {rev.comment}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                      Sân này chưa có nhận xét nào. Hãy trở thành người đầu tiên đánh giá sau khi trải nghiệm nhé!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>

          <aside className="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 md:p-8 lg:sticky lg:top-28 lg:h-fit">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Đặt sân</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Chọn lịch chơi</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Giá từ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(venue.price_range?.min || 0)}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <section>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Chọn sân
                </div>
                <div className="grid gap-3">
                  {courts.map((court) => {
                    const isActive = court.court_id === selectedCourtId;

                    return (
                      <button
                        key={court.court_id}
                        type="button"
                        onClick={() => setSelectedCourtId(court.court_id)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{court.court_name}</p>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {court.sport_type}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {court.slots.length} slots
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Chọn ngày
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  min={availableDates[0]}
                  max={availableDates[availableDates.length - 1]}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {availableDates.map((date) => {
                    const active = date === selectedDate;

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {formatDisplayDate(date)}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  Chọn giờ chơi
                </div>

                {slotsForSelectedDate.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Chưa có khung giờ trống cho ngày này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {slotsForSelectedDate.map((slot) => (
                      <SlotButton
                        key={slot.slot_id}
                        slot={slot}
                        selected={selectedSlotIds.includes(slot.slot_id)}
                        onClick={() => toggleSlot(slot)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="mt-8 rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Ngày chơi</span>
                <span className="font-medium text-slate-700">
                  {selectedDate ? formatDisplayDate(selectedDate) : '--'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>Giờ đã chọn</span>
                <span className="font-medium text-slate-700">
                  {selectedSlots.length ? selectedSlots.map((slot) => slot.start_time).join(', ') : '--'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>Thời lượng</span>
                <span className="font-medium text-slate-700">{selectedSlots.length} giờ</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Tổng tạm tính</span>
                  <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleBookNow}
              disabled={!selectedDate || selectedSlots.length === 0 || bookingLoading}
              fullWidth
              size="lg"
              className="mt-6 h-14 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200"
            >
              {bookingLoading ? 'Đang chuyển sang thanh toán...' : 'Đặt ngay'}
            </Button>
          </aside>
        </section>
      </main>
    </div>
  );
};

const AmenityCard = ({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) => (
  <div
    className={`rounded-2xl border px-4 py-4 ${
      active ? 'border-blue-100 bg-blue-50/70' : 'border-slate-200 bg-slate-50/70'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{active ? 'Có sẵn' : 'Không hỗ trợ'}</p>
      </div>
    </div>
  </div>
);

const SlotButton = ({
  slot,
  selected,
  onClick,
}: {
  slot: Slot;
  selected: boolean;
  onClick: () => void;
}) => {
  const baseStyles =
    'rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-300';

  if (slot.status === 'booked') {
    return (
      <div className={`${baseStyles} cursor-not-allowed border-slate-200 bg-slate-50 opacity-70`}>
        <XCircle className="mb-2 h-4 w-4 text-slate-400" />
        <p className="text-sm font-semibold text-slate-500">{slot.start_time}</p>
        <p className="text-xs text-slate-400">Đã được đặt</p>
      </div>
    );
  }

  if (slot.status === 'locked') {
    return (
      <div className={`${baseStyles} cursor-wait border-orange-200 bg-orange-50`}>
        <Lock className="mb-2 h-4 w-4 text-orange-500" />
        <p className="text-sm font-semibold text-orange-700">{slot.start_time}</p>
        <p className="text-xs text-orange-500">Đang giữ chỗ</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
      }`}
    >
      <CheckCircle2 className={`mb-2 h-4 w-4 ${selected ? 'text-blue-600' : 'text-emerald-500'}`} />
      <p className="text-sm font-semibold text-slate-900">{slot.start_time}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{formatCurrency(slot.price)}</p>
    </button>
  );
};

export default VenueDetailPage;