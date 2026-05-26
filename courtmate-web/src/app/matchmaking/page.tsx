'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import API_ENDPOINTS from '@/services/apiEndpoints';
import Button from '@/components/Button';
import { Loader, Users, Zap, Clock, MapPin, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function MatchmakingPage() {
  const router = useRouter();
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchLobbies = async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.LOBBIES.LIST);
      setLobbies(res.data.data || []);
    } catch (error) {
      console.error('Error fetching lobbies:', error);
      toast.error('Failed to load matchmaking lobbies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    
    // Poll every 5 seconds for demo real-time sync
    const interval = setInterval(fetchLobbies, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (id: string, splitPrice: number) => {
    setJoiningId(id);
    try {
      await axiosClient.post(API_ENDPOINTS.LOBBIES.JOIN(id));
      toast.success(`Joined lobby! Pay ${splitPrice.toLocaleString('vi-VN')} VND to confirm.`);
      fetchLobbies();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join lobby');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateLobby = async () => {
    try {
      // Mock creating a lobby for demo
      const payload = {
        venue_id: "venue-demo-1",
        court_id: "court-demo-1",
        slot_id: "slot-demo-1",
        sport_type: "Pickleball",
        required_level: "Intermediate",
        target_players: 4,
        total_price: 400000
      };
      await axiosClient.post(API_ENDPOINTS.LOBBIES.CREATE, payload);
      toast.success("Lobby created successfully!");
      fetchLobbies();
    } catch (error) {
      toast.error("Failed to create lobby");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Zap className="h-8 w-8 text-amber-500" />
              Matchmaking
            </h1>
            <p className="text-slate-500 mt-2">Tìm kiếm đồng đội và đối thủ phù hợp với trình độ của bạn.</p>
          </div>
          <Button onClick={handleCreateLobby} className="rounded-2xl px-6">
            Tạo phòng mới
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : lobbies.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Không có phòng chờ nào</h3>
            <p className="text-slate-500 mt-2">Hãy tạo phòng mới hoặc quay lại sau nhé.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {lobbies.map((lobby) => (
              <div key={lobby.id} className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] border border-slate-200 transition hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {lobby.sport_type}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">Sân Pickleball A</h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-emerald-600">
                      {lobby.split_price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs font-medium text-slate-500">/ người</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>CourtMate Quận 10</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Hôm nay • 18:00 - 19:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Target className="h-4 w-4 text-slate-400" />
                    <span>Trình độ: <strong className="text-slate-900">{lobby.required_level}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-3">
                       {/* Mock avatars based on current_players */}
                       {Array.from({length: lobby.current_players}).map((_, i) => (
                         <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                       ))}
                       {Array.from({length: lobby.target_players - lobby.current_players}).map((_, i) => (
                         <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-400 border-dashed">
                           +
                         </div>
                       ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-600">
                      {lobby.current_players} / {lobby.target_players}
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleJoin(lobby.id, lobby.split_price)} 
                    disabled={joiningId === lobby.id}
                    className="rounded-xl px-5 py-2 shadow-md shadow-blue-200"
                  >
                    {joiningId === lobby.id ? 'Joining...' : 'Tham gia'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
