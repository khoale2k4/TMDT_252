'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import Button from '@/components/Button';
import { Plus, Settings2, RefreshCw, Calendar, Clock, Activity, Tag, Info } from 'lucide-react';
import { toast } from 'react-toastify';

type PricingRuleResponse = {
  rule_id: string;
  rule_name: string;
  priority: number;
  is_active: boolean;
  conditions_summary: string;
  adjustment_summary: string;
  valid_from: string;
  valid_to: string;
};

const DAYS = [
  { id: 'monday', label: 'T2' },
  { id: 'tuesday', label: 'T3' },
  { id: 'wednesday', label: 'T4' },
  { id: 'thursday', label: 'T5' },
  { id: 'friday', label: 'T6' },
  { id: 'saturday', label: 'T7' },
  { id: 'sunday', label: 'CN' }
];

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [multiplier, setMultiplier] = useState(20); // 20%
  const [occupancyThreshold, setOccupancyThreshold] = useState(70);
  const [timeStart, setTimeStart] = useState('17');
  const [timeEnd, setTimeEnd] = useState('22');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(['saturday', 'sunday']);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('');

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN.PRICING_RULES.LIST);
      setRules(res.data.data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      toast.error('Lỗi tải danh sách quy tắc giá động.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleDay = (day: string) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (daysOfWeek.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ngày trong tuần!');
      return;
    }
    if (!validTo) {
      toast.error('Vui lòng chọn ngày kết thúc hiệu lực!');
      return;
    }

    try {
      // Build conditions list based on backend Java LogicConfig
      const ruleItems = [];
      
      // Occupancy rule
      if (occupancyThreshold > 0) {
        ruleItems.push({
          field: "occupancy_rate",
          operator: ">=",
          value: occupancyThreshold / 100.0
        });
      }

      // Hour of day rule
      ruleItems.push({
        field: "hour_of_day",
        operator: "BETWEEN",
        value: [parseInt(timeStart), parseInt(timeEnd)]
      });

      // Day of week rule
      ruleItems.push({
        field: "day_of_week",
        operator: "IN",
        value: daysOfWeek
      });

      // Payload specifically matching the B2B Service entity
      const newRule = {
        venue_id: "00000000-0000-0000-0000-000000000000", // Cần xử lý động lấy từ Auth Context nếu có nhiều Venue
        rule_name: ruleName,
        description,
        is_active: true,
        conditions: { 
          operator: "AND",
          rules: ruleItems
        },
        adjustments: { 
          type: "percentage",
          value: multiplier,
          cap_price: 0,
          floor_price: 0
        },
        valid_from: validFrom,
        valid_to: validTo
      };
      
      await axiosClient.post(API_ENDPOINTS.ADMIN.PRICING_RULES.CREATE, newRule);
      toast.success('Thêm quy tắc thành công!');
      setShowForm(false);
      // Reset form
      setRuleName(''); setDescription(''); setMultiplier(20); setOccupancyThreshold(70);
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Có lỗi xảy ra khi tạo quy tắc mới.');
    }
  };

  const handleRefreshActive = async () => {
    try {
      await axiosClient.put(API_ENDPOINTS.ADMIN.PRICING_RULES.REFRESH);
      toast.success('Đã làm mới quy tắc thành công!');
      fetchRules();
    } catch (error) {
      console.error('Error refreshing rules:', error);
      toast.error('Lỗi khi làm mới hệ thống.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dynamic Pricing Rules</h1>
          <p className="text-slate-500 mt-1">Cấu hình tự động thay đổi giá (AI Pricing) theo khung giờ và tỷ lệ lấp đầy sân.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleRefreshActive} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Làm mới hệ thống
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Thêm quy tắc mới
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-3">Tạo Quy Tắc Giá Động Mới</h2>
          <form onSubmit={handleCreateRule} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Quy Tắc</label>
                <input required type="text" value={ruleName} onChange={(e) => setRuleName(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500" placeholder="VD: Tăng giá giờ cao điểm cuối tuần" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả (Không bắt buộc)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500" placeholder="VD: Tăng 20% khi lấp đầy > 70% vào cuối tuần" />
              </div>

              {/* Box Điều kiện cơ bản */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Tag className="w-4 h-4 text-blue-600"/> Điều kiện Kích hoạt</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tỷ lệ lấp đầy sân (%)</label>
                  <input required type="number" value={occupancyThreshold} onChange={(e) => setOccupancyThreshold(parseInt(e.target.value))} className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500" placeholder="> 70%" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phần trăm giá tăng/giảm (%)</label>
                  <input required type="number" step="1" value={multiplier} onChange={(e) => setMultiplier(parseFloat(e.target.value))} className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500" placeholder="VD: 20 (Tăng 20%)" />
                  <p className="text-xs text-slate-500 mt-1">Nhập số âm nếu muốn giảm giá (VD: -10).</p>
                </div>
              </div>

              {/* Box Thời gian */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-600"/> Cấu hình Thời gian</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Từ giờ (0-23)</label>
                    <input required type="number" min="0" max="23" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Đến giờ (0-23)</label>
                    <input required type="number" min="0" max="23" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Hiệu lực Từ ngày</label>
                    <input required type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Đến ngày</label>
                    <input required type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Ngày áp dụng trong tuần</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button 
                        key={day.id} type="button" 
                        onClick={() => handleToggleDay(day.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${daysOfWeek.includes(day.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="px-6 py-2.5">Hủy</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 font-semibold">Lưu quy tắc</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 font-medium animate-pulse">Đang tải danh sách quy tắc...</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rules.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
              Chưa có quy tắc AI Pricing nào được thiết lập.
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.rule_id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-2">{rule.rule_name}</h3>
                  </div>
                  <span className={`px-2 py-1 flex-shrink-0 text-[10px] font-bold rounded-full uppercase tracking-wider ${rule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rule.is_active ? 'Active' : 'Off'}
                  </span>
                </div>
                
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start gap-2 text-slate-700 bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium leading-relaxed">{rule.conditions_summary || 'Chưa thiết lập điều kiện'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-medium">Hạn: {rule.valid_from} đến {rule.valid_to}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Biến động giá</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    {rule.adjustment_summary || '0đ'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
