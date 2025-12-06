import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, User, Phone, Mail, Shield, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface UserListProps {
  users: UserType[];
  onAddUser: () => void;
  onEditUser: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onAddUser, onEditUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
        <div className="flex items-center gap-3 flex-1 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm nhân viên..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={onAddUser}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-0">
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Họ và tên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Liên hệ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-bold text-sm ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-400">Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       {user.role === 'ADMIN' ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                               <ShieldCheck size={14} /> Quản trị viên
                           </span>
                       ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
                               <User size={14} /> Nhân viên
                           </span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" /> {user.email}
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" /> {user.phone}
                            </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEditUser(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Không tìm thấy nhân viên</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};