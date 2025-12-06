
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, User, Phone, Mail, MapPin, Wallet, Crown, Settings, RefreshCw, Save, X } from 'lucide-react';
import { Customer, CustomerRank } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  ranks?: CustomerRank[]; // New Prop
  onUpdateRanks?: (ranks: CustomerRank[]) => void; // New Prop
  onRecalculateSpending?: () => void; // New Prop
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);
const parseNumber = (str: string) => Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onAddCustomer, onEditCustomer, onDeleteCustomer, ranks = [], onUpdateRanks, onRecalculateSpending }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'LIST' | 'CONFIG'>('LIST');

  // --- CONFIG STATE ---
  const [editingRanks, setEditingRanks] = useState<CustomerRank[]>([]);

  React.useEffect(() => {
     if (ranks.length > 0) {
         setEditingRanks(ranks);
     } else {
         // Default if empty
         setEditingRanks([
             { id: '1', name: 'Kim Cương', minSpending: 20000000, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
             { id: '2', name: 'Vàng', minSpending: 10000000, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
             { id: '3', name: 'Bạc', minSpending: 2000000, color: 'bg-slate-100 text-slate-700 border-slate-200' }
         ]);
     }
  }, [ranks]);

  const getRank = (spending: number) => {
      // Sort ranks desc by minSpending
      const sortedRanks = [...editingRanks].sort((a, b) => b.minSpending - a.minSpending);
      for (const rank of sortedRanks) {
          if (spending >= rank.minSpending) {
              return rank;
          }
      }
      return { name: 'Thành viên', color: 'bg-slate-50 text-slate-500 border-slate-100' };
  };

  const handleUpdateRankItem = (index: number, field: keyof CustomerRank, value: any) => {
      const newRanks = [...editingRanks];
      newRanks[index] = { ...newRanks[index], [field]: value };
      setEditingRanks(newRanks);
  };

  const handleAddRank = () => {
      setEditingRanks([...editingRanks, { 
          id: `RANK-${Date.now()}`, 
          name: 'Hạng Mới', 
          minSpending: 0, 
          color: 'bg-slate-100 text-slate-700 border-slate-200' 
      }]);
  };

  const handleRemoveRank = (index: number) => {
      const newRanks = editingRanks.filter((_, i) => i !== index);
      setEditingRanks(newRanks);
  };

  const handleSaveConfig = () => {
      if (onUpdateRanks) onUpdateRanks(editingRanks);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <div className="flex border-b border-slate-100">
          <button 
             onClick={() => setActiveTab('LIST')}
             className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'LIST' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
              <User size={18} /> Danh sách khách hàng
          </button>
          <button 
             onClick={() => setActiveTab('CONFIG')}
             className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CONFIG' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
              <Settings size={18} /> Thiết lập hạng thành viên
          </button>
      </div>

      {activeTab === 'LIST' ? (
        <>
            <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
                <div className="flex items-center gap-3 flex-1 w-full max-w-lg">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                    type="text"
                    placeholder="Tìm tên, SĐT hoặc email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onRecalculateSpending}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-medium transition-all"
                        title="Tính lại tổng chi tiêu cho toàn bộ khách hàng"
                    >
                        <RefreshCw size={18} />
                        <span className="hidden sm:inline">Tính lại chi tiêu</span>
                    </button>
                    <button 
                        onClick={onAddCustomer}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Thêm khách hàng</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-0">
                {/* Desktop Table */}
                <div className="hidden sm:block">
                <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Họ và tên</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Liên hệ</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Hạng & Chi tiêu</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Địa chỉ</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => {
                            const rank = getRank(customer.totalSpending || 0);
                            return (
                        <tr key={customer.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 font-bold text-sm">
                                {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                <div className="font-medium text-slate-900">{customer.name}</div>
                                <div className="text-xs text-slate-400">{customer.code || customer.id}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" /> {customer.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" /> {customer.email || 'Chưa có email'}
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${rank.color}`}>
                                        <Crown size={10} /> {rank.name}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        <Wallet size={12} className="text-slate-400" />
                                        {formatCurrency(customer.totalSpending || 0)}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={customer.address}>
                            {customer.address}
                            </td>
                            <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                onClick={() => onEditCustomer(customer)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                <Edit size={18} />
                                </button>
                                <button 
                                onClick={() => onDeleteCustomer(customer.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                <Trash size={18} />
                                </button>
                            </div>
                            </td>
                        </tr>
                        )})
                    ) : (
                        <tr><td colSpan={5} className="text-center py-10 text-slate-400">Không tìm thấy khách hàng</td></tr>
                    )}
                    </tbody>
                </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                {filteredCustomers.map((customer) => {
                    const rank = getRank(customer.totalSpending || 0);
                    return (
                    <div key={customer.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                            <p className="text-xs text-slate-400">{customer.code}</p>
                        </div>
                        </div>
                        <div className="flex gap-1">
                        <button onClick={() => onEditCustomer(customer)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                        <button onClick={() => onDeleteCustomer(customer.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash size={18} /></button>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg mb-3 flex justify-between items-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${rank.color}`}>
                                <Crown size={10} /> {rank.name}
                        </span>
                        <span className="font-bold text-slate-700">{formatCurrency(customer.totalSpending || 0)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {customer.phone}</div>
                        <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {customer.email || '---'}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {customer.address || '---'}</div>
                    </div>
                    </div>
                )})}
                </div>
            </div>
        </>
      ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800">Cấu hình phân hạng</h3>
                          <p className="text-sm text-slate-500">Tự động phân hạng khách hàng dựa trên tổng chi tiêu.</p>
                      </div>
                      <button 
                        onClick={handleAddRank}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                          <Plus size={16} /> Thêm hạng
                      </button>
                  </div>

                  <div className="space-y-4">
                      {editingRanks.sort((a,b) => b.minSpending - a.minSpending).map((rank, index) => (
                          <div key={rank.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                               <div className="flex-1 w-full sm:w-auto">
                                   <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tên hạng</label>
                                   <input 
                                     type="text" 
                                     className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                                     value={rank.name}
                                     onChange={(e) => handleUpdateRankItem(index, 'name', e.target.value)}
                                   />
                               </div>
                               <div className="flex-1 w-full sm:w-auto">
                                   <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Chi tiêu tối thiểu</label>
                                   <input 
                                     type="text" 
                                     className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-medium text-slate-600 outline-none focus:border-blue-500"
                                     value={formatNumber(rank.minSpending)}
                                     onChange={(e) => handleUpdateRankItem(index, 'minSpending', parseNumber(e.target.value))}
                                   />
                               </div>
                               <div className="w-full sm:w-48">
                                   <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Màu sắc (Tailwind)</label>
                                   <select 
                                      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer ${rank.color}`}
                                      value={rank.color}
                                      onChange={(e) => handleUpdateRankItem(index, 'color', e.target.value)}
                                   >
                                       <option value="bg-slate-100 text-slate-700 border-slate-200">Xám (Mặc định)</option>
                                       <option value="bg-yellow-100 text-yellow-700 border-yellow-200">Vàng (Gold)</option>
                                       <option value="bg-cyan-100 text-cyan-700 border-cyan-200">Xanh Cyan (Diamond)</option>
                                       <option value="bg-blue-100 text-blue-700 border-blue-200">Xanh Dương</option>
                                       <option value="bg-purple-100 text-purple-700 border-purple-200">Tím</option>
                                       <option value="bg-rose-100 text-rose-700 border-rose-200">Đỏ</option>
                                       <option value="bg-emerald-100 text-emerald-700 border-emerald-200">Lục</option>
                                   </select>
                               </div>
                               <button 
                                 onClick={() => handleRemoveRank(index)}
                                 className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-4 sm:mt-0"
                               >
                                   <Trash size={18} />
                               </button>
                          </div>
                      ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                      <button 
                        onClick={handleSaveConfig}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2"
                      >
                          <Save size={18} /> Lưu cấu hình
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
