
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, TicketPercent, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Promotion } from '../types';

interface PromotionListProps {
  promotions: Promotion[];
  onAddPromotion: () => void;
  onEditPromotion: (promo: Promotion) => void;
  onDeletePromotion: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

export const PromotionList: React.FC<PromotionListProps> = ({ promotions, onAddPromotion, onEditPromotion, onDeletePromotion }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPromotions = promotions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
        <div className="flex items-center gap-3 flex-1 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã khuyến mãi..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={onAddPromotion}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span>Tạo khuyến mãi</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-0">
        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Chương trình</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Giảm giá</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Điều kiện</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Thời gian</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 mr-3">
                          <TicketPercent size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{promo.name}</div>
                          <div className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 inline-block">{promo.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg text-blue-600">
                        {promo.type === 'DISCOUNT_PERCENT' ? `${promo.value}%` : formatCurrency(promo.value)}
                      </div>
                      <div className="text-xs text-slate-500">Giảm trực tiếp</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        {promo.minOrderValue && <div>Đơn từ: {formatCurrency(promo.minOrderValue)}</div>}
                        {promo.minCustomerSpending && <div className="text-xs text-slate-500 mt-1">Khách chi tiêu &gt; {formatCurrency(promo.minCustomerSpending)}</div>}
                        {!promo.minOrderValue && !promo.minCustomerSpending && <span className="text-slate-400 italic">Không có</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {promo.isActive ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                               <CheckCircle size={10} /> Đang chạy
                           </span>
                       ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
                               <XCircle size={10} /> Tạm dừng
                           </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEditPromotion(promo)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => onDeletePromotion(promo.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Chưa có chương trình khuyến mãi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
