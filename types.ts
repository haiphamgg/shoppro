
export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  CONFIRMED = 'Đã xác nhận',
  SHIPPING = 'Đang giao',
  DELIVERED = 'Đã giao',
  CANCELLED = 'Đã hủy',
}

export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  email: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // Giá bán
  importPrice: number; // Giá vốn (Giá nhập bình quân)
  stock: number;
  category: string;
  origin?: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string; // ISO string
}

export interface SalesData {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
}

export type ViewState = 'DASHBOARD' | 'ORDERS' | 'PRODUCTS' | 'CUSTOMERS' | 'SUPPLIERS' | 'INVENTORY_LOGS' | 'AI_ASSISTANT';

export type InventoryType = 'IMPORT' | 'EXPORT';

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: InventoryType;
  quantity: number;
  oldStock: number;
  newStock: number;
  price?: number; // Giá tại thời điểm giao dịch
  supplier?: string; // Nhà cung cấp hoặc Khách hàng/Bộ phận nhận
  referenceDoc?: string; // Mã phiếu/Hóa đơn
  note: string;
  timestamp: string;
}
