import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Package, DollarSign, FileText, Truck, User, Plus, Trash2, Search, CheckCircle, AlertTriangle, Camera, Calendar } from 'lucide-react';
import { Product, InventoryType, Customer, Supplier } from '../types';
import { QRScanner } from './QRScanner';

interface InventoryItem {
  product: Product;
  quantity: number;
  price: number;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: { product: Product, quantity: number, price: number }[], type: InventoryType, supplier: string, doc: string, note: string, date: string) => void;
  initialProduct: Product | null;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onConfirm, initialProduct, products, customers, suppliers }) => {
  const [type, setType] = useState<InventoryType>('IMPORT');
  const [cart, setCart] = useState<InventoryItem[]>([]);
  const [supplier, setSupplier] = useState('');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  
  // Search state for adding items
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSupplier('');
      setReferenceDoc('');
      setNote('');
      setCart([]);
      setDate(new Date().toISOString().split('T')[0]); // Default to today
      setShowScanner(false);
      
      if (initialProduct) {
        addToCart(initialProduct, type === 'IMPORT' ? (initialProduct.importPrice || 0) : initialProduct.price);
      }
    }
  }, [isOpen, initialProduct]);

  const addToCart = (product: Product, defaultPrice: number) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
          // If exist, increment
          return prev.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prev, { product, quantity: 1, price: defaultPrice }];
    });
    setSearchTerm('');
    setShowProductSearch(false);
  };

  const handleScan = (code: string) => {
      const product = products.find(p => p.code === code);
      if (product) {
          addToCart(product, type === 'IMPORT' ? (product.importPrice || 0) : product.price);
          setShowScanner(false);
      } else {
          alert(`Không tìm thấy sản phẩm với mã: ${code}`);
          setShowScanner(false);
      }
  };

  const updateCartItem = (index: number, field: 'quantity' | 'price', value: number) => {
    const newCart = [...cart];
    newCart[index] = { ...newCart[index], [field]: value };
    setCart(newCart);
  };

  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (type === 'EXPORT') {
      const insufficientItems = cart.filter(item => item.quantity > item.product.stock);
      
      if (insufficientItems.length > 0) {
        const errorMsg = insufficientItems.map(item => 
          `- ${item.product.name}: Xuất ${item.quantity} / Tồn ${item.product.stock}`
        ).join('\n');
        
        alert(`⚠️ KHÔNG THỂ XUẤT KHO!\n\nSố lượng xuất vượt quá tồn kho hiện tại:\n${errorMsg}\n\nVui lòng điều chỉnh lại số lượng.`);
        return;
      }
    }

    onConfirm(cart, type, supplier, referenceDoc, note, date);
    onClose();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !cart.find(item => item.product.id === p.id) 
  );

  const totalValue = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            {type === 'IMPORT' ? 'Tạo Phiếu Nhập Kho' : 'Tạo Phiếu Xuất Kho'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* LEFT: General Info & Product Search */}
            <div className="w-full md:w-1/3 border-r border-slate-100 bg-slate-50/50 p-5 flex flex-col gap-5 overflow-y-auto">
                {/* Type Switcher */}
                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                    type="button"
                    onClick={() => setType('IMPORT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        type === 'IMPORT' 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                    >
                    <ArrowDownCircle size={18} /> Nhập hàng
                    </button>
                    <button
                    type="button"
                    onClick={() => setType('EXPORT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        type === 'EXPORT' 
                        ? 'bg-red-100 text-red-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                    >
                    <ArrowUpCircle size={18} /> Xuất hàng
                    </button>
                </div>

                {/* General Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày chứng từ/Giao dịch</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="date"
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            {type === 'IMPORT' ? 'Nhà cung cấp' : 'Khách hàng / Người nhận'}
                        </label>
                        <div className="relative">
                            {type === 'IMPORT' ? <Truck className="absolute left-3 top-2.5 text-slate-400" size={16} /> : <User className="absolute left-3 top-2.5 text-slate-400" size={16} />}
                            <input 
                                list={type === 'IMPORT' ? 'suppliers-list-inv' : 'customers-list-inv'}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={supplier}
                                onChange={(e) => setSupplier(e.target.value)}
                                placeholder="Tìm đối tác..."
                            />
                            <datalist id="suppliers-list-inv">
                                {suppliers.map(s => <option key={s.id} value={s.name}>{s.phone}</option>)}
                            </datalist>
                            <datalist id="customers-list-inv">
                                {customers.map(c => <option key={c.id} value={c.name}>{c.phone}</option>)}
                            </datalist>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã chứng từ / Hóa đơn</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={referenceDoc}
                                onChange={(e) => setReferenceDoc(e.target.value)}
                                placeholder="VD: PO-2310"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ghi chú</label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ghi chú thêm..."
                        />
                    </div>
                </div>

                {/* Add Product Search */}
                <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Thêm sản phẩm</label>
                        <button 
                            type="button" 
                            onClick={() => setShowScanner(true)}
                            className="text-xs flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900"
                        >
                            <Camera size={12} /> Quét QR
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            className="w-full pl-9 pr-4 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="Tìm tên sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowProductSearch(true); }}
                            onFocus={() => setShowProductSearch(true)}
                        />
                        {showProductSearch && searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-xl max-h-48 overflow-y-auto z-20">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                        <div 
                                            key={p.id} 
                                            className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                            onClick={() => addToCart(p, type === 'IMPORT' ? (p.importPrice || 0) : p.price)}
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">
                                                    {p.name} {p.model && <span className="text-xs text-slate-500">({p.model})</span>}
                                                </div>
                                                <div className="text-xs text-slate-500">Tồn: {p.stock}</div>
                                            </div>
                                            <Plus size={16} className="text-blue-600" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-xs text-center text-slate-400">Không tìm thấy sản phẩm</div>
                                )}
                            </div>
                        )}
                        {showProductSearch && (
                            <div className="fixed inset-0 z-10" onClick={() => setShowProductSearch(false)}></div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart Items */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-5">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Package size={64} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">Chưa có sản phẩm nào</p>
                            <p className="text-sm">Tìm kiếm hoặc quét QR để thêm</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {cart.map((item, index) => {
                                 const isError = type === 'EXPORT' && item.quantity > item.product.stock;
                                 return (
                                 <div key={item.product.id} className={`flex gap-4 p-3 rounded-xl border bg-white hover:shadow-sm transition-all items-start ${isError ? 'border-red-300 bg-red-50' : 'border-slate-100 hover:border-blue-200'}`}>
                                     <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                                        {item.product.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover rounded-lg" /> : <Package size={20} className="text-slate-400" />}
                                     </div>
                                     <div className="flex-1 min-w-0 pt-1">
                                         <h4 className="text-sm font-bold text-slate-800 truncate" title={item.product.name}>
                                             {item.product.name} {item.product.model && <span className="text-slate-500 font-normal">({item.product.model})</span>}
                                         </h4>
                                         <p className={`text-xs ${isError ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                                            Tồn hiện tại: {item.product.stock} {item.product.unit}
                                         </p>
                                     </div>
                                     <div className="flex items-start gap-3">
                                         <div className="w-20">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Số lượng</label>
                                            <input 
                                                type="number" min="1" 
                                                className={`w-full px-2 py-1 border rounded text-sm text-center font-bold ${isError ? 'border-red-400 text-red-600 focus:ring-red-200' : 'border-slate-200 text-slate-900'}`}
                                                value={item.quantity}
                                                onChange={(e) => updateCartItem(index, 'quantity', Number(e.target.value))}
                                            />
                                         </div>
                                         <div className="w-32">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">{type === 'IMPORT' ? 'Giá nhập' : 'Giá xuất'}</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-2 py-1 border border-slate-200 rounded text-sm text-right"
                                                value={formatNumber(item.price)}
                                                onChange={(e) => updateCartItem(index, 'price', parseNumber(e.target.value))}
                                                placeholder="0"
                                            />
                                            <div className="text-[10px] text-blue-600 font-medium text-right mt-0.5 truncate">
                                                {formatCurrency(item.price)}
                                            </div>
                                         </div>
                                         <button onClick={() => removeCartItem(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-3.5">
                                             <Trash2 size={18} />
                                         </button>
                                     </div>
                                 </div>
                             )})}
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                     <div>
                         <p className="text-xs text-slate-500 uppercase font-bold">Tổng số lượng</p>
                         <p className="text-xl font-bold text-slate-800">{cart.reduce((s, i) => s + i.quantity, 0)}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-slate-500 uppercase font-bold">Tổng giá trị phiếu</p>
                         <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
                     </div>
                     <button
                        onClick={handleSubmit}
                        disabled={cart.length === 0}
                        className="ml-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                        <CheckCircle size={20} />
                        Hoàn tất
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};