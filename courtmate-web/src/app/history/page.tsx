"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/services/axiosClient";
import { API_ENDPOINTS } from "@/services/apiEndpoints";
import { MapPin, Calendar, Clock, CreditCard, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

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
        name: string;
        address: string;
      }
    }
  }[];
};

export default function HistoryPage() {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
