import React, { useState, useEffect, useRef } from 'react';
import { X, Package, DollarSign, Layers, Tag, Globe, Upload, Image as ImageIcon, Loader2, TrendingUp, Save, XCircle } from 'lucide-react';
import { Product } from '../types';
import { dataService } from '../services/dataService';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [importPrice, setImportPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPrice(initialData.price);
        setImportPrice(initialData.importPrice || 0);
        setStock(initialData.stock);
        setCategory(initialData.category);
        setOrigin(initialData.origin || '');
        setPreviewUrl(initialData.imageUrl || '');
      } else {
        setName('');
        setPrice(0);
        setImportPrice(0);
        setStock(0);
        setCategory('Hàng hóa');
        setOrigin('Việt Nam');
        setPreviewUrl('');
      }
      setImageFile(null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = previewUrl;

      // Upload image if a new file is selected
      if (imageFile) {
        finalImageUrl = await dataService.uploadImage(imageFile);
      }

      const newProduct: Product = {
        id: initialData ? initialData.id : `P${Date.now()}`,
        name,
        price,
        importPrice,
        stock,
        category,
        origin,
        imageUrl: finalImageUrl
      };
      
      onSave(newProduct);
      onClose();
    } catch (error) {
      alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            {initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center">
            <div 
              className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Nhấn để tải ảnh sản phẩm</p>
                  <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG</p>
                </>
              )}
              {previewUrl && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <ImageIcon size={16} /> Thay đổi ảnh
                  </div>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên sản phẩm</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Cơm tấm, Áo thun..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá bán (VNĐ)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-blue-600"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá vốn (VNĐ)</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-600"
                  value={importPrice}
                  onChange={(e) => setImportPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tồn kho ban đầu</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  disabled={!!initialData} 
                />
              </div>
              {initialData && <p className="text-[10px] text-slate-400 mt-1">*Dùng chức năng Nhập/Xuất để thay đổi</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Danh mục</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Hàng hóa">Hàng hóa</option>
                  <option value="Thời trang">Thời trang</option>
                  <option value="Món ăn">Món ăn</option>
                  <option value="Thức uống">Thức uống</option>
                  <option value="Điện tử">Điện tử</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
          </div>

           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hãng / Nước SX</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="VD: Việt Nam, Bếp trung tâm..."
                />
              </div>
            </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <XCircle size={18} />
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initialData ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};