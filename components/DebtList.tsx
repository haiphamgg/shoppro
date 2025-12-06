
import React, { useState } from 'react';
import { Search, DollarSign, ArrowUpRight, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Supplier } from '../types';

interface DebtListProps {
  suppliers: Supplier[];
  onPayDebt: (supplier: Supplier) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const DebtList: React.FC<DebtListProps> = ({ suppliers, onPayDebt }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter suppliers with debt or history
  const filteredSuppliers = suppliers.filter(s => 
    (s.debt > 0 || (s.totalPurchased || 0) > 0) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm))
  ).sort((a, b) => b.debt - a.debt); // Sort by debt descending

  const totalDebt = filteredSuppliers.reduce((sum, s) => sum + s.debt, 0);
  const totalPurchased = filteredSuppliers.reduce((sum, s) => sum + (s.totalPurchased || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
        {/* Header Statistics */}
        <div className="p-6 border-b border-slate-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white z-10">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-red-700 uppercase opacity-70">Tổng nợ phải trả</p>
                    <h3 className="text-2xl font-bold text-red-700">{formatCurrency(totalDebt)}</h3>
                </div>
                <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center text-red-600">
                    <TrendingDown size={20} />
                </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-blue-700 uppercase opacity-70">Tổng tiền đã nhập</p>
                    <h3 className="text-2xl font-bold text-blue-700">{formatCurrency(totalPurchased)}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-600">
                    <ArrowUpRight size={20} />
                </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Tìm NCC..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm h-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
            <table className="w-full">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Nhà cung cấp</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Liên hệ</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Tổng nhập</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Đã thanh toán</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Còn nợ</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => {
                            const paid = (supplier.totalPurchased || 0) - supplier.debt;
                            return (
                                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{supplier.name}</div>
                                        <div className="text-xs text-slate-400">{supplier.code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div>{supplier.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {formatCurrency(supplier.totalPurchased || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-600 font-medium">
                                        {formatCurrency(paid)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`font-bold ${supplier.debt > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                            {formatCurrency(supplier.debt)}
                                        </div>
                                        {supplier.debt > 0 && (
                                            <div className="text-[10px] text-red-500 flex items-center justify-end gap-1 mt-0.5">
                                                <AlertCircle size={10} /> Chưa trả hết
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {supplier.debt > 0 ? (
                                            <button 
                                                onClick={() => onPayDebt(supplier)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 flex items-center gap-1 ml-auto"
                                            >
                                                <DollarSign size={12} /> Thanh toán
                                            </button>
                                        ) : (
                                            <span className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                                                <CheckCircle size={12} /> Hoàn tất
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-400">Không có dữ liệu công nợ</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};
