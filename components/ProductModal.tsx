import React, { useState, useEffect, useRef } from 'react';
import { X, Package, DollarSign, Layers, Tag, Globe, Upload, Image as ImageIcon, Loader2, TrendingUp, Save, XCircle, FileText, Link as LinkIcon, Box, FileUp, CheckCircle, Barcode, RefreshCw, Download, Printer } from 'lucide-react';
import { Product } from '../types';
import { dataService } from '../services/dataService';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

// Utility to format number with thousand separator
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Utility to parse string back to number
const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [importPrice, setImportPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // New Fields State
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [description, setDescription] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [catalogFile, setCatalogFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogInputRef = useRef<HTMLInputElement>(null);

  // Generate a random code like P839210
  const generateCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `P${randomNum}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCode(initialData.code || '');
        setName(initialData.name);
        setPrice(initialData.price);
        setImportPrice(initialData.importPrice || 0);
        setStock(initialData.stock);
        setCategory(initialData.category);
        setOrigin(initialData.origin || '');
        setPreviewUrl(initialData.imageUrl || '');
        // Set new fields
        setExpiryDate(initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '');
        setBatchNumber(initialData.batchNumber || '');
        setDescription(initialData.description || '');
        setCatalogUrl(initialData.catalogUrl || '');
      } else {
        // AUTO GENERATE CODE FOR NEW PRODUCTS
        setCode(generateCode());
        setName('');
        setPrice(0);
        setImportPrice(0);
        setStock(0);
        setCategory('Hàng hóa');
        setOrigin('Việt Nam');
        setPreviewUrl('');
        setExpiryDate('');
        setBatchNumber('');
        setDescription('');
        setCatalogUrl('');
      }
      setImageFile(null);
      setCatalogFile(null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCatalogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setCatalogFile(file);
          setCatalogUrl(''); 
      }
  };

  const handleRegenerateCode = () => {
    setCode(generateCode());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = previewUrl;
      let finalCatalogUrl = catalogUrl;

      // Upload image if a new file is selected
      if (imageFile) {
        finalImageUrl = await dataService.uploadFile(imageFile, 'product-images');
      }

      // Upload catalog if a new file is selected
      if (catalogFile) {
        finalCatalogUrl = await dataService.uploadFile(catalogFile, 'product-images');
      }
      
      // Ensure code exists
      const finalCode = code || generateCode();

      const newProduct: Product = {
        id: initialData ? initialData.id : `TEMP-${Date.now()}`,
        code: finalCode,
        name,
        price: Number(price) || 0,
        importPrice: Number(importPrice) || 0,
        stock: Number(stock) || 0,
        category,
        origin,
        imageUrl: finalImageUrl,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        batchNumber,
        description,
        catalogUrl: finalCatalogUrl
      };
      
      onSave(newProduct);
      onClose();
    } catch (error) {
      alert('Lỗi trong quá trình xử lý tệp hoặc lưu dữ liệu. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // QR Code URL (using a public API for display)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            {initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row">
            {/* LEFT COLUMN: Main Info */}
            <div className="flex-1 p-6 space-y-6 border-r border-slate-100">
                
                {/* 1. Basic Info Section */}
                <div className="flex gap-6 flex-col sm:flex-row">
                    {/* Image Upload Area */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                    <div 
                        className="w-full sm:w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all relative overflow-hidden group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                        <>
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Upload size={16} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium text-center px-2">Ảnh SP</p>
                        </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex gap-3">
                            <div className="w-2/5">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã SP (Tự động)</label>
                                <div className="relative flex items-center">
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase font-bold text-slate-700"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="P00000"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleRegenerateCode}
                                        className="absolute right-2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Tạo mã mới"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên sản phẩm <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá bán</label>
                            <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                required
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-blue-600"
                                value={formatNumber(price)}
                                onChange={(e) => setPrice(parseNumber(e.target.value))}
                                placeholder="0"
                            />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá vốn</label>
                            <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                required
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-600"
                                value={formatNumber(importPrice)}
                                onChange={(e) => setImportPrice(parseNumber(e.target.value))}
                                placeholder="0"
                            />
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hãng / Nước SX</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                        type="text"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Việt Nam"
                        />
                    </div>
                    </div>
                </div>

                {/* Advanced Info */}
                <div className="border-t border-slate-100 pt-4">
                     <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Layers size={16} className="text-blue-600"/>
                        Thông tin kho hàng
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Tồn kho ban đầu</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
                                disabled={!!initialData} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Số lô / Batch</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Hạn sử dụng</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: QR & Details */}
            <div className="w-full md:w-80 bg-slate-50/50 p-6 flex flex-col">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center mb-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 w-full text-center border-b border-slate-100 pb-2">Mã QR Sản Phẩm</h4>
                    {code ? (
                        <>
                            <div className="bg-white p-2 border border-slate-100 rounded-lg mb-2">
                                <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain" />
                            </div>
                            <div className="text-center mb-3">
                                <div className="text-lg font-mono font-bold text-slate-800 tracking-wider">{code}</div>
                                <div className="text-xs text-slate-500">{name || 'Chưa có tên'}</div>
                            </div>
                            <div className="flex gap-2 w-full">
                                <button type="button" className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                                    <Printer size={14} /> In nhãn
                                </button>
                                <button type="button" className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                                    <Download size={14} /> Tải về
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-32 h-32 flex items-center justify-center text-slate-300 bg-slate-50 rounded-lg">
                            <RefreshCw className="animate-spin" />
                        </div>
                    )}
                </div>

                <div className="space-y-4 flex-1">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Tài liệu / Catalogue</label>
                      <div className="relative mb-2">
                            <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={14} />
                            <input
                                type="url"
                                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none ${catalogFile ? 'bg-slate-100 border-slate-200 text-slate-400' : 'border-slate-200'}`}
                                value={catalogUrl}
                                onChange={(e) => setCatalogUrl(e.target.value)}
                                placeholder="URL tài liệu..."
                                disabled={!!catalogFile}
                            />
                      </div>
                      <button 
                            type="button" 
                            onClick={() => catalogInputRef.current?.click()}
                            className={`w-full py-2 border rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-colors ${catalogFile ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <FileUp size={14} />
                            {catalogFile ? `Đã chọn: ${catalogFile.name}` : 'Tải tệp lên'}
                      </button>
                      <input type="file" ref={catalogInputRef} className="hidden" onChange={handleCatalogChange} accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" />
                   </div>
                   
                   <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả / Ghi chú</label>
                      <textarea
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-32"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập thông tin chi tiết..."
                      />
                   </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                    type="button"
                    onClick={onClose}
                    disabled={isUploading}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                    Hủy
                    </button>
                    <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {initialData ? 'Lưu' : 'Tạo mới'}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};