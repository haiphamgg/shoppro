import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderModal } from './components/OrderModal';
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/ProductModal';
import { InventoryModal } from './components/InventoryModal';
import { InventoryHistory } from './components/InventoryHistory';
import { CustomerList } from './components/CustomerList';
import { CustomerModal } from './components/CustomerModal';
import { SupplierList } from './components/SupplierList';
import { SupplierModal } from './components/SupplierModal';
import { UserList } from './components/UserList';
import { UserModal } from './components/UserModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AIAssistant } from './components/AIAssistant';
import { Auth } from './components/Auth';
import { ViewState, Order, Product, Customer, InventoryType, UserRole, InventoryLog, Supplier, User, Permission } from './types';
import { dataService } from './services/dataService';
import { Menu, Bell, Loader2, Database, ShieldAlert, Copy, Check } from 'lucide-react';

// New Component for SQL Repair inside App.tsx to avoid new file
const SystemSettings: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const sqlCommand = `
-- 1. Tạo bảng Inventory Logs nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT,
  type TEXT,
  quantity NUMERIC,
  old_stock NUMERIC,
  new_stock NUMERIC,
  price NUMERIC,
  supplier TEXT,
  reference_doc TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  date TIMESTAMPTZ DEFAULT now()
);

-- 2. Bổ sung các cột thiếu (QUAN TRỌNG: Sửa lỗi 'Could not find column')
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS old_stock NUMERIC;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS new_stock NUMERIC;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ DEFAULT now();

-- (Đã xóa lệnh set default ID để tránh lỗi type mismatch UUID/TEXT)

-- Fix: Tắt RLS để đảm bảo dữ liệu luôn hiển thị
ALTER TABLE inventory_logs DISABLE ROW LEVEL SECURITY;

-- 3. Cập nhật bảng Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_price NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Tạo bảng Users (nếu dùng quản lý user riêng biệt)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'STAFF',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cập nhật bảng Users cho phân quyền và mật khẩu
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password TEXT;

-- 6. Reload Schema Cache (Bắt buộc để Supabase nhận diện cột mới)
NOTIFY pgrst, 'reload config';
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Database size={24} />
        </div>
        <div>
           <h2 className="text-xl font-bold text-slate-800">Cài đặt hệ thống & Sửa lỗi</h2>
           <p className="text-sm text-slate-500">Công cụ dành cho quản trị viên để bảo trì Database</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
        <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
           <ShieldAlert size={20} />
           Trạng thái Database
        </h3>
        <p className="text-sm text-amber-700 mb-3">
           Nếu bạn gặp lỗi <strong>"Could not find column"</strong> hoặc <strong>"ERROR: 42804"</strong>, 
           nghĩa là cấu trúc bảng chưa đồng bộ. Hãy chạy lệnh SQL bên dưới để khắc phục.
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
           <label className="text-sm font-bold text-slate-700">Lệnh SQL sửa lỗi (Copy và chạy trong Supabase)</label>
           <button 
             onClick={handleCopy}
             className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
           >
             {copied ? <Check size={14} /> : <Copy size={14} />}
             {copied ? 'Đã copy' : 'Copy lệnh'}
           </button>
        </div>
        <div className="relative">
          <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {sqlCommand}
          </pre>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('STAFF');
  // Mock current user object for local state (in real app, fetched from auth)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] = useState<Product | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedOrders, fetchedProducts, fetchedCustomers, fetchedSuppliers, fetchedLogs, fetchedUsers] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts(),
        dataService.getCustomers(),
        dataService.getSuppliers(),
        dataService.getInventoryLogs(),
        // Always fetch users to find current user info, but filter in UI if not admin
        dataService.getUsers()
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
      setSuppliers(fetchedSuppliers);
      setLogs(fetchedLogs);
      setUsers(fetchedUsers);

      // If we are logged in with email, try to find our full user object to get permissions
      if (currentUser?.email) {
          const foundUser = fetchedUsers.find(u => u.email === currentUser.email);
          if (foundUser) {
              setCurrentUser(foundUser);
              setUserRole(foundUser.role);
          }
      }

    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    // In a real app, we'd get the full user object from the auth response
    // Here we create a mock wrapper. The 'loadData' will refine it with DB data
    const mockUser: User = {
        id: 'current-user-id',
        email: role === 'ADMIN' ? 'admin' : 'demo',
        name: role === 'ADMIN' ? 'Administrator' : 'Nhân viên bán hàng',
        role: role,
        permissions: role === 'ADMIN' ? [] : ['VIEW_DASHBOARD', 'VIEW_ORDERS', 'VIEW_PRODUCTS'] // Default permissions before DB load
    };
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
  };

  // Helper to handle save errors gracefully
  const handleSaveError = (error: any, context: string) => {
    console.error(`Error saving ${context}:`, error);
    
    let message = 'Lỗi không xác định';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error object
        message = error.message || error.details || error.hint || JSON.stringify(error);
    }

    // Friendly message for Schema Cache error (PGRST204)
    if (message.includes('schema cache') || message.includes('Could not find') || message.includes('new_stock')) {
        message = `Cấu trúc bảng dữ liệu trên Server chưa được cập nhật (thiếu cột 'new_stock', 'old_stock'...). \n\nVui lòng vào mục "Cài đặt hệ thống", copy lệnh SQL và chạy trong Supabase SQL Editor để sửa lỗi này.`;
    }
    // Clean up generic object dump
    else if (message === '{}' || message.includes('[object Object]')) {
        message = "Hệ thống gặp lỗi kết nối hoặc bảng dữ liệu chưa được khởi tạo.";
    }
    // Friendly message for missing table
    else if (message.includes('relation') && message.includes('does not exist')) {
        message = `Bảng dữ liệu cho "${context}" chưa được khởi tạo trong Database.\nVui lòng vào "Cài đặt hệ thống" và chạy lệnh SQL sửa lỗi.`;
    }

    alert(`⚠️ Không thể lưu ${context}:\n${message}`);
  };

  // --- HANDLERS: ORDERS ---
  const handleSaveOrder = async (order: Order) => {
    const isEdit = !!editingOrder;
    // Optimistic update
    if (isEdit) setOrders(orders.map(o => o.id === order.id ? order : o));
    else setOrders([order, ...orders]);
    
    if (currentView !== 'ORDERS') setCurrentView('ORDERS');
    
    try {
      if (isEdit) {
        await dataService.updateOrder(order);
      } else {
        const newOrder = await dataService.createOrder(order);
        setOrders(prev => prev.map(o => o.id === order.id ? newOrder : o));
      }
    } catch (error: any) {
      handleSaveError(error, 'Đơn hàng');
      if (!isEdit) setOrders(prev => prev.filter(o => o.id !== order.id));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Xóa đơn hàng này?')) return;
    setOrders(orders.filter(o => o.id !== id));
    try { 
      await dataService.deleteOrder(id); 
    } catch (error: any) {
      handleSaveError(error, 'Xóa đơn hàng');
    }
  };

  // --- HANDLERS: PRODUCTS & INVENTORY ---
  const handleSaveProduct = async (product: Product) => {
    const isEdit = !!editingProduct;
    // Optimistic
    if (isEdit) setProducts(products.map(p => p.id === product.id ? product : p));
    else setProducts([product, ...products]);
    
    try {
      if (isEdit) {
        await dataService.updateProduct(product);
      } else {
        const newProduct = await dataService.createProduct(product);
        // Replace temp ID with real ID
        setProducts(prev => prev.map(p => p.id === product.id ? newProduct : p));
      }
    } catch (error: any) {
      // Don't revert optimistic update immediately if it's just a fallback warning
      handleSaveError(error, 'Sản phẩm');
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (userRole !== 'ADMIN' && !currentUser?.permissions?.includes('MANAGE_PRODUCTS')) {
      alert("Bạn không có quyền xóa sản phẩm!");
      return;
    }
    if (!window.confirm('Xóa sản phẩm này?')) return;
    setProducts(products.filter(p => p.id !== id));
    try { 
      await dataService.deleteProduct(id); 
    } catch (error: any) {
      handleSaveError(error, 'Xóa sản phẩm');
    }
  };

  const handleInventoryUpdate = async (
    items: { product: Product, quantity: number, price: number, newSellingPrice?: number }[],
    type: InventoryType,
    supplier: string,
    doc: string,
    note: string,
    date: string
  ) => {
    // Optimistic Update Loop
    const updatedProducts = [...products];
    const newLogs: InventoryLog[] = [];
    const timestamp = new Date().toISOString();

    for (const item of items) {
       const productIndex = updatedProducts.findIndex(p => p.id === item.product.id);
       if (productIndex === -1) continue;
       
       const product = updatedProducts[productIndex];
       const newStock = type === 'IMPORT' 
         ? product.stock + item.quantity 
         : Math.max(0, product.stock - item.quantity);

       let newImportPrice = product.importPrice;
       if (type === 'IMPORT' && item.price > 0) {
          const currentVal = product.stock * product.importPrice;
          const newVal = item.quantity * item.price;
          if (newStock > 0) newImportPrice = (currentVal + newVal) / newStock;
       }
       
       // Update selling price if provided in import
       const newSellingPrice = (type === 'IMPORT' && item.newSellingPrice) ? item.newSellingPrice : product.price;

       // Update Product Object
       updatedProducts[productIndex] = { 
           ...product, 
           stock: newStock, 
           importPrice: Math.round(newImportPrice),
           price: newSellingPrice
       };

       // Create Log
       newLogs.push({
         id: `LOG-${Date.now()}-${Math.random()}`,
         productId: product.id,
         productName: product.name,
         type,
         quantity: item.quantity,
         oldStock: product.stock,
         newStock,
         price: item.price, // This is import/export price
         supplier,
         referenceDoc: doc,
         note,
         timestamp,
         date: date || timestamp
       });
    }

    setProducts(updatedProducts);
    setLogs([...newLogs, ...logs]);

    // Async Server Update
    try {
      // Execute sequentially to ensure order
      for (const item of items) {
        await dataService.updateProductStock(
            item.product, 
            type, 
            item.quantity, 
            item.price, 
            supplier, 
            doc, 
            note, 
            date,
            item.newSellingPrice // Pass new selling price
        );
      }
    } catch (error: any) {
      handleSaveError(error, 'Cập nhật kho');
    }
  };

  // --- HANDLERS: CUSTOMERS ---
  const handleSaveCustomer = async (customer: Customer) => {
    const isEdit = !!editingCustomer;
    if (isEdit) setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    else setCustomers([customer, ...customers]);

    try {
      if (isEdit) {
        await dataService.updateCustomer(customer);
      } else {
        const newCustomer = await dataService.createCustomer(customer);
        setCustomers(prev => prev.map(c => c.id === customer.id ? newCustomer : c));
      }
    } catch (error: any) {
      handleSaveError(error, 'Khách hàng');
      if (!isEdit) setCustomers(prev => prev.filter(c => c.id !== customer.id));
    }
  };
  
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Xóa khách hàng này?')) return;
    setCustomers(customers.filter(c => c.id !== id));
    try { 
      await dataService.deleteCustomer(id); 
    } catch (error: any) {
      handleSaveError(error, 'Xóa khách hàng');
    }
  };

  // --- HANDLERS: SUPPLIERS ---
  const handleSaveSupplier = async (supplier: Supplier) => {
    const isEdit = !!editingSupplier;
    if (isEdit) setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
    else setSuppliers([supplier, ...suppliers]);

    try {
      if (isEdit) {
        await dataService.updateSupplier(supplier);
      } else {
        const newSupplier = await dataService.createSupplier(supplier);
        setSuppliers(prev => prev.map(s => s.id === supplier.id ? newSupplier : s));
      }
    } catch (error: any) {
      handleSaveError(error, 'Nhà cung cấp');
      if (!isEdit) setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
    }
  };
  
  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Xóa nhà cung cấp này?')) return;
    setSuppliers(suppliers.filter(s => s.id !== id));
    try { 
      await dataService.deleteSupplier(id); 
    } catch (error: any) {
      handleSaveError(error, 'Xóa nhà cung cấp');
    }
  };

  // --- HANDLERS: USERS ---
  const handleSaveUser = async (user: User) => {
    if (userRole !== 'ADMIN') return;
    const isEdit = !!editingUser;
    if (isEdit) setUsers(users.map(u => u.id === user.id ? user : u));
    else setUsers([user, ...users]);

    try {
      if (isEdit) {
        await dataService.updateUser(user);
      } else {
        const newUser = await dataService.createUser(user);
        setUsers(prev => prev.map(u => u.id === user.id ? newUser : u));
      }
    } catch (error: any) {
      handleSaveError(error, 'Nhân viên');
      if (!isEdit) setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (userRole !== 'ADMIN') return;
    if (!window.confirm('Xóa nhân viên này?')) return;
    setUsers(users.filter(u => u.id !== id));
    try { 
      await dataService.deleteUser(id); 
    } catch (error: any) {
      handleSaveError(error, 'Xóa nhân viên');
    }
  };

  if (!isAuthenticated) return <Auth onLoginSuccess={handleLoginSuccess} />;

  const renderContent = () => {
    if (isLoading && orders.length === 0 && products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Đang đồng bộ dữ liệu...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard userRole={userRole} orders={orders} products={products} />;
      case 'ORDERS':
        return (
          <OrderList 
            orders={orders} 
            onAddOrder={() => { setEditingOrder(null); setIsOrderModalOpen(true); }}
            onDeleteOrder={handleDeleteOrder}
            onEditOrder={(o) => { setEditingOrder(o); setIsOrderModalOpen(true); }}
          />
        );
      case 'PRODUCTS':
        return (
          <ProductList 
            products={products}
            onAddProduct={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            onEditProduct={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
            onDeleteProduct={handleDeleteProduct}
            onInventoryClick={(p) => { setSelectedProductForInventory(p); setIsInventoryModalOpen(true); }}
          />
        );
      case 'INVENTORY_LOGS':
        return <InventoryHistory logs={logs} />;
      case 'CUSTOMERS':
        return (
          <CustomerList
            customers={customers}
            onAddCustomer={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
            onEditCustomer={(c) => { setEditingCustomer(c); setIsCustomerModalOpen(true); }}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'SUPPLIERS':
        return (
          <SupplierList
            suppliers={suppliers}
            onAddSupplier={() => { setEditingSupplier(null); setIsSupplierModalOpen(true); }}
            onEditSupplier={(s) => { setEditingSupplier(s); setIsSupplierModalOpen(true); }}
            onDeleteSupplier={handleDeleteSupplier}
          />
        );
      case 'USERS':
        return (
          <UserList
            users={users}
            onAddUser={() => { setEditingUser(null); setIsUserModalOpen(true); }}
            onEditUser={(u) => { setEditingUser(u); setIsUserModalOpen(true); }}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'AI_ASSISTANT':
        return <AIAssistant orders={orders} products={products} />;
      // @ts-ignore - 'SETTINGS' might not be in ViewState type yet, but we handle it here
      case 'SETTINGS':
        return <SystemSettings />;
      default: return <Dashboard userRole={userRole} orders={orders} products={products} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => setIsAuthenticated(false)}
        userRole={userRole}
        user={currentUser}
        onChangePassword={() => setIsChangePasswordModalOpen(true)}
      />
      
      <main className="flex-1 lg:ml-0 flex flex-col min-w-0 transition-all duration-300">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Menu size={24} /></button>
             <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
               {currentView === 'DASHBOARD' && 'Bảng điều khiển'}
               {currentView === 'ORDERS' && 'Quản lý đơn hàng'}
               {currentView === 'AI_ASSISTANT' && 'Trợ lý AI'}
               {currentView === 'PRODUCTS' && 'Kho sản phẩm'}
               {currentView === 'INVENTORY_LOGS' && 'Lịch sử kho hàng'}
               {currentView === 'CUSTOMERS' && 'Danh sách khách hàng'}
               {currentView === 'SUPPLIERS' && 'Danh sách Nhà cung cấp'}
               {currentView === 'USERS' && 'Quản lý nhân sự'}
               {/* @ts-ignore */}
               {currentView === 'SETTINGS' && 'Cài đặt hệ thống'}
             </h2>
           </div>
           <div className="flex items-center gap-3 sm:gap-6">
             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
             <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
             <div className="flex items-center gap-3 pl-2 sm:pl-0">
               <div className="hidden md:flex flex-col items-end">
                 <span className="text-sm font-semibold text-slate-800">{userRole === 'ADMIN' ? 'Admin' : currentUser?.name || 'Staff'}</span>
                 <span className="text-xs text-slate-500">{userRole === 'ADMIN' ? 'Quản lý cấp cao' : 'Nhân viên bán hàng'}</span>
               </div>
               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                 {userRole === 'ADMIN' ? 'AD' : (currentUser?.name?.charAt(0) || 'ST')}
               </div>
             </div>
           </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <OrderModal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        onSave={handleSaveOrder} 
        initialData={editingOrder}
        products={products}
        customers={customers}
        onQuickAddCustomer={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        products={products}
      />
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={editingCustomer}
      />
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
        initialData={editingSupplier}
      />
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onConfirm={handleInventoryUpdate}
        initialProduct={selectedProductForInventory}
        products={products}
        customers={customers}
        suppliers={suppliers}
        onQuickAddCustomer={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
        onQuickAddSupplier={() => { setEditingSupplier(null); setIsSupplierModalOpen(true); }}
      />
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        userId={currentUser?.id || ''}
      />
    </div>
  );
};

export default App;