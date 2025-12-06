import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Calendar, FileText, User, X, Eye } from 'lucide-react';
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
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
};

export const InventoryHistory: React.FC<InventoryHistoryProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<InventoryLog | null>(null);

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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Biến động tồn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ngày giao dịch</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{log.productName}</div>
                    <div className="text-xs text-slate-400">{log.productId}</div>
                    {log.referenceDoc && (
                         <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                             <FileText size={10} /> {log.referenceDoc}
                         </div>
                    )}
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
                      {formatDate(log.date || log.timestamp).split(' ')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                          <Eye size={18} />
                      </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Chưa có lịch sử giao dịch</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={20} className="text-blue-600"/>
                          Chi tiết giao dịch
                      </h3>
                      <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm text-slate-500 mb-1">Sản phẩm</p>
                              <h4 className="text-lg font-bold text-slate-800">{selectedLog.productName}</h4>
                              <p className="text-xs text-slate-400 font-mono mt-1">{selectedLog.productId}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${selectedLog.type === 'IMPORT' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                              {selectedLog.type === 'IMPORT' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                              {selectedLog.type === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO'}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <div>
                               <p className="text-xs font-bold text-slate-500 uppercase mb-1">Số lượng</p>
                               <p className="text-xl font-bold text-slate-800">{selectedLog.quantity}</p>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-slate-500 uppercase mb-1">Đơn giá</p>
                               <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedLog.price || 0)}</p>
                           </div>
                           <div className="col-span-2 pt-2 border-t border-slate-200">
                               <p className="text-xs font-bold text-slate-500 uppercase mb-1">Tổng giá trị</p>
                               <p className="text-xl font-bold text-blue-600">{formatCurrency((selectedLog.price || 0) * selectedLog.quantity)}</p>
                           </div>
                      </div>

                      <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-2 border-b border-slate-50">
                              <span className="text-slate-500">Thời gian ghi nhận</span>
                              <span className="font-medium text-slate-700">{formatDate(selectedLog.timestamp)}</span>
                          </div>
                           <div className="flex justify-between py-2 border-b border-slate-50">
                              <span className="text-slate-500">Ngày chứng từ</span>
                              <span className="font-medium text-slate-700">{formatDate(selectedLog.date).split(' ')[0]}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-50">
                              <span className="text-slate-500">Chứng từ kèm theo</span>
                              <span className="font-medium text-slate-700">{selectedLog.referenceDoc || '---'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-50">
                              <span className="text-slate-500">Đối tác (NCC/Khách)</span>
                              <span className="font-medium text-slate-700">{selectedLog.supplier || '---'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-50">
                              <span className="text-slate-500">Tồn kho sau GD</span>
                              <span className="font-medium text-slate-700">{selectedLog.newStock}</span>
                          </div>
                      </div>

                      {selectedLog.note && (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-800">
                              <span className="font-bold block mb-1">Ghi chú:</span>
                              {selectedLog.note}
                          </div>
                      )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-colors">
                          Đóng
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};