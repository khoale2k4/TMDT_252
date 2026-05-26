'use client';

import { useState } from 'react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import Button from '@/components/Button';
import { Calendar as CalendarIcon, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function RecurringBookingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    venue_id: 'venue-1',
    court_id: 'court-1',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
    days_of_week: [1, 3, 5], // Mon, Wed, Fri
    start_time: '18:00',
    end_time: '19:00',
    payment_method: 'momo'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day) 
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  const handleBooking = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await axiosClient.post(API_ENDPOINTS.CHECKOUTS.RECURRING, formData);
      setResult(res.data.data);
      toast.success("Đặt lịch cố định thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi đặt lịch');
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          Đặt Lịch Cố Định
        </h1>
        <p className="text-slate-500 mb-8">Tính năng quét hàng loạt và đặt sân dài hạn tự động loại bỏ các ngày trùng lịch.</p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Thông số đặt lịch</h2>
            
            <div className="space-y-5">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Khoảng thời gian (Start - End)</label>
                  <div className="flex gap-4">
                     <input 
                        type="date" 
                        value={formData.start_date}
                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                     <input 
                        type="date" 
                        value={formData.end_date}
                        onChange={e => setFormData({...formData, end_date: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian chơi</label>
                  <div className="flex gap-4">
                     <input 
                        type="time" 
                        value={formData.start_time}
                        onChange={e => setFormData({...formData, start_time: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                     <input 
                        type="time" 
                        value={formData.end_time}
                        onChange={e => setFormData({...formData, end_time: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Các thứ trong tuần</label>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((name, index) => {
                      const isSelected = formData.days_of_week.includes(index);
                      return (
                        <button
                          key={index}
                          onClick={() => toggleDay(index)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
               </div>
            </div>

            <Button onClick={handleBooking} disabled={isLoading} className="mt-8 w-full rounded-2xl py-4">
              {isLoading ? 'Đang quét slot...' : 'Thực hiện đặt lịch'}
            </Button>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Kết quả quét (Conflict Resolution)</h2>
            
            {!result ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                <AlertCircle className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Chưa có kết quả quét.</p>
                <p className="text-xs mt-1 text-center max-w-xs">Hệ thống sẽ tự động bỏ qua các ngày bị trùng lịch và tạo hóa đơn tổng.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-700 mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                    <h3 className="text-lg font-bold">Quét thành công!</h3>
                  </div>
                  <p className="text-emerald-800 text-sm">{result.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Số trận thành công</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{result.booked_slots_count}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bị trùng (Bỏ qua)</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{result.conflicted_dates.length}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                   <div className="flex justify-between items-center">
                     <div>
                       <p className="text-sm text-blue-800 font-medium">Tổng tiền (Hóa đơn gộp)</p>
                       <p className="text-xs text-blue-600 mt-1">Sẽ tự động đồng bộ sang MISA</p>
                     </div>
                     <p className="text-2xl font-bold text-blue-700">
                       {result.total_amount.toLocaleString('vi-VN')}đ
                     </p>
                   </div>
                </div>

                {result.conflicted_dates.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Các ngày bị trùng (Bỏ qua):</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {result.conflicted_dates.map((d: string) => (
                        <span key={d} className="inline-block rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
