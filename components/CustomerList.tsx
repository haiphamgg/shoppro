import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, User, Phone, Mail, MapPin } from 'lucide-react';
import { Customer } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onAddCustomer, onEditCustomer, onDeleteCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
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
        <button 
          onClick={onAddCustomer}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-0">
        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Họ và tên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Liên hệ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Địa chỉ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{customer.name}</div>
                          <div className="text-xs text-slate-400">{customer.id}</div>
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
                ))
              ) : (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Không tìm thấy khách hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                     {customer.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                     <p className="text-xs text-slate-400">{customer.id}</p>
                   </div>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => onEditCustomer(customer)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                   <button onClick={() => onDeleteCustomer(customer.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash size={18} /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {customer.phone}</div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {customer.email || '---'}</div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {customer.address || '---'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};