import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface AuthProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. HARDCODED DEMO ACCOUNTS
      if (email === 'admin@demo.com' && password === '123456') {
        await new Promise(r => setTimeout(r, 1000));
        onLoginSuccess('ADMIN');
        return;
      }
      
      if (email === 'staff@demo.com' && password === '123456') {
        await new Promise(r => setTimeout(r, 1000));
        onLoginSuccess('STAFF');
        return;
      }

      // 2. SUPABASE LOGIC
      if (!isSupabaseConfigured) {
        // Fallback for demo without Supabase configured
        await new Promise(r => setTimeout(r, 1000));
        onLoginSuccess('ADMIN');
        return;
      }

      const { data, error: authError } = mode === 'LOGIN' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authError) throw authError;

      if (mode === 'SIGNUP' && data.user && !data.session) {
        setError('Đăng ký thành công! Vui lòng kiểm tra email.');
        return;
      }

      if (data.user) {
        // Trong thực tế, role sẽ được lấy từ bảng profiles hoặc jwt claim
        // Tạm thời mặc định là ADMIN cho user mới
        onLoginSuccess('ADMIN');
      }
      
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm z-0"></div>
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">SalesPro System</h1>
            <p className="text-blue-100 text-sm">Quản lý bán hàng chuyên nghiệp</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="admin@demo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className={`p-3 text-sm rounded-lg flex items-center ${error.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                <span className="mr-2">{error.includes('thành công') ? '✅' : '⚠️'}</span> {error}
              </div>
            )}

            <div className="text-xs space-y-2">
               <div className="bg-blue-50 text-blue-800 p-2 rounded border border-blue-100">
                  <strong>Admin:</strong> admin@demo.com / 123456 <br/> (Full quyền)
               </div>
               <div className="bg-slate-50 text-slate-700 p-2 rounded border border-slate-200">
                  <strong>Nhân viên:</strong> staff@demo.com / 123456 <br/> (Bán hàng, không xem giá vốn)
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {mode === 'LOGIN' ? 'Đăng nhập' : 'Đăng ký ngay'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                setError(null);
              }}
              className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              {mode === 'LOGIN' 
                ? "Chưa có tài khoản? Đăng ký ngay" 
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};