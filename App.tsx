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
import { AIAssistant } from './components/AIAssistant';
import { Auth } from './components/Auth';
import { ViewState, Order, Product, Customer, InventoryType, UserRole, InventoryLog, Supplier } from './types';
import { dataService } from './services/dataService';
import { Menu, Bell, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('STAFF');
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);

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

  // Initial Data Fetching
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedOrders, fetchedProducts, fetchedCustomers, fetchedSuppliers, fetchedLogs] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts(),
        dataService.getCustomers(),
        dataService.getSuppliers(),
        dataService.getInventoryLogs()
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
      setSuppliers(fetchedSuppliers);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  // Helper to handle save errors gracefully
  const handleSaveError = (error: any, context: string) => {
    // Log detailed error to console
    console.error(`Error saving ${context} (Raw):`, error);
    if (typeof error === 'object') {
        try {
            console.error(`Error saving ${context} (JSON):`, JSON.stringify(error, null, 2));
        } catch(e) {}
    }
    
    let message = 'Lỗi không xác định';
    
    try {
      if (typeof error === 'string') {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      } else if (error && typeof error === 'object') {
        // Handle Supabase/Postgrest Error Object
        const msg = error.message || error.error_description || error.msg;
        const details = error.details || error.hint;
        const code = error.code;

        // Check for specific Postgres error codes
        if (code === '42703') { // undefined_column
            message = `Lỗi cấu trúc dữ liệu: Cột không tồn tại trong Database.\n\nNguyên nhân: Bạn đang cố lưu các trường mới (như code, expiry_date...) nhưng bảng trong Supabase chưa có các cột này.\n\nGiải pháp: Hãy vào Supabase > SQL Editor và chạy lệnh thêm cột.`;
        } else if (msg) {
             message = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
             if (details) message += `\nChi tiết: ${details}`;
             if (code) message += ` (Code: ${code})`;
        } else {
             message = JSON.stringify(error, null, 2);
        }
      }
    } catch (e) {
      message = 'Lỗi nghiêm trọng khi đọc thông báo lỗi.';
    }

    // Final safety check
    if (!message || message === '{}' || message.includes('[object Object]')) {
         try {
             message = JSON.stringify(error, null, 2);
         } catch {
             message = "Không thể đọc chi tiết lỗi. Vui lòng xem Console (F12) để biết thêm.";
         }
    }

    alert(`⚠️ Không thể lưu ${context}:\n\n${message}`);
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
      handleSaveError(error, 'Sản phẩm');
      if (!isEdit) setProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (userRole !== 'ADMIN') {
      alert("Chỉ Admin mới có quyền xóa sản phẩm!");
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
    items: { product: Product, quantity: number, price: number }[],
    type: InventoryType,
    supplier: string,
    doc: string,
    note: string
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

       // Update Product Object
       updatedProducts[productIndex] = { ...product, stock: newStock, importPrice: Math.round(newImportPrice) };

       // Create Log
       newLogs.push({
         id: `LOG-${Date.now()}-${Math.random()}`,
         productId: product.id,
         productName: product.name,
         type,
         quantity: item.quantity,
         oldStock: product.stock,
         newStock,
         price: item.price,
         supplier,
         referenceDoc: doc,
         note,
         timestamp
       });
    }

    setProducts(updatedProducts);
    setLogs([...newLogs, ...logs]);

    // Async Server Update
    try {
      // Execute sequentially to ensure order
      for (const item of items) {
        // Use updatedProducts state to ensure we have latest version if needed, 
        // but currently we pass item.product which is fine as logic is in backend too.
        await dataService.updateProductStock(item.product, type, item.quantity, item.price, supplier, doc, note);
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
      case 'AI_ASSISTANT':
        return <AIAssistant orders={orders} products={products} />;
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
             </h2>
           </div>
           <div className="flex items-center gap-3 sm:gap-6">
             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
             <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
             <div className="flex items-center gap-3 pl-2 sm:pl-0">
               <div className="hidden md:flex flex-col items-end">
                 <span className="text-sm font-semibold text-slate-800">{userRole === 'ADMIN' ? 'Admin' : 'Staff'}</span>
                 <span className="text-xs text-slate-500">{userRole === 'ADMIN' ? 'Quản lý cấp cao' : 'Nhân viên bán hàng'}</span>
               </div>
               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                 {userRole === 'ADMIN' ? 'AD' : 'ST'}
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
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
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
      />
    </div>
  );
};

export default App;