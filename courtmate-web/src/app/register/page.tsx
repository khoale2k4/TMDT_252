'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import Button from '@/components/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Giả lập gọi API đăng ký
    setTimeout(() => {
      router.push('/login');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tạo tài khoản</h2>
        <p className="mt-2 text-sm text-slate-600">
          Đã có tài khoản? <Link href="/login" className="font-medium text-blue-600 hover:underline">Đăng nhập ngay</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 shadow rounded-lg">
        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="text" required className="block w-full rounded-md border border-slate-300 pl-10 py-2 focus:border-blue-500" placeholder="Nguyễn Văn A" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="email" required className="block w-full rounded-md border border-slate-300 pl-10 py-2 focus:border-blue-500" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="password" required className="block w-full rounded-md border border-slate-300 pl-10 py-2 focus:border-blue-500" placeholder="••••••••" />
            </div>
          </div>
          <Button type="submit" className="w-full justify-center" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng ký'}
          </Button>
        </form>
      </div>
    </div>
  );
}
