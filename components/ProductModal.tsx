import React, { useState, useEffect, useRef } from 'react';
import { X, Package, DollarSign, Layers, Tag, Globe, Upload, Image as ImageIcon, Loader2, TrendingUp, Save, XCircle, FileText, Link as LinkIcon, Box, FileUp, CheckCircle, Barcode, RefreshCw, Download, Printer, ScanBarcode, UploadCloud, Cpu, Eye, Scale } from 'lucide-react';
import { Product } from '../types';
import { dataService } from '../services/dataService';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
  products: Product[]; // Passed to suggest origins
}

// Utility to format number with thousand separator
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Utility to parse string back to number
const parseNumber = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url) || url.startsWith('data:image');
};

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData, products }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [unit, setUnit] = useState('Cái');
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
  const [catalogPreview, setCatalogPreview] = useState<string>('');

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogInputRef = useRef<HTMLInputElement>(null);

  // Get unique origins for autocomplete
  const uniqueOrigins = Array.from(new Set(products.map(p => p.origin).filter(Boolean)));
  // Common units
  const commonUnits = ['Cái', 'Bộ', 'Hộp', 'Chai', 'Kg', 'Mét', 'Lít', 'Gói', 'Thùng', 'Lon'];

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
        setModel(initialData.model || '');
        setUnit(initialData.unit || 'Cái');
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
        // Check if existing catalog is an image to show preview
        if (initialData.catalogUrl && isImageUrl(initialData.catalogUrl)) {
             setCatalogPreview(initialData.catalogUrl);
        } else {
             setCatalogPreview('');
        }
      } else {
        // AUTO GENERATE CODE FOR NEW PRODUCTS
        setCode(generateCode());
        setName('');
        setModel('');
        setUnit('Cái');
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
        setCatalogPreview('');
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
          
          // If uploaded file is image, create preview
          if (file.type.startsWith('image/')) {
              setCatalogPreview(URL.createObjectURL(file));
          } else {
              setCatalogPreview('');
          }
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
        // Use generic bucket for docs or images
        finalCatalogUrl = await dataService.uploadFile(catalogFile, 'product-images');
      }
      
      // Ensure code exists
      const finalCode = code || generateCode();

      const newProduct: Product = {
        id: initialData ? initialData.id : `TEMP-${Date.now()}`,
        code: finalCode,
        name,
        model,
        unit,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={20} />
            </div>
            {initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-slate-50/30">
            {/* LEFT COLUMN: Main Info */}
            <div className="flex-1 p-6 space-y-6 border-r border-slate-100 bg-white">
                
                <div className="flex gap-6 flex-col sm:flex-row">
                    {/* Image Upload Area */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                    <div 
                        className="w-full sm:w-36 h-36 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all relative overflow-hidden group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                        <>
                            <div className="w-10 h-10 bg-white text-blue-600 rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud size={20} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium text-center px-2">Ảnh sản phẩm</p>
                        </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex gap-3">
                            <div className="w-2/5">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mã SP</label>
                                <div className="relative flex items-center">
                                    <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase font-bold text-slate-700 tracking-wide"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="P00000"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleRegenerateCode}
                                        className="absolute right-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Tạo mã mới"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tên sản phẩm <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Giá bán</label>
                            <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-blue-600"
                                value={formatNumber(price)}
                                onChange={(e) => setPrice(parseNumber(e.target.value))}
                                placeholder="0"
                            />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Giá vốn</label>
                            <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-600 font-medium"
                                value={formatNumber(importPrice)}
                                onChange={(e) => setImportPrice(parseNumber(e.target.value))}
                                placeholder="0"
                            />
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Danh mục</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white cursor-pointer"
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
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Model / Kiểu dáng</label>
                    <div className="relative">
                        <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="VD: 2024..."
                        />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Đơn vị tính</label>
                    <div className="relative">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            list="unit-list"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="Cái"
                        />
                        <datalist id="unit-list">
                            {commonUnits.map((u) => <option key={u} value={u} />)}
                        </datalist>
                    </div>
                  </div>
                </div>

                {/* Advanced Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Layers size={18} className="text-blue-600"/>
                        Thông tin kho hàng
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nước SX</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    list="origin-list"
                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    placeholder="Việt Nam"
                                />
                                <datalist id="origin-list">
                                    {uniqueOrigins.map((org, index) => (
                                        <option key={index} value={org} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Số lô / Batch</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Hạn sử dụng</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Extra Details */}
            <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col space-y-6">
                
                <div className="space-y-4 flex-1">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex justify-between">
                          Catalogue / Tài liệu
                          <span className="text-[10px] font-normal lowercase bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">PDF, Ảnh, Excel...</span>
                      </label>
                      <div className="relative mb-2">
                            <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="url"
                                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${catalogFile ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`}
                                value={catalogUrl}
                                onChange={(e) => setCatalogUrl(e.target.value)}
                                placeholder="Hoặc dán link..."
                                disabled={!!catalogFile}
                            />
                      </div>
                      
                      {/* Image Preview Area for Catalog */}
                      {catalogPreview && (
                          <div className="mb-2 w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 relative group">
                              <img src={catalogPreview} alt="Catalog Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                  Preview
                              </div>
                          </div>
                      )}

                      <button 
                            type="button" 
                            onClick={() => catalogInputRef.current?.click()}
                            className={`w-full py-2.5 border border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${catalogFile ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'}`}
                        >
                            {catalogFile ? (
                                <>
                                    <CheckCircle size={16} />
                                    <span className="truncate max-w-[150px]">{catalogFile.name}</span>
                                </>
                            ) : (
                                <>
                                    <FileUp size={16} />
                                    Tải file lên
                                </>
                            )}
                      </button>
                      <input 
                        type="file" 
                        ref={catalogInputRef} 
                        className="hidden" 
                        onChange={handleCatalogChange} 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" 
                      />
                   </div>
                   
                   <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mô tả chi tiết</label>
                      <textarea
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none h-40 bg-white"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập thông tin chi tiết về sản phẩm..."
                      />
                   </div>
                </div>
            </div>
        </form>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
            <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
            <XCircle size={18} />
            Hủy bỏ
            </button>
            <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : (initialData ? <Save size={18} /> : <CheckCircle size={18} />)}
            {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
            </button>
        </div>
      </div>
    </div>
  );
};