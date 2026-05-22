'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, User, Trophy, Phone } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Các state khớp với Database
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Payload chuẩn bị gửi lên API Backend
    const payload = isLogin 
      ? { email, password } 
      : { email, password, full_name: fullName, phone };

    console.log("Dữ liệu gửi lên API:", payload);

    // Giả lập gọi API Backend (Vì backend chưa viết Route này)
    setTimeout(() => {
      localStorage.setItem('token', 'dev-token-123');
      router.push('/');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="flex w-full max-w-[900px] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 bg-white md:bg-transparent">
        
        {/* Nửa bên trái - Glassmorphism */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-10 relative text-white bg-black/30 backdrop-blur-md border-r border-white/10">
          <div className="relative z-10 flex flex-col items-center text-center mt-12">
            <div className="text-yellow-400 mb-4 drop-shadow-lg">
              <Trophy size={64} strokeWidth={1.5} />
            </div>
            <h1 className="text-[32px] font-bold mb-2 tracking-tight drop-shadow-md">Đặt Sân Thể Thao</h1>
            <p className="text-slate-100 text-[15px] drop-shadow">Hệ thống đặt sân trực tuyến hiện đại và tiện lợi</p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 mt-auto mb-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20 shadow-xl">
              <div className="text-xl font-bold">500+</div>
              <div className="text-[11px] text-slate-200 mt-1">Sân thể thao</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20 shadow-xl">
              <div className="text-xl font-bold">10K+</div>
              <div className="text-[11px] text-slate-200 mt-1">Lượt đặt/tháng</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20 shadow-xl">
              <div className="text-xl font-bold">4.9/5</div>
              <div className="text-[11px] text-slate-200 mt-1">Đánh giá TB</div>
            </div>
          </div>
        </div>

        {/* Nửa bên phải - Form màu trắng */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 relative bg-white flex flex-col justify-center">
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          <h2 className="text-[22px] font-bold text-slate-900 mb-6">
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text" required
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 pl-11 py-2.5 text-sm focus:border-[#2a7a62] focus:ring-[#2a7a62] outline-none transition"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="tel" required
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 pl-11 py-2.5 text-sm focus:border-[#2a7a62] focus:ring-[#2a7a62] outline-none transition"
                      placeholder="0901234567"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 pl-11 py-2.5 text-sm focus:border-[#2a7a62] focus:ring-[#2a7a62] outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 pl-11 py-2.5 text-sm focus:border-[#2a7a62] focus:ring-[#2a7a62] outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700 font-medium">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2a7a62] focus:ring-[#2a7a62] accent-[#2a7a62]" defaultChecked />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#" className="text-[13px] font-medium text-[#2a7a62] hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-[#2a7a62] hover:bg-[#20604d] transition-colors disabled:opacity-70 mt-6"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
