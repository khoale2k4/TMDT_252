'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch KPI stats (Mocked or real)
        // const statsRes = await axiosClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
        // setStats(statsRes.data.data);
        
        // Mock stats since we might not have the API fully wired
        setStats({
          totalRevenue: 24500000,
          totalBookings: 142,
          activeUsers: 89,
          growth: '+12.5%'
        });

        // Mock heatmap data (Day of Week vs Time Slot)
        const mockHeatmap = [
          { name: 'Mon', '17:00': 80, '18:00': 100, '19:00': 90, '20:00': 60 },
          { name: 'Tue', '17:00': 70, '18:00': 95, '19:00': 85, '20:00': 50 },
          { name: 'Wed', '17:00': 60, '18:00': 85, '19:00': 80, '20:00': 55 },
          { name: 'Thu', '17:00': 75, '18:00': 100, '19:00': 95, '20:00': 65 },
          { name: 'Fri', '17:00': 85, '18:00': 100, '19:00': 100, '20:00': 80 },
          { name: 'Sat', '17:00': 90, '18:00': 100, '19:00': 100, '20:00': 90 },
          { name: 'Sun', '17:00': 85, '18:00': 95, '19:00': 90, '20:00': 75 },
        ];
        setHeatmapData(mockHeatmap);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(stats?.totalRevenue || 0)}</p>
          <p className="text-sm text-emerald-600 mt-2 font-medium">{stats?.growth} so với tuần trước</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Tổng lượt đặt sân</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalBookings}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Người dùng active</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.activeUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Biểu đồ lấp đầy sân (Peak Hours)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="17:00" stackId="a" fill="#93c5fd" radius={[0, 0, 4, 4]} />
                <Bar dataKey="18:00" stackId="a" fill="#60a5fa" />
                <Bar dataKey="19:00" stackId="a" fill="#3b82f6" />
                <Bar dataKey="20:00" stackId="a" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custom Heatmap Grid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Heatmap Mật độ Đặt Sân</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-slate-500 pb-3">Thứ</th>
                  <th className="font-medium text-slate-500 pb-3 text-center">17:00</th>
                  <th className="font-medium text-slate-500 pb-3 text-center">18:00</th>
                  <th className="font-medium text-slate-500 pb-3 text-center">19:00</th>
                  <th className="font-medium text-slate-500 pb-3 text-center">20:00</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {heatmapData.map((day) => (
                  <tr key={day.name}>
                    <td className="font-medium text-slate-700 py-2">{day.name}</td>
                    {['17:00', '18:00', '19:00', '20:00'].map((time) => {
                      const value = day[time];
                      let bgColor = 'bg-slate-100';
                      if (value > 90) bgColor = 'bg-blue-600';
                      else if (value > 70) bgColor = 'bg-blue-400';
                      else if (value > 50) bgColor = 'bg-blue-200';
                      
                      return (
                        <td key={time} className="p-1">
                          <div className={`h-8 w-full rounded-md ${bgColor} transition-colors hover:ring-2 hover:ring-slate-300`} title={`${value}%`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
            <span>Ít</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-slate-100"></div>
              <div className="w-4 h-4 rounded bg-blue-200"></div>
              <div className="w-4 h-4 rounded bg-blue-400"></div>
              <div className="w-4 h-4 rounded bg-blue-600"></div>
            </div>
            <span>Nhiều</span>
          </div>
        </div>
      </div>
    </div>
  );
}
