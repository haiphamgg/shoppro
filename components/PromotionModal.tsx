
import React, { useState, useEffect } from 'react';
import { X, Save, XCircle, TicketPercent, Calendar, Percent, DollarSign, Wallet } from 'lucide-react';
import { Promotion } from '../types';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: Promotion) => void;
  initialData?: Promotion | null;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'DISCOUNT_PERCENT' | 'DISCOUNT_AMOUNT'>('DISCOUNT_PERCENT');
  const [value, setValue] = useState<number>(0);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [minCustomerSpending, setMinCustomerSpending] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setType(initialData.type);
        setValue(initialData.value);
        setMinOrderValue(initialData.minOrderValue || 0);
        setMinCustomerSpending(initialData.minCustomerSpending || 0);
        setStartDate(initialData.startDate.split('T')[0]);
        setEndDate(initialData.endDate.split('T')[0]);
        setIsActive(initialData.isActive);
        setDescription(initialData.description || '');
      } else {
        setCode('');
        setName('');
        setType('DISCOUNT_PERCENT');
        setValue(0);
        setMinOrderValue(0);
        setMinCustomerSpending(0);
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setIsActive(true);
        setDescription('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: Promotion = {
      id: initialData ? initialData.id : `PROMO-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      type,
      value,
      minOrderValue,
      minCustomerSpending,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
      description
    };
    onSave(newPromo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TicketPercent size={20} className="text-blue-600" />
            {initialData ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã Code <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase font-mono font-bold"
                  value={code} onChange={(e) => setCode(e.target.value)} placeholder="SALE50" />
              </div>
              <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên chương trình <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  value={name} onChange={(e) => setName(e.target.value)} placeholder="Giảm giá mùa hè..." />
              </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
              <label className="block text-xs font-bold text-blue-800 uppercase">Giá trị giảm giá</label>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 flex-1">
                    <button type="button" onClick={() => setType('DISCOUNT_PERCENT')} 
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${type === 'DISCOUNT_PERCENT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                        Theo %
                    </button>
                    <button type="button" onClick={() => setType('DISCOUNT_AMOUNT')} 
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${type === 'DISCOUNT_AMOUNT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                        Số tiền
                    </button>
                 </div>
                 <div className="w-1/3 relative">
                     {type === 'DISCOUNT_PERCENT' ? <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> : <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                     <input type="number" required className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg focus:ring-2 outline-none font-bold text-blue-700"
                      value={value} onChange={(e) => setValue(Number(e.target.value))} />
                 </div>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Đơn tối thiểu</label>
              <div className="relative">
                 <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 outline-none"
                  value={formatNumber(minOrderValue)} onChange={(e) => setMinOrderValue(parseNumber(e.target.value))} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Khách đã chi tiêu &gt;</label>
              <div className="relative">
                 <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 outline-none"
                  value={formatNumber(minCustomerSpending)} onChange={(e) => setMinCustomerSpending(parseNumber(e.target.value))} placeholder="0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày bắt đầu</label>
              <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" required className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 outline-none"
                   value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày kết thúc</label>
              <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" required className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 outline-none"
                   value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span className="text-sm font-medium text-slate-700">Kích hoạt chương trình ngay</span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <XCircle size={18} />
              Hủy bỏ
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
              <Save size={18} />
              {initialData ? 'Lưu thay đổi' : 'Tạo chương trình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
