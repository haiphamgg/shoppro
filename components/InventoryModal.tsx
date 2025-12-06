import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Package, DollarSign, FileText, Truck, User, Plus, Trash2, Search, CheckCircle, AlertTriangle, Camera, Calendar, List, Info, TrendingUp, UserPlus } from 'lucide-react';
import { Product, InventoryType, Customer, Supplier } from '../types';
import { QRScanner } from './QRScanner';

interface InventoryItem {
  product: Product;
  quantity: number;
  price: number; // Giá nhập (nếu là Import) hoặc Giá xuất (nếu là Export)
  newSellingPrice?: number; // Giá bán mới (chỉ dùng cho Import)
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: { product: Product, quantity: number, price: number, newSellingPrice?: number }[], type: InventoryType, supplier: string, doc: string, note: string, date: string) => void;
  initialProduct: Product | null;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  onQuickAddCustomer: () => void;
  onQuickAddSupplier: () => void;
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


export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onConfirm, initialProduct, products, customers, suppliers, onQuickAddCustomer, onQuickAddSupplier }) => {
  const [type, setType] = useState<InventoryType>('IMPORT');
  const [cart, setCart] = useState<InventoryItem[]>([]);
  const [supplier, setSupplier] = useState('');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'INFO' | 'CART'>('INFO');
  
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
      setActiveTab('INFO'); // Reset tab on open
      
      if (initialProduct) {
        addToCart(initialProduct);
      }
    }
  }, [isOpen, initialProduct]);

  const addToCart = (product: Product) => {
    const defaultPrice = type === 'IMPORT' ? (product.importPrice || 0) : product.price;
    
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
          return prev.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prev, { 
          product, 
          quantity: 1, 
          price: defaultPrice,
          newSellingPrice: product.price // Mặc định giá bán mới bằng giá bán hiện tại
      }];
    });
    setSearchTerm('');
    setShowProductSearch(false);
  };

  const handleScan = (code: string) => {
      const product = products.find(p => p.code === code);
      if (product) {
          addToCart(product);
          setShowScanner(false);
      } else {
          alert(`Không tìm thấy sản phẩm với mã: ${code}`);
          setShowScanner(false);
      }
  };

  const updateCartItem = (index: number, field: 'quantity' | 'price' | 'newSellingPrice', value: number) => {
    const newCart = [...cart];
    newCart[index] = { ...newCart[index], [field]: value };
    setCart(newCart);
  };

  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
    }

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

  // Reset prices in cart when switching types
  useEffect(() => {
     if (cart.length > 0) {
         setCart(prev => prev.map(item => ({
             ...item,
             price: type === 'IMPORT' ? (item.product.importPrice || 0) : item.product.price
         })));
     }
  }, [type]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(p => !cart.find(item => item.product.id === p.id));

  const totalValue = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in sm:p-4">
      {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      <div className="bg-white sm:rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden h-full sm:h-auto sm:max-h-[95vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-20">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className={`p-2 rounded-lg ${type === 'IMPORT' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                {type === 'IMPORT' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
            </div>
            {type === 'IMPORT' ? 'Nhập Kho' : 'Xuất Kho'}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden border-b border-slate-200 bg-slate-50">
            <button 
                onClick={() => setActiveTab('INFO')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'INFO' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
            >
                <Info size={16} /> Thông tin & Tìm SP
            </button>
            <button 
                onClick={() => setActiveTab('CART')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'CART' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
            >
                <List size={16} /> Danh sách ({totalQuantity})
            </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-50/50">
            {/* LEFT: General Info & Product Search */}
            <div className={`w-full md:w-5/12 border-r border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-5 overflow-y-auto ${activeTab === 'INFO' ? 'block' : 'hidden md:flex'}`}>
                {/* Type Switcher */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                    type="button"
                    onClick={() => setType('IMPORT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                        type === 'IMPORT' 
                        ? 'bg-white text-blue-700 shadow ring-1 ring-black/5' 
                        : 'text-slate-500 hover:bg-slate-200/50'
                    }`}
                    >
                    <ArrowDownCircle size={18} /> Nhập hàng
                    </button>
                    <button
                    type="button"
                    onClick={() => setType('EXPORT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                        type === 'EXPORT' 
                        ? 'bg-white text-red-700 shadow ring-1 ring-black/5' 
                        : 'text-slate-500 hover:bg-slate-200/50'
                    }`}
                    >
                    <ArrowUpCircle size={18} /> Xuất hàng
                    </button>
                </div>

                {/* Product Search */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-blue-800">Thêm sản phẩm</label>
                        <button 
                            type="button" 
                            onClick={() => setShowScanner(true)}
                            className="text-xs flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-sm active:scale-95 transition-transform"
                        >
                            <Camera size={14} /> Quét mã QR
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm"
                            placeholder="Nhập tên hoặc mã SP..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowProductSearch(true); }}
                            onFocus={() => setShowProductSearch(true)}
                        />
                        {showProductSearch && searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-30 animate-fade-in custom-scrollbar">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                        <div 
                                            key={p.id} 
                                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                                            onClick={() => addToCart(p)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-lg"/> : <Package size={16} className="text-slate-400"/>}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-800 truncate">{p.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                                        <span className="bg-slate-100 px-1.5 rounded text-[10px] font-mono">{p.code}</span>
                                                        <span>Tồn: {p.stock}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-sm text-center text-slate-500">Không tìm thấy sản phẩm "{searchTerm}"</div>
                                )}
                            </div>
                        )}
                        {showProductSearch && (
                            <div className="fixed inset-0 z-10" onClick={() => setShowProductSearch(false)}></div>
                        )}
                    </div>
                </div>

                {/* General Inputs */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ngày giao dịch</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 focus:bg-white"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mã chứng từ</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 focus:bg-white"
                                    value={referenceDoc}
                                    onChange={(e) => setReferenceDoc(e.target.value)}
                                    placeholder="VD: PO-01"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                            {type === 'IMPORT' ? 'Nhà cung cấp' : 'Khách hàng / Người nhận'}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                {type === 'IMPORT' ? <Truck className="absolute left-3 top-2.5 text-slate-400" size={16} /> : <User className="absolute left-3 top-2.5 text-slate-400" size={16} />}
                                <input 
                                    list={type === 'IMPORT' ? 'suppliers-list-inv' : 'customers-list-inv'}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 focus:bg-white"
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
                             <button
                                type="button"
                                onClick={type === 'IMPORT' ? onQuickAddSupplier : onQuickAddCustomer}
                                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                                title="Thêm nhanh đối tác"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ghi chú</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50 focus:bg-white"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ghi chú thêm..."
                        />
                    </div>
                </div>
                
                {/* Mobile Button to Switch to Cart */}
                <div className="md:hidden mt-4 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => setActiveTab('CART')}
                        className="w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold shadow-sm hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                        Xem danh sách hàng ({totalQuantity})
                    </button>
                </div>
            </div>

            {/* RIGHT: Cart Items */}
            <div className={`flex-1 flex flex-col bg-slate-50 ${activeTab === 'CART' ? 'block' : 'hidden md:flex'}`}>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Package size={40} className="text-slate-300" />
                            </div>
                            <p className="text-lg font-bold text-slate-600">Chưa có sản phẩm</p>
                            <p className="text-sm text-center max-w-[200px]">Vui lòng tìm kiếm và thêm sản phẩm ở cột bên trái</p>
                            <button 
                                onClick={() => setActiveTab('INFO')}
                                className="md:hidden mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm"
                            >
                                Thêm sản phẩm ngay
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-20 md:pb-0">
                             {cart.map((item, index) => {
                                 const isError = type === 'EXPORT' && item.quantity > item.product.stock;
                                 return (
                                 <div key={item.product.id} className={`flex flex-col sm:flex-row gap-3 p-4 rounded-xl border bg-white shadow-sm transition-all relative group ${isError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                     
                                     {/* Product Info */}
                                     <div className="flex gap-3 items-center">
                                         <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-100">
                                            {item.product.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover rounded-lg" /> : <Package size={24} className="text-slate-400" />}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <h4 className="text-sm font-bold text-slate-800 truncate" title={item.product.name}>
                                                 {item.product.name}
                                             </h4>
                                             <div className="flex items-center gap-2 mt-0.5">
                                                 <span className="text-xs text-slate-500 bg-slate-100 px-1.5 rounded">{item.product.unit || 'Cái'}</span>
                                                 <span className={`text-xs ${isError ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                                                    Tồn: {item.product.stock}
                                                 </span>
                                             </div>
                                         </div>
                                         <button onClick={() => removeCartItem(index)} className="sm:hidden p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg">
                                             <Trash2 size={18} />
                                         </button>
                                     </div>

                                     {/* Controls */}
                                     <div className="flex items-end justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto">
                                         <div className="w-20">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Số lượng</label>
                                            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                                                <input 
                                                    type="number" min="1" 
                                                    className={`w-full px-2 py-1.5 text-center font-bold text-sm bg-transparent outline-none ${isError ? 'text-red-600' : 'text-slate-900'}`}
                                                    value={item.quantity}
                                                    onChange={(e) => updateCartItem(index, 'quantity', Number(e.target.value))}
                                                />
                                            </div>
                                         </div>
                                         <div className="w-28">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">{type === 'IMPORT' ? 'Giá vốn' : 'Giá xuất'}</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-right outline-none focus:border-blue-400 font-medium"
                                                value={formatNumber(item.price)}
                                                onChange={(e) => updateCartItem(index, 'price', parseNumber(e.target.value))}
                                                placeholder="0"
                                            />
                                         </div>

                                         {type === 'IMPORT' && (
                                            <div className="w-28">
                                                <label className="text-[10px] text-blue-500 font-bold uppercase mb-1 block flex items-center gap-1"><TrendingUp size={10} /> Giá bán mới</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-2 py-1.5 border border-blue-200 rounded-lg text-sm text-right outline-none focus:border-blue-400 font-bold text-blue-600"
                                                    value={formatNumber(item.newSellingPrice || 0)}
                                                    onChange={(e) => updateCartItem(index, 'newSellingPrice', parseNumber(e.target.value))}
                                                    placeholder="0"
                                                />
                                            </div>
                                         )}

                                         <button onClick={() => removeCartItem(index)} className="hidden sm:flex p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors h-[38px] w-[38px] items-center justify-center mb-4 sm:mb-0">
                                             <Trash2 size={18} />
                                         </button>
                                     </div>
                                 </div>
                             )})}
                        </div>
                    )}
                </div>

                {/* Footer Summary - Sticky on Mobile */}
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
                     <div className="flex justify-between items-center mb-4">
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-bold">Tổng số lượng</p>
                             <p className="text-lg font-bold text-slate-800">{cart.reduce((s, i) => s + i.quantity, 0)}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-slate-500 uppercase font-bold">Tổng giá trị phiếu</p>
                             <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
                         </div>
                     </div>
                     <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors md:hidden"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={cart.length === 0}
                            className="flex-[2] md:w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={20} />
                            Hoàn tất
                        </button>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};