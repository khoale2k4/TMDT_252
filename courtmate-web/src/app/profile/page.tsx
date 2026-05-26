'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip 
} from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { Loader, Trophy, Star, Target, Flame } from 'lucide-react';

export default function ProfilePage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          axiosClient.get(API_ENDPOINTS.USERS.STATS),
          axiosClient.get(API_ENDPOINTS.USERS.ACTIVITIES)
        ]);

        setStats(statsRes.data.data);
        
        // Map activities to react-activity-calendar format
        // { date: "YYYY-MM-DD", count: 1, level: 1-4 }
        const mappedActivities = activitiesRes.data.data.map((act: any) => {
          let level = 0;
          if (act.matches === 1) level = 1;
          else if (act.matches === 2) level = 2;
          else if (act.matches === 3) level = 3;
          else if (act.matches >= 4) level = 4;
          
          return {
            date: act.date,
            count: act.matches,
            level
          };
        });
        
        setActivities(mappedActivities);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
      <div className="mx-auto max-w-6xl">
        
        <div className="mb-8 flex items-end gap-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-sm">
            CM
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-bold text-slate-900">Nguyen Van A</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <Trophy className="h-3 w-3" /> ELO: {stats.elo_rating}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Level: {stats.level}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lọc 1: Radar Chart */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 lg:col-span-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Kỹ Năng Người Chơi</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radar_stats}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Skill"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
               {stats.milestones.map((m: string) => (
                 <span key={m} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                   <Star className="h-3 w-3" /> {m.replace('_', ' ')}
                 </span>
               ))}
            </div>
          </div>

          {/* Lọc 2: Activity Grid */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Hoạt Động Thể Thao</h2>
            <p className="text-sm text-slate-500 mb-6">Tổng số trận đã chơi: <span className="font-bold text-slate-900">{stats.total_matches}</span></p>
            
            <div className="overflow-x-auto pb-4">
              <ActivityCalendar 
                data={activities}
                theme={{
                  light: ['#f1f5f9', '#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8'],
                }}
                labels={{
                  legend: {
                    less: 'Ít',
                    more: 'Nhiều',
                  },
                  months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                  weekdays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                  totalCount: '{{count}} trận chơi trong năm',
                }}
              />
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
               <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Target className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Tỉ lệ thắng</h3>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">68%</p>
               </div>
               <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Flame className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Chuỗi ngày (Streak)</h3>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">4 ngày</p>
               </div>
               <div className="rounded-2xl bg-purple-50 p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Trophy className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Giải đấu tham gia</h3>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">2</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
