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
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import Link from 'next/link';
import { Settings, Plus, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await axiosClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
        if (statsRes.data && statsRes.data.data) {
          setStats(statsRes.data.data);
        } else {
          setStats({
            totalRevenue: 0,
            totalBookings: 0,
            activeUsers: 0,
            growth: '0%',
            totalVenues: 0
          });
        }

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

  const scatterData = heatmapData.flatMap((day, dIdx) => 
    ['17:00', '18:00', '19:00', '20:00'].map((time, tIdx) => ({
      day: day.name,
      time: time,
      value: day[time],
      dIdx,
      tIdx
    }))
  );

  const RectangleShape = (props: any) => {
    const { cx, cy, payload } = props;
    const value = payload.value;
    let bgColor = '#f1f5f9';
    if (value > 90) bgColor = '#2563eb';
    else if (value > 70) bgColor = '#60a5fa';
    else if (value > 50) bgColor = '#bfdbfe';
    
    const width = 60;
    const height = 30;
    
    return (
      <rect 
        x={cx - width / 2} 
        y={cy - height / 2} 
        width={width} 
        height={height} 
        fill={bgColor} 
        rx={4} 
        ry={4} 
      />
    );
  };

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Chủ Sân</h1>
          <p className="text-slate-500 mt-1">Tổng quan hoạt động kinh doanh của bạn</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/venues" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Quản lý Sân & Lịch
          </Link>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Heatmap Mật độ Đặt Sân (Recharts)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  dataKey="time" 
                  type="category" 
                  allowDuplicatedCategory={false} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis 
                  dataKey="day" 
                  type="category" 
                  allowDuplicatedCategory={false} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <ZAxis dataKey="value" range={[100, 100]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} lượt khách`, 'Lấp đầy']}
                />
                <Scatter data={scatterData} shape={<RectangleShape />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
            <span>Ít</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-[#f1f5f9]"></div>
              <div className="w-4 h-4 rounded bg-[#bfdbfe]"></div>
              <div className="w-4 h-4 rounded bg-[#60a5fa]"></div>
              <div className="w-4 h-4 rounded bg-[#2563eb]"></div>
            </div>
            <span>Nhiều</span>
          </div>
        </div>
      </div>
    </div>
  );
}
