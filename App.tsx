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
import { AIAssistant } from './components/AIAssistant';
import { Auth } from './components/Auth';
import { ViewState, Order, Product, Customer, InventoryType, UserRole, InventoryLog } from './types';
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
      const [fetchedOrders, fetchedProducts, fetchedCustomers, fetchedLogs] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts(),
        dataService.getCustomers(),
        dataService.getInventoryLogs()
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
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

  // --- HANDLERS: ORDERS ---
  const handleSaveOrder = async (order: Order) => {
    const isEdit = !!editingOrder;
    if (isEdit) setOrders(orders.map(o => o.id === order.id ? order : o));
    else setOrders([order, ...orders]);
    
    if (currentView !== 'ORDERS') setCurrentView('ORDERS');
    try {
      if (isEdit) await dataService.updateOrder(order);
      else await dataService.createOrder(order);
    } catch { loadData(); }
  };
  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Xóa đơn hàng này?')) return;
    setOrders(orders.filter(o => o.id !== id));
    try { await dataService.deleteOrder(id); } catch { loadData(); }
  };

  // --- HANDLERS: PRODUCTS & INVENTORY ---
  const handleSaveProduct = async (product: Product) => {
    const isEdit = !!editingProduct;
    if (isEdit) setProducts(products.map(p => p.id === product.id ? product : p));
    else setProducts([product, ...products]);
    
    try {
      if (isEdit) await dataService.updateProduct(product);
      else await dataService.createProduct(product);
    } catch { loadData(); }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (userRole !== 'ADMIN') {
      alert("Chỉ Admin mới có quyền xóa sản phẩm!");
      return;
    }
    if (!window.confirm('Xóa sản phẩm này?')) return;
    setProducts(products.filter(p => p.id !== id));
    try { await dataService.deleteProduct(id); } catch { loadData(); }
  };

  const handleInventoryUpdate = async (
    product: Product, 
    type: InventoryType, 
    quantity: number, 
    price: number,
    supplier: string,
    doc: string,
    note: string
  ) => {
    const newStock = type === 'IMPORT' 
      ? product.stock + quantity 
      : Math.max(0, product.stock - quantity);

    // Tính lại giá vốn (Optimistic UI)
    let newImportPrice = product.importPrice;
    if (type === 'IMPORT' && price > 0) {
       const currentVal = product.stock * product.importPrice;
       const newVal = quantity * price;
       if (newStock > 0) newImportPrice = (currentVal + newVal) / newStock;
    }

    // Optimistic Update Product
    const updatedProduct = { ...product, stock: newStock, importPrice: Math.round(newImportPrice) };
    setProducts(products.map(p => p.id === product.id ? updatedProduct : p));

    // Optimistic Update Logs
    const newLog: InventoryLog = {
      id: `LOG-TEMP-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type,
      quantity,
      oldStock: product.stock,
      newStock,
      price,
      supplier,
      referenceDoc: doc,
      note,
      timestamp: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);

    try {
      await dataService.updateProductStock(product, type, quantity, price, supplier, doc, note);
    } catch {
      loadData(); // Revert on fail
    }
  };

  // --- HANDLERS: CUSTOMERS ---
  const handleSaveCustomer = async (customer: Customer) => {
    const isEdit = !!editingCustomer;
    if (isEdit) setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    else setCustomers([customer, ...customers]);

    try {
      if (isEdit) await dataService.updateCustomer(customer);
      else await dataService.createCustomer(customer);
    } catch { loadData(); }
  };
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Xóa khách hàng này?')) return;
    setCustomers(customers.filter(c => c.id !== id));
    try { await dataService.deleteCustomer(id); } catch { loadData(); }
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
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onConfirm={handleInventoryUpdate}
        product={selectedProductForInventory}
      />
    </div>
  );
};

export default App;