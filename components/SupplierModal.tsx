
import React, { useState, useEffect } from 'react';
import { X, Truck, Phone, Mail, MapPin, Save, XCircle, Hash, DollarSign } from 'lucide-react';
import { Supplier } from '../types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  initialData?: Supplier | null;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

export const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [debt, setDebt] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setEmail(initialData.email || '');
        setPhone(initialData.phone);
        setAddress(initialData.address);
        setDebt(initialData.debt || 0);
      } else {
        setCode('');
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setDebt(0);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: initialData ? initialData.id : `S${Date.now()}`,
      code: code || `NCC${Math.floor(Date.now() / 1000)}`,
      name,
      email: email || '', 
      phone,
      address: address || '',
      debt
    };
    onSave(newSupplier);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck size={20} className="text-blue-600" />
            {initialData ? 'Cập nhật NCC' : 'Thêm Nhà cung cấp'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex gap-4">
             <div className="w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã NCC</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                    value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Tự động" />
                </div>
             </div>
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên Nhà cung cấp <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={name} onChange={(e) => setName(e.target.value)} placeholder="Công ty TNHH..." />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="tel" required className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com" />
              </div>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Công nợ hiện tại</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-red-600"
                  value={formatNumber(debt)} 
                  onChange={(e) => setDebt(parseNumber(e.target.value))} 
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">*Điều chỉnh thủ công khi thanh toán hoặc nhập hàng nợ</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea rows={2} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nhập địa chỉ..." />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <XCircle size={18} />
              Hủy bỏ
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
              <Save size={18} />
              {initialData ? 'Lưu thay đổi' : 'Tạo NCC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
