'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Loader, XCircle, CalendarClock } from 'lucide-react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import Button from '@/components/Button';
import { toast } from 'react-toastify';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 10.762622,
    lng: 106.660172,
    sport_types: ['badminton'],
    amenities: ['wifi', 'parking'],
    cover_image_url: '',
    courts: [{ name: 'Sân 1', sport_type: 'badminton' }]
  });
  const [slotData, setSlotData] = useState({
    venueId: '',
    date: new Date().toISOString().split('T')[0],
    start_hour: 8,
    end_hour: 22,
    price: 60000
  });

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN.VENUES.LIST);
      setVenues(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách sân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post(API_ENDPOINTS.ADMIN.VENUES.CREATE, formData);
      toast.success('Tạo sân thành công!');
      setIsCreating(false);
      fetchVenues();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tạo sân');
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post(`${API_ENDPOINTS.ADMIN.VENUES.LIST}/${slotData.venueId}/slots`, {
        date: slotData.date,
        start_hour: Number(slotData.start_hour),
        end_hour: Number(slotData.end_hour),
        price: Number(slotData.price)
      });
      toast.success(`Đã tạo thành công ${res.data.data.count} slots!`);
      setSlotData({ ...slotData, venueId: '' });
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi sinh slots');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Sân (Admin)</h1>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          {isCreating ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Hủy' : 'Thêm sân mới'}
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Thêm sân mới</h2>
          <form onSubmit={handleCreateVenue} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên sân</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>
            <Button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700">
              Lưu sân
            </Button>
          </form>
        </div>
      )}

      {slotData.venueId && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Sinh Slots Tự Động
          </h2>
          <form onSubmit={handleGenerateSlots} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày</label>
              <input
                required
                type="date"
                value={slotData.date}
                onChange={e => setSlotData({ ...slotData, date: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Từ giờ</label>
              <input
                required
                type="number"
                min="0" max="23"
                value={slotData.start_hour}
                onChange={e => setSlotData({ ...slotData, start_hour: Number(e.target.value) })}
                className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Đến giờ</label>
              <input
                required
                type="number"
                min="1" max="24"
                value={slotData.end_hour}
                onChange={e => setSlotData({ ...slotData, end_hour: Number(e.target.value) })}
                className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giá mỗi ca</label>
              <input
                required
                type="number"
                step="1000"
                value={slotData.price}
                onChange={e => setSlotData({ ...slotData, price: Number(e.target.value) })}
                className="w-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-900"
              />
            </div>
            <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 h-[42px]">
              Tạo Slots
            </Button>
            <button type="button" onClick={() => setSlotData({ ...slotData, venueId: '' })} className="px-4 py-2 text-slate-500 hover:text-slate-700 underline text-sm h-[42px]">
              Hủy
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map(venue => (
            <div key={venue.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={venue.cover_image_url || 'https://placehold.co/600x300/e2e8f0/334155?text=CourtMate'} alt={venue.name} className="w-full h-40 object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 truncate">{venue.name}</h3>
                <p className="text-slate-500 text-sm mt-1 flex items-start gap-1">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                  <span className="line-clamp-2">{venue.address}</span>
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-sm font-medium text-slate-600">
                    <span className="text-blue-600 font-bold">{venue.courts?.length || 0}</span> sân nhỏ
                  </div>
                  <Button 
                    onClick={() => setSlotData({ ...slotData, venueId: venue.id })} 
                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition"
                  >
                    Tạo lịch (Slots)
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {venues.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              Bạn chưa có sân nào. Hãy tạo sân đầu tiên của bạn!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
