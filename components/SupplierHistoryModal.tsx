
import React, { useMemo } from 'react';
import { X, Calendar, Package, FileText, ArrowDownCircle, Search } from 'lucide-react';
import { Supplier, InventoryLog } from '../types';

interface SupplierHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  logs: InventoryLog[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
};

export const SupplierHistoryModal: React.FC<SupplierHistoryModalProps> = ({ isOpen, onClose, supplier, logs }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const historyLogs = useMemo(() => {
    if (!supplier) return [];
    // Filter logs: Type must be IMPORT and supplier name must match
    return logs.filter(log => 
        log.type === 'IMPORT' && 
        log.supplier === supplier.name &&
        (log.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (log.referenceDoc && log.referenceDoc.toLowerCase().includes(searchTerm.toLowerCase())))
    ).sort((a, b) => new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime());
  }, [supplier, logs, searchTerm]);

  const stats = useMemo(() => {
      return {
          totalImports: historyLogs.length,
          totalQuantity: historyLogs.reduce((acc, log) => acc + log.quantity, 0),
          totalValue: historyLogs.reduce((acc, log) => acc + (log.quantity * (log.price || 0)), 0)
      };
  }, [historyLogs]);

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                   <ArrowDownCircle size={24} />
               </div>
               Lịch sử nhập hàng
             </h3>
             <div className="mt-2 text-slate-600">
                 Nhà cung cấp: <span className="font-bold text-blue-700">{supplier.name}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-slate-100">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Số lần nhập</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalImports}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalQuantity}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Tổng giá trị</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(stats.totalValue)}</p>
            </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-white border-b border-slate-50 flex items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Tìm theo tên sản phẩm hoặc mã chứng từ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-0">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-500 font-semibold uppercase sticky top-0 shadow-sm">
                    <tr>
                        <th className="px-6 py-3">Ngày nhập</th>
                        <th className="px-6 py-3">Chứng từ</th>
                        <th className="px-6 py-3">Sản phẩm</th>
                        <th className="px-6 py-3 text-right">Số lượng</th>
                        <th className="px-6 py-3 text-right">Đơn giá</th>
                        <th className="px-6 py-3 text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {historyLogs.length > 0 ? (
                        historyLogs.map(log => (
                            <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-3 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-400"/>
                                        {formatDate(log.date || log.timestamp)}
                                    </div>
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-700">
                                    {log.referenceDoc ? (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                            <FileText size={12} /> {log.referenceDoc}
                                        </span>
                                    ) : '---'}
                                </td>
                                <td className="px-6 py-3">
                                    <div className="font-bold text-slate-800">{log.productName}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <Package size={10} /> {log.productId}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right font-medium">{log.quantity}</td>
                                <td className="px-6 py-3 text-right text-slate-600">{formatCurrency(log.price || 0)}</td>
                                <td className="px-6 py-3 text-right font-bold text-blue-600">
                                    {formatCurrency((log.price || 0) * log.quantity)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                Không tìm thấy lịch sử nhập hàng nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
            <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors">
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};
