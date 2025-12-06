import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Save, XCircle, CheckCircle, Camera } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            {initialData ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  list="customer-list-order"
                  required
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {Object.values(OrderStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Chi tiết đơn hàng</label>
              <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                    <Camera size={16} /> Quét QR
                </button>
                <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-2 py-1.5"
                >
                    <Plus size={16} /> Thêm sản phẩm
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
                  Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" hoặc "Quét QR".
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 mb-1 block uppercase font-semibold">Sản phẩm</label>
                      <select
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none bg-white"
                        value={item.productId}
                        onChange={(e) => handleUpdateItem(index, 'productId', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] text-gray-500 mb-1 block uppercase font-semibold">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="w-32 text-right pb-2 font-medium text-sm text-gray-700">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors mb-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-800">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-blue-600">{calculateTotal().toLocaleString()}đ</span>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <XCircle size={18} />
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
          >
            {initialData ? <Save size={18} /> : <CheckCircle size={18} />}
            {initialData ? 'Lưu đơn hàng' : 'Hoàn tất đơn hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};