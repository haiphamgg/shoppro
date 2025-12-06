
import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Wallet } from 'lucide-react';
import { Supplier } from '../types';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  supplier: Supplier | null;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({ isOpen, onClose, onConfirm, supplier }) => {
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (isOpen && supplier) {
      setAmount(0);
    }
  }, [isOpen, supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
        alert('Vui lòng nhập số tiền hợp lệ');
        return;
    }
    if (supplier && amount > supplier.debt) {
        alert('Số tiền thanh toán không thể lớn hơn số nợ hiện tại');
        return;
    }
    onConfirm(amount);
    onClose();
  };

  const handleSetFull = () => {
      if (supplier) setAmount(supplier.debt);
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={20} className="text-blue-600" />
            Thanh toán công nợ
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Nhà cung cấp</div>
              <div className="font-bold text-slate-800">{supplier.name}</div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                  <span className="text-sm text-slate-600">Nợ hiện tại:</span>
                  <span className="font-bold text-red-600">{formatNumber(supplier.debt)} ₫</span>
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số tiền thanh toán</label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    required 
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-blue-700"
                    value={formatNumber(amount)} 
                    onChange={(e) => setAmount(parseNumber(e.target.value))} 
                    placeholder="0"
                    autoFocus
                />
            </div>
            <button 
                type="button" 
                onClick={handleSetFull}
                className="text-xs text-blue-600 font-medium mt-1.5 hover:underline"
            >
                Thanh toán toàn bộ
            </button>
          </div>

          <div className="pt-2">
            <button 
                type="submit" 
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Xác nhận thanh toán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
