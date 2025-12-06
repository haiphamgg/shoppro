
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderModal } from './components/OrderModal';
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/ProductModal';
import { InventoryModal } from './components/InventoryModal';
import { InventoryHistory } from './components/InventoryHistory';
import { InventoryReport } from './components/InventoryReport'; // Import
import { CustomerList } from './components/CustomerList';
import { CustomerModal } from './components/CustomerModal';
import { SupplierList } from './components/SupplierList';
import { SupplierModal } from './components/SupplierModal';
import { SupplierHistoryModal } from './components/SupplierHistoryModal';
import { DebtList } from './components/DebtList';
import { DebtPaymentModal } from './components/DebtPaymentModal';
import { UserList } from './components/UserList';
import { UserModal } from './components/UserModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AIAssistant } from './components/AIAssistant';
import { PromotionList } from './components/PromotionList';
import { PromotionModal } from './components/PromotionModal';
import { Auth } from './components/Auth';
import { ViewState, Order, Product, Customer, InventoryType, UserRole, InventoryLog, Supplier, User, Permission, Promotion, CustomerRank, OrderStatus } from './types';
import { dataService } from './services/dataService';
import { Menu, Bell, Loader2, Database, ShieldAlert, Copy, Check, ChevronDown, KeyRound, LogOut } from 'lucide-react';

// New Component for SQL Repair inside App.tsx to avoid new file
const SystemSettings: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const sqlCommand = `
-- 1. Inventory Logs & Basic Fields
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
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS old_stock NUMERIC;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS new_stock NUMERIC;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ DEFAULT now();

-- 2. Products
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

-- 3. Users
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'STAFF',
  phone TEXT,
  permissions JSONB,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. NEW: Supplier Debt & Customer Spending
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS debt NUMERIC DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS total_purchased NUMERIC DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spending NUMERIC DEFAULT 0;

-- 5. NEW: Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT,
  type TEXT, -- DISCOUNT_PERCENT, DISCOUNT_AMOUNT
  value NUMERIC,
  min_order_value NUMERIC,
  min_customer_spending NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Orders (Update for promotions)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promotion_id TEXT;

-- 7. NEW: Customer Ranks
CREATE TABLE IF NOT EXISTS customer_ranks (
  id TEXT PRIMARY KEY,
  name TEXT,
  min_spending NUMERIC,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. DISABLE RLS (Fix permission errors for all tables)
ALTER TABLE inventory_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ranks DISABLE ROW LEVEL SECURITY;

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
           Nếu bạn gặp lỗi <strong>"Could not find column"</strong>, <strong>"Relation does not exist"</strong> hoặc lỗi lưu dữ liệu, 
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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [ranks, setRanks] = useState<CustomerRank[]>([]);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // User Dropdown State
  const userMenuRef = useRef<HTMLDivElement>(null); // Ref for closing on click outside

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

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [isDebtPaymentModalOpen, setIsDebtPaymentModalOpen] = useState(false);
  const [selectedSupplierForDebt, setSelectedSupplierForDebt] = useState<Supplier | null>(null);

  const [isSupplierHistoryModalOpen, setIsSupplierHistoryModalOpen] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState<Supplier | null>(null);

  // Initial Data Fetching
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedOrders, fetchedProducts, fetchedCustomers, fetchedSuppliers, fetchedLogs, fetchedUsers, fetchedPromotions, fetchedRanks] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts(),
        dataService.getCustomers(),
        dataService.getSuppliers(),
        dataService.getInventoryLogs(),
        dataService.getUsers(),
        dataService.getPromotions(),
        dataService.getCustomerRanks()
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
      setSuppliers(fetchedSuppliers);
      setLogs(fetchedLogs);
      setUsers(fetchedUsers);
      setPromotions(fetchedPromotions);
      setRanks(fetchedRanks);

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
    const mockUser: User = {
        id: 'current-user-id',
        email: role === 'ADMIN' ? 'admin' : 'demo',
        name: role === 'ADMIN' ? 'Administrator' : 'Nhân viên bán hàng',
        role: role,
        permissions: role === 'ADMIN' ? [] : ['VIEW_DASHBOARD', 'VIEW_ORDERS', 'VIEW_PRODUCTS'] 
    };
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
  };

  const handleSaveError = (error: any, context: string) => {
    console.error(`Error saving ${context}:`, error);
    let message = 'Lỗi không xác định';
    
    try {
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (typeof error === 'object' && error !== null) {
            // Handle Supabase error object structure which can be { message: string, details: string, hint: string }
            if (error.message) {
                message = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
            } else if (error.error_description) {
                message = error.error_description;
            } else {
                message = JSON.stringify(error);
            }
        }
    } catch (e) {
        message = "Không thể xác định lỗi chi tiết.";
    }
    
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('relation') && lowerMsg.includes('does not exist')) {
        message = `Bảng dữ liệu cho "${context}" chưa được khởi tạo (Lỗi: Relation does not exist). \n\nVui lòng vào mục "Cài đặt hệ thống", COPY lệnh SQL và chạy trong Supabase SQL Editor để tạo bảng.`;
    } else if (lowerMsg.includes('column') || lowerMsg.includes('debt') || lowerMsg.includes('total_spending') || lowerMsg.includes('promotions') || lowerMsg.includes('total_purchased')) {
        message = `Database chưa được cập nhật cột mới (thiếu cột debt, total_purchased...). \n\nVui lòng vào "Cài đặt hệ thống" chạy lệnh SQL mới nhất.`;
    } else if (lowerMsg.includes('permission denied')) {
        message = `Lỗi quyền truy cập (RLS Policy). Hãy chạy lệnh "DISABLE ROW LEVEL SECURITY" trong Cài đặt hệ thống để khắc phục.`;
    }

    alert(`⚠️ Không thể lưu ${context}:\n${message}`);
  };

  // --- HANDLERS ---
  const handleSaveOrder = async (order: Order) => {
    const isEdit = !!editingOrder;
    if (isEdit) setOrders(orders.map(o => o.id === order.id ? order : o));
    else setOrders([order, ...orders]);
    
    if (currentView !== 'ORDERS') setCurrentView('ORDERS');
    
    try {
      // INVENTORY ADJUSTMENT LOGIC FOR EDITS
      if (isEdit && editingOrder) {
          // Only adjust if both were/are DELIVERED (meaning stock was deducted)
          // For simplicity in this version, we assume auto-created orders are DELIVERED.
          if (editingOrder.status === OrderStatus.DELIVERED && order.status === OrderStatus.DELIVERED) {
              const stockAdjustments: { product: Product, diff: number }[] = [];
              const productMap = new Map(products.map(p => [p.id, p]));

              // 1. Calculate Old Quantities
              const oldQtyMap = new Map<string, number>();
              editingOrder.items.forEach(item => {
                  oldQtyMap.set(item.productId, (oldQtyMap.get(item.productId) || 0) + item.quantity);
              });

              // 2. Calculate New Quantities
              const newQtyMap = new Map<string, number>();
              order.items.forEach(item => {
                  newQtyMap.set(item.productId, (newQtyMap.get(item.productId) || 0) + item.quantity);
              });

              // 3. Find Differences
              // Check all products involved
              const allProductIds = new Set([...oldQtyMap.keys(), ...newQtyMap.keys()]);
              
              allProductIds.forEach(pid => {
                  const oldQ = oldQtyMap.get(pid) || 0;
                  const newQ = newQtyMap.get(pid) || 0;
                  const diff = newQ - oldQ; // If positive, we sold more (reduce stock). If negative, we sold less (increase stock).
                  
                  if (diff !== 0) {
                      const product = productMap.get(pid);
                      if (product) {
                          stockAdjustments.push({ product, diff });
                      }
                  }
              });

              // 4. Apply Adjustments
              for (const adj of stockAdjustments) {
                  // If diff is positive (e.g. 5 -> 7, diff 2), we need to EXPORT 2 more.
                  // If diff is negative (e.g. 5 -> 3, diff -2), we need to IMPORT 2 back (return).
                  const type = adj.diff > 0 ? 'EXPORT' : 'IMPORT';
                  const absQty = Math.abs(adj.diff);
                  
                  await dataService.updateProductStock(
                      adj.product,
                      type,
                      absQty,
                      adj.product.price, // Use current price for reference
                      `Điều chỉnh đơn ${order.id}`,
                      order.id,
                      'Cập nhật tự động do sửa đơn hàng',
                      new Date().toISOString()
                  );
              }
              
              // Refresh products locally to show new stock
              const updatedProducts = await dataService.getProducts();
              setProducts(updatedProducts);
          }
      }

      if (isEdit) {
        await dataService.updateOrder(order);
      } else {
        const newOrder = await dataService.createOrder(order);
        setOrders(prev => prev.map(o => o.id === order.id ? newOrder : o));
      }
      // Refresh customer list to show new spending
      const updatedCustomers = await dataService.getCustomers();
      setCustomers(updatedCustomers);
    } catch (error: any) {
      handleSaveError(error, 'Đơn hàng');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Xóa đơn hàng này?')) return;
    setOrders(orders.filter(o => o.id !== id));
    try { 
        await dataService.deleteOrder(id); 
        // Refresh customer list potentially affected
        const updatedCustomers = await dataService.getCustomers();
        setCustomers(updatedCustomers);
    } catch (error) { handleSaveError(error, 'Xóa đơn hàng'); }
  };

  const handleSaveProduct = async (product: Product) => {
    const isEdit = !!editingProduct;
    if (isEdit) setProducts(products.map(p => p.id === product.id ? product : p));
    else setProducts([product, ...products]);
    
    try {
      if (isEdit) await dataService.updateProduct(product);
      else {
        const newProduct = await dataService.createProduct(product);
        setProducts(prev => prev.map(p => p.id === product.id ? newProduct : p));
      }
    } catch (error) { handleSaveError(error, 'Sản phẩm'); }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (userRole !== 'ADMIN') return alert("Bạn không có quyền xóa!");
    if (!window.confirm('Xóa sản phẩm này?')) return;
    setProducts(products.filter(p => p.id !== id));
    try { await dataService.deleteProduct(id); } catch (error) { handleSaveError(error, 'Xóa sản phẩm'); }
  };

  const handleInventoryUpdate = async (
      items: any[], 
      type: InventoryType, 
      supplierName: string, 
      doc: string, 
      note: string, 
      date: string,
      paidAmount: number = 0,
      discountAmount: number = 0,
      promotionId?: string
  ) => {
    const updatedProducts = [...products];
    const newLogs: InventoryLog[] = [];
    
    let totalBillValue = 0;
    
    // Use the user provided doc if available, otherwise generate a unique Order ID if it's an export
    let finalDocId = doc;
    if (type === 'EXPORT' && !finalDocId) {
        finalDocId = `EXP-${Date.now().toString().slice(-6)}`;
    }

    for (const item of items) {
       const productIndex = updatedProducts.findIndex(p => p.id === item.product.id);
       if (productIndex === -1) continue;
       const product = updatedProducts[productIndex];
       const newStock = type === 'IMPORT' ? product.stock + item.quantity : Math.max(0, product.stock - item.quantity);
       let newImportPrice = product.importPrice;
       
       if (type === 'IMPORT') {
           totalBillValue += item.quantity * item.price;
           if (item.price > 0) {
              const currentVal = product.stock * product.importPrice;
              const newVal = item.quantity * item.price;
              if (newStock > 0) newImportPrice = (currentVal + newVal) / newStock;
           }
       }

       updatedProducts[productIndex] = { ...product, stock: newStock, importPrice: Math.round(newImportPrice), price: (type==='IMPORT'&&item.newSellingPrice)?item.newSellingPrice:product.price };
       newLogs.push({
         id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, 
         productId: product.id, 
         productName: product.name, 
         type, 
         quantity: item.quantity, 
         oldStock: product.stock, 
         newStock, 
         price: item.price, 
         supplier: supplierName, 
         referenceDoc: finalDocId, 
         note, 
         timestamp: new Date().toISOString(), 
         date: date || new Date().toISOString()
       });
    }

    setProducts(updatedProducts);
    setLogs([...newLogs, ...logs]);

    try {
      // 1. Update Product Stock & Create Logs
      for (const item of items) {
        await dataService.updateProductStock(item.product, type, item.quantity, item.price, supplierName, finalDocId, note, date, item.newSellingPrice);
      }

      // 2. Handle Debt logic for Import
      if (type === 'IMPORT' && supplierName) {
          const supplier = suppliers.find(s => s.name === supplierName);
          if (supplier) {
              const debtIncrease = Math.max(0, totalBillValue - paidAmount);
              
              if (debtIncrease > 0 || totalBillValue > 0) {
                  await dataService.updateSupplierDebt(supplier.id, debtIncrease, totalBillValue);
                  // Refresh suppliers to show new debt
                  const updatedSuppliers = await dataService.getSuppliers();
                  setSuppliers(updatedSuppliers);
              }
          }
      }

      // 3. AUTO CREATE ORDER FOR EXPORT (Sales)
      if (type === 'EXPORT') {
          // Attempt to find customer by name from the supplierName field
          const customer = customers.find(c => c.name.trim().toLowerCase() === supplierName.trim().toLowerCase());
          
          const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          const finalAmount = Math.max(0, totalAmount - discountAmount);

          const newOrder: Order = {
              id: finalDocId || `ORD-${Date.now()}`,
              customerId: customer ? customer.id : 'GUEST',
              customerName: supplierName || 'Khách lẻ',
              items: items.map((item: any) => ({
                  productId: item.product.id,
                  productName: item.product.name,
                  quantity: item.quantity,
                  price: item.price
              })),
              totalAmount,
              discountAmount,
              finalAmount,
              promotionId,
              status: OrderStatus.DELIVERED, // Inventory is already deducted, so it's delivered
              date: date || new Date().toISOString()
          };

          // Save Order
          const createdOrder = await dataService.createOrder(newOrder);
          setOrders([createdOrder, ...orders]);
          
          // Refresh customer to update spending
          const updatedCustomers = await dataService.getCustomers();
          setCustomers(updatedCustomers);
      }

    } catch (error) { handleSaveError(error, 'Cập nhật kho/Đơn hàng'); }
  };

  const handlePayDebt = async (amount: number) => {
      if (!selectedSupplierForDebt) return;
      
      const supplierId = selectedSupplierForDebt.id;
      // Decrease debt, purchase amount doesn't change on payment
      try {
          await dataService.updateSupplierDebt(supplierId, -amount, 0);
          const updatedSuppliers = await dataService.getSuppliers();
          setSuppliers(updatedSuppliers);
      } catch (error) {
          handleSaveError(error, 'Thanh toán nợ');
      }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    const isEdit = !!editingCustomer;
    if (isEdit) setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    else setCustomers([customer, ...customers]);

    try {
      if (isEdit) await dataService.updateCustomer(customer);
      else {
        const newCustomer = await dataService.createCustomer(customer);
        setCustomers(prev => prev.map(c => c.id === customer.id ? newCustomer : c));
      }
    } catch (error) { handleSaveError(error, 'Khách hàng'); }
  };
  
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Xóa khách hàng?')) return;
    setCustomers(customers.filter(c => c.id !== id));
    try { await dataService.deleteCustomer(id); } catch (error) { handleSaveError(error, 'Xóa khách hàng'); }
  };

  const handleUpdateRanks = async (newRanks: CustomerRank[]) => {
      setRanks(newRanks);
      try {
          await dataService.saveCustomerRanks(newRanks);
      } catch (error) { handleSaveError(error, 'Cấu hình hạng thành viên'); }
  };

  const handleRecalculateSpending = async () => {
      if (!window.confirm("Hệ thống sẽ tính toán lại toàn bộ chi tiêu dựa trên đơn hàng 'Đã giao' cho tất cả khách hàng. Quá trình này có thể mất vài giây. Bạn có chắc chắn?")) return;
      setIsLoading(true);
      try {
          await dataService.recalculateAllCustomerSpending();
          const updatedCustomers = await dataService.getCustomers();
          setCustomers(updatedCustomers);
          alert("Đã cập nhật chi tiêu thành công!");
      } catch (error) {
          handleSaveError(error, "Tính lại chi tiêu");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSaveSupplier = async (supplier: Supplier) => {
    const isEdit = !!editingSupplier;
    if (isEdit) setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
    else setSuppliers([supplier, ...suppliers]);

    try {
      if (isEdit) await dataService.updateSupplier(supplier);
      else {
        const newSupplier = await dataService.createSupplier(supplier);
        setSuppliers(prev => prev.map(s => s.id === supplier.id ? newSupplier : s));
      }
    } catch (error) { handleSaveError(error, 'Nhà cung cấp'); }
  };
  
  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Xóa nhà cung cấp?')) return;
    setSuppliers(suppliers.filter(s => s.id !== id));
    try { await dataService.deleteSupplier(id); } catch (error) { handleSaveError(error, 'Xóa nhà cung cấp'); }
  };

  const handleSaveUser = async (user: User) => {
    if (userRole !== 'ADMIN') return;
    const isEdit = !!editingUser;
    if (isEdit) setUsers(users.map(u => u.id === user.id ? user : u));
    else setUsers([user, ...users]);
    try {
      if (isEdit) await dataService.updateUser(user);
      else {
        const newUser = await dataService.createUser(user);
        setUsers(prev => prev.map(u => u.id === user.id ? newUser : u));
      }
    } catch (error) { handleSaveError(error, 'Nhân viên'); }
  };

  const handleDeleteUser = async (id: string) => {
    if (userRole !== 'ADMIN') return;
    if (!window.confirm('Xóa nhân viên?')) return;
    setUsers(users.filter(u => u.id !== id));
    try { await dataService.deleteUser(id); } catch (error) { handleSaveError(error, 'Xóa nhân viên'); }
  };

  // --- PROMOTIONS HANDLER ---
  const handleSavePromotion = async (promo: Promotion) => {
      const isEdit = !!editingPromotion;
      if (isEdit) setPromotions(promotions.map(p => p.id === promo.id ? promo : p));
      else setPromotions([promo, ...promotions]);
      
      try {
          if (isEdit) await dataService.updatePromotion(promo);
          else {
              const newPromo = await dataService.createPromotion(promo);
              setPromotions(prev => prev.map(p => p.id === promo.id ? newPromo : p));
          }
      } catch (error) { handleSaveError(error, 'Khuyến mãi'); }
  };

  const handleDeletePromotion = async (id: string) => {
      if (!window.confirm('Xóa khuyến mãi?')) return;
      setPromotions(promotions.filter(p => p.id !== id));
      try { await dataService.deletePromotion(id); } catch (error) { handleSaveError(error, 'Xóa khuyến mãi'); }
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
      case 'DASHBOARD': return <Dashboard userRole={userRole} orders={orders} products={products} logs={logs} />;
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
      case 'INVENTORY_LOGS': return <InventoryHistory logs={logs} />;
      case 'INVENTORY_REPORT': return <InventoryReport products={products} logs={logs} orders={orders} />; // Pass logs and orders
      case 'CUSTOMERS':
        return (
          <CustomerList
            customers={customers}
            onAddCustomer={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
            onEditCustomer={(c) => { setEditingCustomer(c); setIsCustomerModalOpen(true); }}
            onDeleteCustomer={handleDeleteCustomer}
            ranks={ranks}
            onUpdateRanks={handleUpdateRanks}
            onRecalculateSpending={handleRecalculateSpending}
          />
        );
      case 'SUPPLIERS':
        return (
          <SupplierList
            suppliers={suppliers}
            onAddSupplier={() => { setEditingSupplier(null); setIsSupplierModalOpen(true); }}
            onEditSupplier={(s) => { setEditingSupplier(s); setIsSupplierModalOpen(true); }}
            onDeleteSupplier={handleDeleteSupplier}
            onViewHistory={(s) => { setSelectedSupplierForHistory(s); setIsSupplierHistoryModalOpen(true); }}
          />
        );
      case 'DEBT':
          return (
              <DebtList 
                  suppliers={suppliers} 
                  onPayDebt={(s) => { setSelectedSupplierForDebt(s); setIsDebtPaymentModalOpen(true); }} 
              />
          );
      case 'PROMOTIONS':
          return (
              <PromotionList
                  promotions={promotions}
                  onAddPromotion={() => { setEditingPromotion(null); setIsPromotionModalOpen(true); }}
                  onEditPromotion={(p) => { setEditingPromotion(p); setIsPromotionModalOpen(true); }}
                  onDeletePromotion={handleDeletePromotion}
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
      case 'AI_ASSISTANT': return <AIAssistant orders={orders} products={products} />;
      // @ts-ignore
      case 'SETTINGS': return <SystemSettings />;
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
        userRole={userRole}
        user={currentUser}
      />
      
      <main className="flex-1 lg:ml-0 flex flex-col min-w-0 transition-all duration-300">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Menu size={24} /></button>
             <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
               {currentView === 'DASHBOARD' && 'Bảng điều khiển'}
               {currentView === 'ORDERS' && 'Quản lý đơn hàng'}
               {currentView === 'PROMOTIONS' && 'Chương trình khuyến mãi'}
               {currentView === 'AI_ASSISTANT' && 'Trợ lý AI'}
               {currentView === 'PRODUCTS' && 'Kho sản phẩm'}
               {currentView === 'INVENTORY_LOGS' && 'Lịch sử kho hàng'}
               {currentView === 'INVENTORY_REPORT' && 'Báo cáo tồn kho'}
               {currentView === 'CUSTOMERS' && 'Danh sách khách hàng'}
               {currentView === 'SUPPLIERS' && 'Danh sách Nhà cung cấp'}
               {currentView === 'DEBT' && 'Quản lý công nợ'}
               {currentView === 'USERS' && 'Quản lý nhân sự'}
               {/* @ts-ignore */}
               {currentView === 'SETTINGS' && 'Cài đặt hệ thống'}
             </h2>
           </div>
           <div className="flex items-center gap-3 sm:gap-6">
             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
             <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
             
             {/* User Profile Dropdown Area */}
             <div className="relative" ref={userMenuRef}>
                <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 pl-2 sm:pl-0 focus:outline-none hover:opacity-80 transition-opacity"
                >
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-800">{userRole === 'ADMIN' ? 'Admin' : currentUser?.name || 'Staff'}</span>
                        <span className="text-xs text-slate-500">{userRole === 'ADMIN' ? 'Quản lý cấp cao' : 'Nhân viên bán hàng'}</span>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                        {userRole === 'ADMIN' ? 'AD' : (currentUser?.name?.charAt(0) || 'ST')}
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in z-50">
                        <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                            <p className="text-sm font-bold text-slate-800">{userRole === 'ADMIN' ? 'Admin' : currentUser?.name || 'Staff'}</p>
                            <p className="text-xs text-slate-500">{userRole === 'ADMIN' ? 'Quản lý cấp cao' : 'Nhân viên bán hàng'}</p>
                        </div>
                        <button 
                            onClick={() => {
                                setIsUserMenuOpen(false);
                                setIsChangePasswordModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                        >
                            <KeyRound size={18} />
                            Đổi mật khẩu
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        <button 
                            onClick={() => {
                                setIsUserMenuOpen(false);
                                setIsAuthenticated(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    </div>
                )}
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
      <PromotionModal
          isOpen={isPromotionModalOpen}
          onClose={() => setIsPromotionModalOpen(false)}
          onSave={handleSavePromotion}
          initialData={editingPromotion}
      />
      <DebtPaymentModal
          isOpen={isDebtPaymentModalOpen}
          onClose={() => setIsDebtPaymentModalOpen(false)}
          onConfirm={handlePayDebt}
          supplier={selectedSupplierForDebt}
      />
      <SupplierHistoryModal
          isOpen={isSupplierHistoryModalOpen}
          onClose={() => setIsSupplierHistoryModalOpen(false)}
          supplier={selectedSupplierForHistory}
          logs={logs}
      />
    </div>
  );
};

export default App;
