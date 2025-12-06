import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Shield, Save, XCircle, Key, Lock, Check } from 'lucide-react';
import { User as UserType, UserRole, Permission } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserType) => void;
  initialData?: UserType | null;
}

const ALL_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'VIEW_DASHBOARD', label: 'Xem tổng quan' },
  { id: 'VIEW_ORDERS', label: 'Xem đơn hàng' },
  { id: 'MANAGE_ORDERS', label: 'Quản lý đơn hàng (Tạo/Sửa/Xóa)' },
  { id: 'VIEW_PRODUCTS', label: 'Xem sản phẩm' },
  { id: 'MANAGE_PRODUCTS', label: 'Quản lý sản phẩm (Tạo/Sửa/Xóa)' },
  { id: 'VIEW_INVENTORY', label: 'Xem lịch sử kho' },
  { id: 'MANAGE_INVENTORY', label: 'Nhập/Xuất kho' },
  { id: 'VIEW_CUSTOMERS', label: 'Xem khách hàng' },
  { id: 'VIEW_SUPPLIERS', label: 'Xem nhà cung cấp' },
  { id: 'VIEW_AI_ASSISTANT', label: 'Sử dụng AI' },
];

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [password, setPassword] = useState(''); 
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setEmail(initialData.email);
        setPhone(initialData.phone || '');
        setRole(initialData.role);
        setPermissions(initialData.permissions || []);
        setPassword('');
        setResetPasswordMode(false);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setRole('STAFF');
        // Default permissions for new staff
        setPermissions(['VIEW_DASHBOARD', 'VIEW_ORDERS', 'VIEW_PRODUCTS', 'VIEW_CUSTOMERS']);
        setPassword('');
        setResetPasswordMode(false);
      }
    }
  }, [isOpen, initialData]);

  const togglePermission = (perm: Permission) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleSelectAllPermissions = () => {
    if (permissions.length === ALL_PERMISSIONS.length) {
      setPermissions([]);
    } else {
      setPermissions(ALL_PERMISSIONS.map(p => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      id: initialData ? initialData.id : `U${Date.now()}`,
      name,
      email,
      phone,
      role,
      password: (password && (initialData ? resetPasswordMode : true)) ? password : undefined,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      permissions: role === 'ADMIN' ? [] : permissions // Admin implies all, but we save empty or ignored
    };
    onSave(newUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            {initialData ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">Thông tin cơ bản</h4>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                    <input type="text" required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên nhân viên" />
                </div>

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

                {/* Password Section */}
                {!initialData ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="password" required className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><Key size={14}/> Mật khẩu</label>
                            <button 
                                type="button" 
                                onClick={() => setResetPasswordMode(!resetPasswordMode)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            >
                                {resetPasswordMode ? 'Hủy đặt lại' : 'Đặt lại mật khẩu'}
                            </button>
                        </div>
                        {resetPasswordMode && (
                             <input type="password" required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                             value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu mới" autoFocus />
                        )}
                        {!resetPasswordMode && <div className="text-xs text-slate-400 italic">Mật khẩu đã được ẩn</div>}
                    </div>
                )}
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
                 <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">Phân quyền</h4>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Vai trò hệ thống</label>
                    <div className="flex gap-2 mb-4">
                        <button type="button" onClick={() => setRole('STAFF')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${role === 'STAFF' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                            Nhân viên
                        </button>
                        <button type="button" onClick={() => setRole('ADMIN')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${role === 'ADMIN' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                            Quản trị viên
                        </button>
                    </div>
                 </div>

                 {role === 'STAFF' && (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <div className="flex justify-between items-center mb-3">
                             <label className="text-xs font-bold text-slate-500 uppercase">Quyền hạn chi tiết</label>
                             <button type="button" onClick={handleSelectAllPermissions} className="text-xs text-blue-600 font-medium hover:underline">
                                 {permissions.length === ALL_PERMISSIONS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                             </button>
                         </div>
                         <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                             {ALL_PERMISSIONS.map((perm) => (
                                 <label key={perm.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${permissions.includes(perm.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                         {permissions.includes(perm.id) && <Check size={14} className="text-white" />}
                                     </div>
                                     <input 
                                         type="checkbox" 
                                         className="hidden" 
                                         checked={permissions.includes(perm.id)} 
                                         onChange={() => togglePermission(perm.id)} 
                                     />
                                     <span className={`text-sm ${permissions.includes(perm.id) ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{perm.label}</span>
                                 </label>
                             ))}
                         </div>
                     </div>
                 )}
                 
                 {role === 'ADMIN' && (
                     <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800 text-sm">
                         <Shield size={20} className="mb-2 text-indigo-600" />
                         <p><strong>Quản trị viên</strong> có toàn quyền truy cập hệ thống, bao gồm cài đặt và quản lý nhân sự.</p>
                     </div>
                 )}
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