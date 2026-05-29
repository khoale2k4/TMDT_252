'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Loader, XCircle, CalendarClock, Trash2, Edit2, ChevronDown, ChevronRight, Save, Image as ImageIcon } from 'lucide-react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import Button from '@/components/Button';
import { toast } from 'react-toastify';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Venue
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  
  // States cho Court
  const [expandedCourtId, setExpandedCourtId] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Forms
  const [venueForm, setVenueForm] = useState({ name: '', address: '', lat: 10.762622, lng: 106.660172, sport_types_str: 'badminton', amenities_str: 'wifi, parking', cover_image_url: '', courts: [{ name: 'Sân 1', sport_type: 'badminton' }] });
  const [editVenueForm, setEditVenueForm] = useState({ name: '', address: '', lat: 10.762622, lng: 106.660172, sport_types_str: '', amenities_str: '', cover_image_url: '' });
  const [courtForm, setCourtForm] = useState({ name: '', sport_type: 'badminton', venueId: '' });
  const [slotData, setSlotData] = useState({ venueId: '', date: new Date().toISOString().split('T')[0], start_hour: 8, end_hour: 22, price: 60000 });

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN.VENUES.LIST);
      setVenues(res.data.data || []);
    } catch (error) { toast.error('Lỗi khi tải danh sách sân'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVenues(); }, []);

  // VENUE HANDLERS
  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...venueForm,
        sport_types: venueForm.sport_types_str.split(',').map(s => s.trim()).filter(Boolean),
        amenities: venueForm.amenities_str.split(',').map(s => s.trim()).filter(Boolean)
      };
      await axiosClient.post(API_ENDPOINTS.ADMIN.VENUES.CREATE, payload);
      toast.success('Tạo cụm sân thành công!');
      setIsCreatingVenue(false);
      setVenueForm({ name: '', address: '', lat: 10.762622, lng: 106.660172, sport_types_str: 'badminton', amenities_str: 'wifi, parking', cover_image_url: '', courts: [{ name: 'Sân 1', sport_type: 'badminton' }] });
      fetchVenues();
    } catch (error) { toast.error('Lỗi khi tạo sân'); }
  };

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!editingVenueId) return;
    try {
      const payload = {
        ...editVenueForm,
        sport_types: editVenueForm.sport_types_str.split(',').map(s => s.trim()).filter(Boolean),
        amenities: editVenueForm.amenities_str.split(',').map(s => s.trim()).filter(Boolean)
      };
      await axiosClient.put(`${API_ENDPOINTS.ADMIN.VENUES.LIST}/${editingVenueId}`, payload);
      toast.success('Cập nhật cụm sân thành công!');
      setEditingVenueId(null);
      fetchVenues();
    } catch (error) { toast.error('Lỗi khi cập nhật sân'); }
  };

  const handleDeleteVenue = async (id: string) => {
    if(!confirm('Bạn có chắc chắn muốn xóa CỤM SÂN này? Tất cả dữ liệu Sân và Slot bên trong sẽ bị mất!')) return;
    try { await axiosClient.delete(`${API_ENDPOINTS.ADMIN.VENUES.LIST}/${id}`); toast.success('Xóa cụm sân thành công'); fetchVenues(); } catch (e) { toast.error('Lỗi khi xóa'); }
  };

  const openEditVenue = (venue: any) => {
    setEditVenueForm({
      name: venue.name || '',
      address: venue.address || '',
      lat: venue.lat || 10.762622,
      lng: venue.lng || 106.660172,
      sport_types_str: venue.sport_types?.join(', ') || '',
      amenities_str: venue.amenities?.join(', ') || '',
      cover_image_url: venue.cover_image_url || ''
    });
    setEditingVenueId(venue.id);
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const res = await axiosClient.post(`/admin/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess(res.data.data.url);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setLoading(false);
    }
  };

  // COURT HANDLERS
  const handleCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post(`${API_ENDPOINTS.ADMIN.VENUES.LIST}/${courtForm.venueId}/courts`, { name: courtForm.name, sport_type: courtForm.sport_type });
      toast.success('Thêm sân nhỏ thành công!');
      setCourtForm({ name: '', sport_type: 'badminton', venueId: '' });
      fetchVenues();
    } catch (error) { toast.error('Lỗi thêm sân'); }
  };
  const handleDeleteCourt = async (id: string) => {
    if(!confirm('Xóa SÂN NHỎ này sẽ xóa toàn bộ các ca thuê bên trong?')) return;
    try { await axiosClient.delete(`/admin/courts/${id}`); toast.success('Xóa sân nhỏ thành công'); fetchVenues(); } catch (e) { toast.error('Lỗi khi xóa'); }
  };

  // SLOT HANDLERS
  const fetchSlots = async (venueId: string, dateStr: string) => {
    try {
      setLoadingSlots(true);
      const res = await axiosClient.get(`${API_ENDPOINTS.ADMIN.VENUES.LIST}/${venueId}/slots?date=${dateStr}`);
      setSlots(res.data.data || []);
    } catch (error) { toast.error('Lỗi tải danh sách slots'); } finally { setLoadingSlots(false); }
  };
  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post(`${API_ENDPOINTS.ADMIN.VENUES.LIST}/${slotData.venueId}/slots`, {
        date: slotData.date, start_hour: Number(slotData.start_hour), end_hour: Number(slotData.end_hour), price: Number(slotData.price)
      });
      toast.success(`Đã tạo thành công ${res.data.data.count} slots!`);
      fetchSlots(slotData.venueId, slotData.date);
    } catch (error) { toast.error('Lỗi khi sinh slots'); }
  };
  const handleDeleteSlot = async (id: string, venueId: string, dateStr: string) => {
    if(!confirm('Xóa ca thuê này?')) return;
    try { await axiosClient.delete(`/admin/slots/${id}`); toast.success('Xóa thành công'); fetchSlots(venueId, dateStr); } catch (e) { toast.error('Lỗi xóa slot'); }
  };

  const handleUploadCourtImage = async (courtId: string, url: string) => {
    try {
      setLoading(true);
      await axiosClient.put(`/admin/courts/${courtId}`, { image_url: url });
      toast.success('Cập nhật ảnh sân nhỏ thành công!');
      fetchVenues();
    } catch (error) {
      toast.error('Lỗi khi cập nhật ảnh sân');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Hệ thống Sân</h1>
        <Button onClick={() => setIsCreatingVenue(!isCreatingVenue)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          {isCreatingVenue ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreatingVenue ? 'Hủy' : 'Tạo Cụm Sân (Venue)'}
        </Button>
      </div>

      {isCreatingVenue && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Cụm sân mới</h2>
          <form onSubmit={handleCreateVenue} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Tên cụm sân</label><input required className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Địa chỉ</label><input required className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.address} onChange={e => setVenueForm({...venueForm, address: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Vĩ độ (Latitude)</label><input type="number" step="any" className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.lat} onChange={e => setVenueForm({...venueForm, lat: Number(e.target.value)})} /></div>
              <div><label className="block text-sm font-medium mb-1">Kinh độ (Longitude)</label><input type="number" step="any" className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.lng} onChange={e => setVenueForm({...venueForm, lng: Number(e.target.value)})} /></div>
              <div><label className="block text-sm font-medium mb-1 text-slate-600">Loại thể thao (cách nhau dấu phẩy)</label><input required placeholder="VD: badminton, tennis" className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.sport_types_str} onChange={e => setVenueForm({...venueForm, sport_types_str: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1 text-slate-600">Tiện ích (cách nhau dấu phẩy)</label><input placeholder="VD: wifi, parking" className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.amenities_str} onChange={e => setVenueForm({...venueForm, amenities_str: e.target.value})} /></div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Ảnh Bìa</label>
                <div className="flex gap-2">
                  <input placeholder="https://..." className="flex-1 border rounded-lg p-2 outline-none focus:border-blue-500" value={venueForm.cover_image_url} onChange={e => setVenueForm({...venueForm, cover_image_url: e.target.value})} />
                  <label className="cursor-pointer whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition flex items-center justify-center">
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e, url => setVenueForm({...venueForm, cover_image_url: url}))} disabled={loading} />
                    <ImageIcon className="w-4 h-4 mr-1" /> Tải từ máy
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-2"><Button type="submit" className="bg-emerald-600 text-white px-6 py-2 font-semibold">Lưu Cụm Sân</Button></div>
          </form>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div> : (
        <div className="space-y-4">
          {venues.map(venue => (
            <div key={venue.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Venue Row or Edit Form */}
              {editingVenueId === venue.id ? (
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Edit2 className="w-4 h-4"/> Chỉnh sửa {venue.name}</h4>
                  <form onSubmit={handleUpdateVenue} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="block text-xs font-medium mb-1">Tên cụm sân</label><input required className="w-full border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.name} onChange={e => setEditVenueForm({...editVenueForm, name: e.target.value})} /></div>
                      <div><label className="block text-xs font-medium mb-1">Địa chỉ</label><input required className="w-full border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.address} onChange={e => setEditVenueForm({...editVenueForm, address: e.target.value})} /></div>
                      <div><label className="block text-xs font-medium mb-1">Vĩ độ</label><input type="number" step="any" className="w-full border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.lat} onChange={e => setEditVenueForm({...editVenueForm, lat: Number(e.target.value)})} /></div>
                      <div><label className="block text-xs font-medium mb-1">Kinh độ</label><input type="number" step="any" className="w-full border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.lng} onChange={e => setEditVenueForm({...editVenueForm, lng: Number(e.target.value)})} /></div>
                      <div><label className="block text-xs font-medium mb-1">Loại thể thao</label><input required className="w-full border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.sport_types_str} onChange={e => setEditVenueForm({...editVenueForm, sport_types_str: e.target.value})} /></div>
                      <div><label className="block text-xs font-medium mb-1">Tiện ích</label><input className="w-full border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.amenities_str} onChange={e => setEditVenueForm({...editVenueForm, amenities_str: e.target.value})} /></div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">Ảnh Bìa</label>
                        <div className="flex gap-2">
                          <input className="flex-1 border rounded p-1.5 text-sm outline-none focus:border-blue-500" value={editVenueForm.cover_image_url} onChange={e => setEditVenueForm({...editVenueForm, cover_image_url: e.target.value})} />
                          <label className="cursor-pointer whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded text-xs font-semibold hover:bg-blue-100 transition flex items-center justify-center">
                            <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e, url => setEditVenueForm({...editVenueForm, cover_image_url: url}))} disabled={loading} />
                            <ImageIcon className="w-3.5 h-3.5 mr-1" /> Tải ảnh
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="bg-emerald-600 text-white px-4 py-1.5 rounded text-sm font-semibold flex items-center gap-1"><Save className="w-4 h-4"/> Lưu thay đổi</Button>
                      <Button type="button" onClick={() => setEditingVenueId(null)} className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded text-sm font-semibold">Hủy</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpandedVenueId(expandedVenueId === venue.id ? null : venue.id)}
                >
                  <div className="flex items-center gap-4">
                    {expandedVenueId === venue.id ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
                    {venue.cover_image_url ? (
                      <img src={venue.cover_image_url} onError={e => e.currentTarget.src = "https://placehold.co/100x100/e2e8f0/334155?text=Venue"} alt={venue.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-400"/></div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{venue.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {venue.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-semibold hidden sm:inline-block">{venue.sport_types?.join(', ') || 'N/A'}</span>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md font-semibold">{venue.courts?.length || 0} Sân nhỏ</span>
                    <button onClick={(e) => { e.stopPropagation(); openEditVenue(venue); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition ml-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteVenue(venue.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              {/* Courts & Slots Area */}
              {expandedVenueId === venue.id && !editingVenueId && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700">Danh sách Sân Nhỏ (Courts)</h4>
                    {courtForm.venueId !== venue.id ? (
                      <Button onClick={() => setCourtForm({ ...courtForm, venueId: venue.id })} className="text-xs bg-white border border-slate-200 px-3 py-1.5 text-slate-700 rounded-md shadow-sm font-semibold hover:bg-slate-50">
                        + Thêm sân nhỏ
                      </Button>
                    ) : (
                      <form onSubmit={handleCreateCourt} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <input required placeholder="Tên sân" className="text-sm p-1.5 border rounded outline-none focus:border-blue-500" value={courtForm.name} onChange={e => setCourtForm({...courtForm, name: e.target.value})} />
                        <select className="text-sm p-1.5 border rounded outline-none focus:border-blue-500" value={courtForm.sport_type} onChange={e => setCourtForm({...courtForm, sport_type: e.target.value})}>
                          <option value="badminton">Cầu lông</option><option value="tennis">Tennis</option><option value="pickleball">Pickleball</option>
                        </select>
                        <Button type="submit" className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded font-semibold">Lưu</Button>
                        <Button type="button" onClick={() => setCourtForm({...courtForm, venueId: ''})} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded font-semibold">Hủy</Button>
                      </form>
                    )}
                  </div>

                  {venue.courts?.map((court: any) => (
                    <div key={court.id} className="mb-3 border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                      <div 
                        className="p-3 flex justify-between items-center bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition"
                        onClick={() => {
                          if (expandedCourtId === court.id) setExpandedCourtId(null);
                          else { setExpandedCourtId(court.id); fetchSlots(venue.id, slotData.date); }
                        }}
                      >
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          {expandedCourtId === court.id ? <ChevronDown className="w-4 h-4 text-slate-400"/> : <ChevronRight className="w-4 h-4 text-slate-400"/>}
                          
                          <label className="relative cursor-pointer group flex items-center justify-center w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0" onClick={e => e.stopPropagation()}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => uploadImage(e, url => handleUploadCourtImage(court.id, url))} 
                              disabled={loading}
                            />
                            {court.image_url ? (
                              <>
                                <img src={court.image_url} onError={e => e.currentTarget.src = "https://placehold.co/100x100/e2e8f0/334155?text=Court"} alt={court.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 className="w-3 h-3 text-white" />
                                </div>
                              </>
                            ) : (
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            )}
                          </label>

                          {court.name} <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">{court.sport_type}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCourt(court.id); }} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      {expandedCourtId === court.id && (
                        <div className="p-4 border-t border-slate-200">
                           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end mb-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                             <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">Ngày xem / sinh Slot</label>
                                <input type="date" className="text-sm p-2 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" value={slotData.date} onChange={e => { setSlotData({...slotData, date: e.target.value}); fetchSlots(venue.id, e.target.value); }} />
                             </div>
                             <form onSubmit={(e) => { setSlotData({...slotData, venueId: venue.id}); handleGenerateSlots(e); }} className="flex flex-wrap gap-3 items-end">
                                <div><label className="block text-xs font-medium text-slate-600 mb-1">Từ (h)</label><input type="number" className="w-16 text-sm p-2 border border-slate-200 rounded-lg outline-none" value={slotData.start_hour} onChange={e => setSlotData({...slotData, start_hour: Number(e.target.value)})} /></div>
                                <div><label className="block text-xs font-medium text-slate-600 mb-1">Đến (h)</label><input type="number" className="w-16 text-sm p-2 border border-slate-200 rounded-lg outline-none" value={slotData.end_hour} onChange={e => setSlotData({...slotData, end_hour: Number(e.target.value)})} /></div>
                                <div><label className="block text-xs font-medium text-slate-600 mb-1">Giá (VND)</label><input type="number" className="w-28 text-sm p-2 border border-slate-200 rounded-lg outline-none" value={slotData.price} onChange={e => setSlotData({...slotData, price: Number(e.target.value)})} /></div>
                                <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm h-[38px] flex items-center gap-1"><CalendarClock className="w-4 h-4"/>Sinh Slot Hàng Loạt</Button>
                             </form>
                           </div>

                           {loadingSlots ? <div className="py-4 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-400" /></div> : (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                               {slots.filter(s => s.court_id === court.id).map(slot => (
                                 <div key={slot.id} className="border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center relative group hover:border-blue-400 hover:shadow-sm transition bg-white">
                                   <button onClick={() => handleDeleteSlot(slot.id, venue.id, slotData.date)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-200"><XCircle className="w-4 h-4"/></button>
                                   <span className="text-sm font-bold text-slate-800">{slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}</span>
                                   <span className="text-xs text-emerald-600 font-bold mt-1">{slot.price.toLocaleString()}đ</span>
                                   <span className={`text-[10px] uppercase mt-1.5 px-2 py-0.5 rounded-full font-semibold ${slot.status === 'available' ? 'bg-emerald-50 text-emerald-600' : slot.status === 'booked' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{slot.status}</span>
                                 </div>
                               ))}
                               {slots.filter(s => s.court_id === court.id).length === 0 && <div className="col-span-full text-center text-sm text-slate-400 py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">Sân này chưa có khung giờ nào trong ngày {slotData.date}.</div>}
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!venue.courts || venue.courts.length === 0) && <div className="text-sm text-slate-500 py-4 text-center border-2 border-dashed border-slate-200 rounded-lg">Cụm sân này chưa có sân nhỏ nào. Hãy thêm sân mới!</div>}
                </div>
              )}
            </div>
          ))}
          {venues.length === 0 && <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">Chưa có dữ liệu sân. Nhấn "Tạo Cụm Sân" để bắt đầu kinh doanh!</div>}
        </div>
      )}
    </div>
  );
}
