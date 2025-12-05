import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Package, DollarSign, FileText, Truck, Building2 } from 'lucide-react';
import { Product, InventoryType } from '../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, type: InventoryType, quantity: number, price: number, supplier: string, doc: string, note: string) => void;
  product: Product | null;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onConfirm, product }) => {
  const [type, setType] = useState<InventoryType>('IMPORT');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      // Khi mở, nếu là IMPORT -> Mặc định lấy giá vốn hiện tại
      // Nếu là EXPORT -> Mặc định lấy giá bán (hoặc giá vốn tùy chính sách, ở đây để 0)
      if (type === 'IMPORT') {
        setPrice(product.importPrice || 0);
      } else {
        setPrice(product.price); // Gợi ý giá bán
      }
      setQuantity(1);
      setSupplier('');
      setReferenceDoc('');
      setNote('');
    }
  }, [isOpen, product, type]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(product, type, quantity, price, supplier, referenceDoc, note);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            Điều chỉnh tồn kho
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 bg-blue-50/50 border-b border-blue-100">
           <p className="text-sm text-slate-500 mb-1">Sản phẩm:</p>
           <p className="font-semibold text-slate-800 text-lg">{product.name}</p>
           <div className="flex gap-4 mt-1 text-sm">
             <span className="text-slate-600">Tồn kho: <b className="text-slate-800">{product.stock}</b></span>
             <span className="text-slate-600">Giá vốn HT: <b className="text-slate-800">{formatCurrency(product.importPrice)}</b></span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Toggle Type */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('IMPORT')}
              className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                type === 'IMPORT' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <ArrowDownCircle size={24} className="mb-2" />
              <span className="font-semibold">Nhập hàng</span>
            </button>
            <button
              type="button"
              onClick={() => setType('EXPORT')}
              className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                type === 'EXPORT' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <ArrowUpCircle size={24} className="mb-2" />
              <span className="font-semibold">Xuất hàng</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {type === 'IMPORT' ? 'Đơn giá nhập (VNĐ)' : 'Đơn giá xuất (VNĐ)'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {type === 'IMPORT' ? 'Nhà cung cấp' : 'Người nhận / Khách hàng'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder={type === 'IMPORT' ? 'VD: Cty May Mặc ABC' : 'VD: Kho Chi Nhánh 1'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã chứng từ / HĐ</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={referenceDoc}
                  onChange={(e) => setReferenceDoc(e.target.value)}
                  placeholder="VD: INV-00123"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ghi chú (Tùy chọn)</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú chi tiết..."
            />
          </div>

          {/* Summary Preview */}
          <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center text-sm border border-slate-100">
             <span className="text-slate-500">Tổng giá trị:</span>
             <span className="font-bold text-slate-800 text-lg">{formatCurrency(price * quantity)}</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all active:scale-[0.98] ${
                type === 'IMPORT' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
              }`}
            >
              Xác nhận {type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};