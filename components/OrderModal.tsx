
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Save, XCircle, CheckCircle, Camera, ShoppingBag, DollarSign, UserPlus, TicketPercent, Calculator, Package, Search } from 'lucide-react';
import { Order, OrderStatus, Product, OrderItem, Customer, Promotion } from '../types';
import { dataService } from '../services/dataService';
import { QRScanner } from './QRScanner';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  initialData?: Order | null;
  products: Product[];
  customers: Customer[];
  onQuickAddCustomer: () => void;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, initialData, products, customers, onQuickAddCustomer }) => {
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  
  // Promotion State
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>('');

  // Product Search inside Modal
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    // Load promotions when modal opens
    if (isOpen) {
        dataService.getPromotions().then(promos => {
            const valid = promos.filter(p => p.isActive); 
            setAvailablePromotions(valid);
        });
    }

    if (isOpen) {
      if (initialData) {
        setCustomerName(initialData.customerName);
        setStatus(initialData.status);
        setItems(initialData.items);
        setSelectedPromotionId(initialData.promotionId || '');
      } else {
        setCustomerName('');
        setStatus(OrderStatus.PENDING);
        setItems([]);
        setSelectedPromotionId('');
      }
      setProductSearchTerm('');
    }
    setShowScanner(false);
  }, [isOpen, initialData]);

  const handleAddItem = (product: Product) => {
    setItems(prev => {
        const existingIdx = prev.findIndex(i => i.productId === product.id);
        if (existingIdx >= 0) {
            const newItems = [...prev];
            newItems[existingIdx].quantity += 1;
            return newItems;
        }
        return [
            ...prev,
            { productId: product.id, productName: product.name, quantity: 1, price: product.price }
        ];
    });
    setProductSearchTerm('');
    setShowProductDropdown(false);
  };

  const handleScan = (code: string) => {
      const product = products.find(p => p.code === code);
      if (product) {
          handleAddItem(product);
          setShowScanner(false);
      } else {
          alert(`Không tìm thấy sản phẩm với mã: ${code}`);
          setShowScanner(false);
      }
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculate discount based on promotion
  const calculateDiscount = () => {
      if (!selectedPromotionId) return 0;
      const promo = availablePromotions.find(p => p.id === selectedPromotionId);
      if (!promo) return 0;
      
      const total = calculateTotal();
      
      if (promo.minOrderValue && total < promo.minOrderValue) return 0;
      
      const existingCustomer = customers.find(c => c.name === customerName);
      const spending = existingCustomer ? (existingCustomer.totalSpending || 0) : 0;
      if (promo.minCustomerSpending && spending < promo.minCustomerSpending) return 0;

      if (promo.type === 'DISCOUNT_AMOUNT') return promo.value;
      if (promo.type === 'DISCOUNT_PERCENT') return Math.round(total * (promo.value / 100));
      
      return 0;
  };

  const totalAmount = calculateTotal();
  const discount = calculateDiscount();
  const finalAmount = Math.max(0, totalAmount - discount);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
        alert("Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng.");
        return;
    }

    const existingCustomer = customers.find(c => c.name === customerName);
    
    const newOrder: Order = {
      id: initialData ? initialData.id : `ORD-${Date.now()}`,
      customerId: existingCustomer ? existingCustomer.id : (initialData ? initialData.customerId : `GUEST`),
      customerName: customerName || 'Khách lẻ',
      items,
      totalAmount,
      discountAmount: discount,
      finalAmount,
      promotionId: selectedPromotionId || undefined,
      status,
      date: initialData ? initialData.date : new Date().toISOString(),
    };
    onSave(newOrder);
    onClose();
  };

  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
      (p.code && p.code.toLowerCase().includes(productSearchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50/30 flex flex-col">
          <div className="p-6 space-y-6">
            {/* 1. Customer & Status Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Khách hàng</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
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
                            <option key={c.id} value={c.name}>{c.phone} - {c.rank || 'Member'}</option>
                        ))}
                        </datalist>
                    </div>
                    <button
                        type="button"
                        onClick={onQuickAddCustomer}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                        title="Thêm nhanh khách hàng"
                    >
                        <UserPlus size={20} />
                    </button>
                </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trạng thái đơn</label>
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

            {/* 2. Product Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                {/* Product Search Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                            placeholder="Nhập tên hoặc mã sản phẩm để thêm..."
                            value={productSearchTerm}
                            onChange={(e) => {
                                setProductSearchTerm(e.target.value);
                                setShowProductDropdown(true);
                            }}
                            onFocus={() => setShowProductDropdown(true)}
                        />
                        
                        {/* Dropdown Results */}
                        {showProductDropdown && productSearchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 animate-fade-in custom-scrollbar">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                        <div 
                                            key={p.id} 
                                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                                            onClick={() => handleAddItem(p)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-lg"/> : <Package size={16} className="text-slate-400"/>}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{p.code} • Tồn: {p.stock}</div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">{formatNumber(p.price)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-sm text-center text-slate-500">Không tìm thấy sản phẩm</div>
                                )}
                            </div>
                        )}
                        {showProductDropdown && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowProductDropdown(false)}></div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 text-sm font-bold shadow-md shadow-slate-500/20"
                    >
                        <Camera size={16} /> Quét mã
                    </button>
                </div>

                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                            <tr>
                                <th className="px-4 py-3 w-10">#</th>
                                <th className="px-4 py-3">Sản phẩm</th>
                                <th className="px-4 py-3 w-32 text-center">Đơn giá</th>
                                <th className="px-4 py-3 w-24 text-center">Số lượng</th>
                                <th className="px-4 py-3 w-32 text-right">Thành tiền</th>
                                <th className="px-4 py-3 w-12 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 text-center">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-800">{item.productName}</div>
                                            <div className="text-xs text-slate-400">{products.find(p => p.id === item.productId)?.code || '---'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="text" 
                                                className="w-full px-2 py-1 border border-slate-200 rounded text-center text-slate-600 focus:border-blue-500 outline-none"
                                                value={formatNumber(item.price)}
                                                onChange={(e) => handleUpdateItem(index, 'price', parseNumber(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <button type="button" onClick={() => handleUpdateItem(index, 'quantity', Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-l hover:bg-slate-200 text-slate-600">-</button>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    className="w-10 py-1 text-center border-y border-slate-200 focus:border-blue-500 outline-none font-bold"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                                                />
                                                <button type="button" onClick={() => handleUpdateItem(index, 'quantity', item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-r hover:bg-slate-200 text-slate-600">+</button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                                            {formatNumber(item.price * item.quantity)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <ShoppingBag size={48} className="mb-3 opacity-20" />
                                            <p className="font-medium">Chưa có sản phẩm nào</p>
                                            <p className="text-xs">Tìm kiếm hoặc quét mã để thêm</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Summary & Promotion */}
            {items.length > 0 && (
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Promotion Selector */}
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1.5">
                            <TicketPercent size={14}/> Khuyến mãi
                        </label>
                        <select 
                            className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500/20"
                            value={selectedPromotionId}
                            onChange={(e) => setSelectedPromotionId(e.target.value)}
                        >
                            <option value="">-- Không sử dụng --</option>
                            {availablePromotions.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.code} - {p.name} ({p.type === 'DISCOUNT_PERCENT' ? `-${p.value}%` : `-${formatNumber(p.value)}đ`})
                                </option>
                            ))}
                        </select>
                        {selectedPromotionId && discount === 0 && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <XCircle size={12} /> Đơn hàng chưa đủ điều kiện áp dụng.
                            </p>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="w-full sm:w-72 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Tổng tiền hàng</span>
                            <span className="font-bold text-slate-800">{formatNumber(totalAmount)} đ</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Giảm giá</span>
                            <span className={`font-medium ${discount > 0 ? 'text-green-600' : 'text-slate-700'}`}>
                                {discount > 0 ? `-${formatNumber(discount)}` : '0'} đ
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                            <span className="text-base font-bold text-slate-800">Khách phải trả</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {formatNumber(finalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            )}
          </div>
        </form>

        <div className="p-5 border-t border-slate-100 bg-white rounded-b-2xl grid grid-cols-2 gap-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={18} />
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {initialData ? <Save size={18} /> : <CheckCircle size={18} />}
            {initialData ? 'Lưu thay đổi' : 'Hoàn tất đơn hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};
