import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Calendar, FileText, User } from 'lucide-react';
import { InventoryLog } from '../types';

interface InventoryHistoryProps {
  logs: InventoryLog[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

export const InventoryHistory: React.FC<InventoryHistoryProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <div className="p-5 border-b border-slate-50 bg-white z-10">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Lịch sử Nhập/Xuất kho</h2>
        <p className="text-sm text-slate-500">Theo dõi chi tiết các giao dịch kho hàng</p>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Loại giao dịch</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Chi tiết SL/Giá</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Chứng từ/NCC</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Biến động tồn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ngày giao dịch</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{log.productName}</div>
                    <div className="text-xs text-slate-400">{log.productId}</div>
                    {log.note && <div className="text-xs text-slate-500 italic mt-1 truncate max-w-[150px]">{log.note}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {log.type === 'IMPORT' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <ArrowDownCircle size={12} /> Nhập kho
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <ArrowUpCircle size={12} /> Xuất kho
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-700">SL: {log.quantity}</div>
                    <div className="text-xs text-slate-500 mt-1">
                       Giá: {log.price ? formatCurrency(log.price) : '0 ₫'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {log.referenceDoc && (
                       <div className="flex items-center gap-1 text-slate-700 font-medium mb-0.5">
                          <FileText size={12} className="text-slate-400" /> {log.referenceDoc}
                       </div>
                    )}
                    {log.supplier && (
                       <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <User size={12} className="text-slate-400" /> {log.supplier}
                       </div>
                    )}
                    {!log.referenceDoc && !log.supplier && <span className="text-slate-400 italic">--</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{log.oldStock}</span>
                      <span className="text-slate-300">→</span>
                      <span className="font-medium text-slate-800">{log.newStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(log.date || log.timestamp)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Chưa có lịch sử giao dịch</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};