import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Save, XCircle, CheckCircle, Camera, ShoppingBag, DollarSign } from 'lucide-react';
import { Order, OrderStatus, Product, OrderItem, Customer } from '../types';
import { QRScanner } from './QRScanner';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  initialData?: Order | null;
  products: Product[];
  customers: Customer[];
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, initialData, products, customers }) => {
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCustomerName(initialData.customerName);
        setStatus(initialData.status);
        setItems(initialData.items);
      } else {
        setCustomerName('');
        setStatus(OrderStatus.PENDING);
        setItems([]);
      }
    }
    setShowScanner(false);
  }, [isOpen, initialData]);

  const handleAddItem = (product?: Product) => {
    const prodToAdd = product || (products.length > 0 ? products[0] : null);
    if (!prodToAdd) return;

    setItems(prev => {
        // Check if exists, just inc quantity
        const existingIdx = prev.findIndex(i => i.productId === prodToAdd.id);
        if (existingIdx >= 0) {
            const newItems = [...prev];
            newItems[existingIdx].quantity += 1;
            return newItems;
        }
        return [
            ...prev,
            { productId: prodToAdd.id, productName: prodToAdd.name, quantity: 1, price: prodToAdd.price }
        ];
    });
  };

  const handleScan = (code: string) => {
      const product = products.find(p => p.code === code);
      if (product) {
          handleAddItem(product);
          // Optional: Beep sound or toast
          setShowScanner(false);
      } else {
          alert(`Không tìm thấy sản phẩm với mã: ${code}`);
          setShowScanner(false);
      }
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index] = { ...newItems[index], productId: product.id, productName: product.name, price: product.price };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingCustomer = customers.find(c => c.name === customerName);
    
    const newOrder: Order = {
      id: initialData ? initialData.id : `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      customerId: existingCustomer ? existingCustomer.id : (initialData ? initialData.customerId : `GUEST-${Date.now()}`),
      customerName,
      items,
      totalAmount: calculateTotal(),
      status,
      date: initialData ? initialData.date : new Date().toISOString(),
    };
    onSave(newOrder);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                 <ShoppingBag size={20} />
            </div>
            {initialData ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Khách hàng</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  list="customer-list-order"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  value={customerName}
                  onChange={handleCustomerSelect}
                  placeholder="Tìm hoặc nhập tên khách hàng"
                />
                <datalist id="customer-list-order">
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.phone}</option>
                  ))}
                </datalist>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none font-medium bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {Object.values(OrderStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-700">Chi tiết sản phẩm</label>
              <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-md shadow-slate-500/20"
                >
                    <Camera size={14} /> Quét QR
                </button>
                <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                    <Plus size={14} /> Thêm SP
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center text-slate-400">
                  <ShoppingBag size={48} className="mb-3 opacity-20" />
                  <p className="font-medium">Chưa có sản phẩm nào</p>
                  <p className="text-xs">Nhấn "Thêm SP" hoặc "Quét QR" để bắt đầu</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] text-slate-500 mb-1 block uppercase font-bold">Sản phẩm</label>
                      <select
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium"
                        value={item.productId}
                        onChange={(e) => handleUpdateItem(index, 'productId', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.model ? `(${p.model})` : ''} - Tồn: {p.stock}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="w-24">
                        <label className="text-[10px] text-slate-500 mb-1 block uppercase font-bold">Số lượng</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-center font-bold"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                        />
                        </div>
                        <div className="w-32">
                             <label className="text-[10px] text-slate-500 mb-1 block uppercase font-bold text-right">Thành tiền</label>
                             <div className="h-[42px] flex items-center justify-end font-bold text-blue-600 bg-white border border-slate-200 rounded-lg px-3">
                                {(item.price * item.quantity).toLocaleString()}đ
                             </div>
                        </div>
                        <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="w-[42px] h-[42px] flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                        <Trash2 size={20} />
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {items.length > 0 && (
             <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                <span className="text-lg font-bold text-slate-700">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                    {calculateTotal().toLocaleString()} <span className="text-sm text-slate-500 font-normal">VNĐ</span>
                </span>
            </div>
          )}
        </form>

        <div className="p-5 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <XCircle size={18} />
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
          >
            {initialData ? <Save size={18} /> : <CheckCircle size={18} />}
            {initialData ? 'Lưu thay đổi' : 'Hoàn tất đơn hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};