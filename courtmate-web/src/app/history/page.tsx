"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/services/axiosClient";
import { MapPin, Calendar, Clock, CreditCard, ChevronRight, CheckCircle2, XCircle, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import Button from "@/components/Button";

type BookingHistory = {
  id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  slots: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    price: number;
    court: {
      name: string;
      sport_type: string;
      venue: {
        id: string;
        name: string;
        address: string;
      }
    }
  }[];
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
};

export default function HistoryPage() {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewingBooking, setReviewingBooking] = useState<BookingHistory | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get<{ data: BookingHistory[] }>("/checkouts/history");
      setBookings(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải lịch sử đặt sân");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-md"><CheckCircle2 className="w-3.5 h-3.5"/> Đã thanh toán</span>;
      case "pending_payment":
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-md"><Clock className="w-3.5 h-3.5"/> Chờ thanh toán</span>;
      case "cancelled":
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-md"><XCircle className="w-3.5 h-3.5"/> Đã hủy</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-md">{status}</span>;
    }
  };

  const openReviewModal = (booking: BookingHistory) => {
    setReviewingBooking(booking);
    setRating(5);
    setComment("");
  };

  const closeReviewModal = () => {
    setReviewingBooking(null);
  };

  const submitReview = async () => {
    if (!reviewingBooking) return;
    
    // Get venue_id from the first slot (assuming all slots in a booking are for the same venue)
    const venue_id = reviewingBooking.slots[0]?.court.venue.id;
    if (!venue_id) {
      toast.error("Không tìm thấy thông tin cụm sân.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosClient.post("/reviews", {
        booking_id: reviewingBooking.id,
        venue_id,
        rating,
        comment
      });
      
      toast.success("Cảm ơn bạn đã đánh giá!");
      closeReviewModal();
      fetchHistory(); // Refresh to show the new review
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Lịch sử đặt sân</h1>
            <p className="text-slate-500 mt-1">Xem lại các hóa đơn và trạng thái thanh toán của bạn</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl h-40 w-full" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-xs border border-slate-200 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Chưa có lượt đặt sân nào</h3>
            <p className="text-slate-500 mt-2 mb-6">Bạn chưa thực hiện bất kỳ giao dịch đặt sân nào trên hệ thống.</p>
            <Link href="/search" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
              Khám phá sân ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-sm font-medium text-slate-500">Mã HĐ: <span className="text-slate-900 dark:text-white uppercase">#{booking.id.substring(0, 8)}</span></span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="text-sm text-slate-500">Ngày đặt: {new Date(booking.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-6">
                  {/* Slots */}
                  <div className="flex-1 space-y-4">
                    {booking.slots.map((slot, index) => (
                      <div key={slot.id} className="flex gap-4 items-start relative">
                        {index !== booking.slots.length - 1 && (
                          <div className="absolute left-6 top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -ml-0.5"></div>
                        )}
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                          <span className="text-xs font-bold">{slot.date.split('-')[2]}</span>
                          <span className="text-[10px] uppercase">Tháng {slot.date.split('-')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{slot.court.venue.name} - {slot.court.name}</h4>
                          <div className="mt-1 flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {slot.court.venue.address}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {slot.start_time} - {slot.end_time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing & Action */}
                  <div className="md:w-64 shrink-0 flex flex-col justify-between items-start md:items-end p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <span>Phương thức</span>
                        <span className="font-medium flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> {booking.payment_method.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <span>Tổng tiền</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{booking.total_amount.toLocaleString()}đ</span>
                      </div>
                    </div>

                    {booking.status === 'pending_payment' && (
                      <button className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors">
                        Thanh toán ngay <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {booking.status === 'paid' && (
                      booking.review ? (
                        <div className="mt-4 w-full sm:w-auto px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1 border border-amber-200">
                          Đã đánh giá {booking.review.rating} <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </div>
                      ) : (
                        <button 
                          onClick={() => openReviewModal(booking)}
                          className="mt-4 w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1 border border-slate-200 shadow-sm transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" /> Đánh giá sân
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900">Đánh giá trải nghiệm</h3>
            <p className="text-sm text-slate-500 mt-1">
              Bạn cảm thấy thế nào về {reviewingBooking.slots[0]?.court.venue.name}?
            </p>

            <div className="flex justify-center gap-2 mt-6 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-amber-500' : 'text-slate-200'}`}
                >
                  <Star className={`w-10 h-10 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm font-medium text-slate-600 mb-6">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Tuyệt vời"}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nhận xét (Tùy chọn)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={closeReviewModal}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button 
                className="flex-1 bg-blue-600 text-white"
                onClick={submitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
