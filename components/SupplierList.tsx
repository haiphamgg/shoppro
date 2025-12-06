
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, Truck, Phone, Mail, MapPin, AlertCircle, History } from 'lucide-react';
import { Supplier } from '../types';

interface SupplierListProps {
  suppliers: Supplier[];
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onViewHistory: (supplier: Supplier) => void; // New Prop
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onAddSupplier, onEditSupplier, onDeleteSupplier, onViewHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
        <div className="flex items-center gap-3 flex-1 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên NCC, SĐT hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={onAddSupplier}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span>Thêm Nhà cung cấp</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-0">
        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Tên Nhà cung cấp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Liên hệ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Công nợ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Địa chỉ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 font-bold text-sm">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{supplier.name}</div>
                          <div className="text-xs text-slate-400">{supplier.code || supplier.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {supplier.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" /> {supplier.email || 'Chưa có email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${supplier.debt > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                         {formatCurrency(supplier.debt || 0)}
                      </div>
                      {supplier.debt > 0 && (
                          <div className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                              <AlertCircle size={10} /> Cần thanh toán
                          </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={supplier.address}>
                      {supplier.address}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onViewHistory(supplier)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Xem lịch sử nhập hàng"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => onEditSupplier(supplier)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteSupplier(supplier.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa nhà cung cấp"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Không tìm thấy nhà cung cấp</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                     {supplier.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-800">{supplier.name}</h3>
                     <p className="text-xs text-slate-400">{supplier.code}</p>
                   </div>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => onViewHistory(supplier)} className="p-2 text-slate-400 hover:text-indigo-600"><History size={18} /></button>
                   <button onClick={() => onEditSupplier(supplier)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                   <button onClick={() => onDeleteSupplier(supplier.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash size={18} /></button>
                </div>
              </div>
              <div className="mb-3 p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Công nợ</span>
                  <span className={`font-bold ${supplier.debt > 0 ? 'text-red-600' : 'text-slate-700'}`}>{formatCurrency(supplier.debt || 0)}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {supplier.phone}</div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {supplier.email || '---'}</div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {supplier.address || '---'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
