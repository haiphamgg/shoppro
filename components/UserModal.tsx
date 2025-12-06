import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Shield, Save, XCircle } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserType) => void;
  initialData?: UserType | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [password, setPassword] = useState(''); // Only used for creating new "local" users

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setEmail(initialData.email);
        setPhone(initialData.phone || '');
        setRole(initialData.role);
        setPassword('');
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setRole('STAFF');
        setPassword('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      id: initialData ? initialData.id : `U${Date.now()}`,
      name,
      email,
      phone,
      role,
      password: initialData ? undefined : password, // In real app, password handled by auth service
      createdAt: initialData ? initialData.createdAt : new Date().toISOString()
    };
    onSave(newUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            {initialData ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
            <input type="text" required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên nhân viên" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" required className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!initialData} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="tel" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {!initialData && (
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu khởi tạo</label>
                <input type="password" required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
             </div>
          )}

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Phân quyền</label>
             <div className="grid grid-cols-2 gap-3">
                 <div onClick={() => setRole('STAFF')} className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${role === 'STAFF' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'STAFF' ? 'border-blue-500' : 'border-slate-400'}`}>
                        {role === 'STAFF' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                     </div>
                     <div>
                         <div className="text-sm font-bold text-slate-800">Nhân viên</div>
                         <div className="text-xs text-slate-500">Quyền bán hàng cơ bản</div>
                     </div>
                 </div>
                 <div onClick={() => setRole('ADMIN')} className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${role === 'ADMIN' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'ADMIN' ? 'border-indigo-500' : 'border-slate-400'}`}>
                        {role === 'ADMIN' && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                     </div>
                     <div>
                         <div className="text-sm font-bold text-slate-800">Quản trị viên</div>
                         <div className="text-xs text-slate-500">Toàn quyền hệ thống</div>
                     </div>
                 </div>
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <XCircle size={18} />
              Hủy bỏ
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
              <Save size={18} />
              {initialData ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};