'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import Button from '@/components/Button';
import { Plus, Settings2, RefreshCw } from 'lucide-react';

type PricingRule = {
  id?: string;
  rule_name: string;
  is_active: boolean;
  conditions: any;
  adjustments: any;
};

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [occupancyThreshold, setOccupancyThreshold] = useState(70);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN.PRICING_RULES.LIST);
      setRules(res.data.data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRule = {
        rule_name: ruleName,
        is_active: true,
        conditions: { occupancy_greater_than: occupancyThreshold },
        adjustments: { price_multiplier: multiplier },
      };
      await axiosClient.post(API_ENDPOINTS.ADMIN.PRICING_RULES.CREATE, newRule);
      setShowForm(false);
      setRuleName('');
      setMultiplier(1.0);
      setOccupancyThreshold(70);
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleRefreshActive = async () => {
    try {
      await axiosClient.put(API_ENDPOINTS.ADMIN.PRICING_RULES.REFRESH);
      alert('Đã làm mới quy tắc thành công!');
      fetchRules();
    } catch (error) {
      console.error('Error refreshing rules:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dynamic Pricing Rules</h1>
          <p className="text-slate-500 mt-1">Cấu hình tự động thay đổi giá theo khung giờ và tỷ lệ lấp đầy sân.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleRefreshActive} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Làm mới hệ thống
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Thêm quy tắc mới
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Tạo Quy Tắc Mới</h2>
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên Quy Tắc</label>
              <input
                required
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="VD: Tăng giá giờ cao điểm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hệ số giá (Multiplier)</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="1.2 = Tăng 20%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tỷ lệ lấp đầy (%)</label>
                <input
                  required
                  type="number"
                  value={occupancyThreshold}
                  onChange={(e) => setOccupancyThreshold(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="Kích hoạt khi lấp đầy > 70%"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
              <Button type="submit">Lưu quy tắc</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div>Đang tải danh sách...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.length === 0 ? (
            <p className="text-slate-500 col-span-full">Chưa có quy tắc nào được thiết lập.</p>
          ) : (
            rules.map((rule, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-900">{rule.rule_name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span>Điều kiện: Lấp đầy &gt; {rule.conditions?.occupancy_greater_than || 70}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <span>Hệ số giá: x{rule.adjustments?.price_multiplier || 1.0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
