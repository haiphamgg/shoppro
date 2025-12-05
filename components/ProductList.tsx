import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash, Package, Tag, Archive } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const ProductList: React.FC<ProductListProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
        <div className="flex items-center gap-3 flex-1 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm hoặc danh mục..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <Package size={40} className="text-slate-300" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2" title={product.name}>{product.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                     <Tag size={12} />
                     <span>{product.id}</span>
                  </div>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Giá bán</p>
                      <p className="font-bold text-blue-600 text-lg">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Tồn kho</p>
                      <div className={`font-semibold ${product.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                        {product.stock}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-50 flex gap-2">
                  <button 
                    onClick={() => onEditProduct(product)}
                    className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={16} /> Sửa
                  </button>
                  <button 
                    onClick={() => onDeleteProduct(product.id)}
                    className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash size={16} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Archive size={48} className="mb-3 opacity-50" />
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
};