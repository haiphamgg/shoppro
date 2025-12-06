import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, Package, Tag, Archive, ArrowLeftRight, MapPin, Calendar, AlertTriangle, FileText, Filter, Cpu, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onInventoryClick: (product: Product) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url) || url.startsWith('data:image');
};

export const ProductList: React.FC<ProductListProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct, onInventoryClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.model && product.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.batchNumber && product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isExpiringSoon = (dateString?: string) => {
      if (!dateString) return false;
      const expiry = new Date(dateString);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (dateString?: string) => {
      if (!dateString) return false;
      return new Date(dateString) < new Date();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
        <div className="flex items-center gap-3 flex-1 w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên, mã, model hoặc lô..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             <Filter size={18} />
          </button>
        </div>
        <button 
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={20} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 custom-scrollbar">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
                const expiring = isExpiringSoon(product.expiryDate);
                const expired = isExpired(product.expiryDate);
                const isCatalogImage = product.catalogUrl && isImageUrl(product.catalogUrl);
                
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden relative">
                    {/* Status Badges */}
                    {expired && (
                        <div className="absolute top-3 left-3 z-20 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                            <AlertTriangle size={12} /> ĐÃ HẾT HẠN
                        </div>
                    )}
                    {!expired && expiring && (
                        <div className="absolute top-3 left-3 z-20 bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                            <AlertTriangle size={12} /> SẮP HẾT HẠN
                        </div>
                    )}

                    <div className="h-48 bg-slate-100 relative group-hover:opacity-100 transition-opacity overflow-hidden">
                      {product.imageUrl ? (
                         <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <Package size={48} className="text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1.5 z-10">
                        <Tag size={12} className="text-blue-500" /> {product.category}
                      </div>
                      
                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button 
                             onClick={() => onInventoryClick(product)}
                             className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-50 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <ArrowLeftRight size={18} /> Nhập/Xuất kho
                          </button>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-2">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2" title={product.name}>{product.name}</h3>
                            {product.model && <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1"><Cpu size={10} /> {product.model}</p>}
                          </div>
                          {product.catalogUrl && (
                             <a 
                                href={product.catalogUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1" 
                                title={isCatalogImage ? "Xem ảnh catalogue" : "Xem tài liệu"}
                             >
                                {isCatalogImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                             </a>
                          )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                         <div className="flex justify-between items-center text-xs text-slate-500">
                             <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-mono font-bold text-slate-600" title="Mã sản phẩm">
                                <Package size={12} className="text-slate-400" /> {product.code}
                             </div>
                             <div className="flex items-center gap-1.5" title="Xuất xứ">
                                <MapPin size={12} /> {product.origin || 'N/A'}
                             </div>
                         </div>
                         {product.batchNumber && (
                             <div className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="font-bold text-slate-400">Lô:</span> {product.batchNumber}
                             </div>
                         )}
                         {product.expiryDate && (
                             <div className={`text-xs flex items-center gap-1.5 font-medium ${expired ? 'text-red-600' : (expiring ? 'text-amber-600' : 'text-green-600')}`}>
                                <Calendar size={12} /> 
                                HSD: {formatDate(product.expiryDate)}
                             </div>
                         )}
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Giá bán</p>
                          <p className="font-bold text-blue-600 text-lg">{formatCurrency(product.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Tồn kho</p>
                          <div className={`font-bold text-lg ${product.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                            {product.stock} <span className="text-xs font-normal text-slate-500">{product.unit || 'Cái'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-50 flex gap-2 border-t border-slate-100">
                      <button 
                        onClick={() => onEditProduct(product)}
                        className="flex-1 py-2 rounded-lg text-slate-600 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Edit size={16} /> Sửa
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="flex-1 py-2 rounded-lg text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 hover:shadow-sm text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash size={16} /> Xóa
                      </button>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Archive size={40} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-600">Không tìm thấy sản phẩm nào</p>
            <p className="text-sm">Thử tìm kiếm với từ khóa khác hoặc thêm mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};