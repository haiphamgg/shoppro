
export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  CONFIRMED = 'Đã xác nhận',
  SHIPPING = 'Đang giao',
  DELIVERED = 'Đã giao',
  CANCELLED = 'Đã hủy',
}

export type UserRole = 'ADMIN' | 'STAFF';

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_ORDERS'
  | 'MANAGE_ORDERS' 
  | 'VIEW_PRODUCTS'
  | 'MANAGE_PRODUCTS'
  | 'VIEW_CUSTOMERS'
  | 'VIEW_SUPPLIERS'
  | 'VIEW_INVENTORY'
  | 'MANAGE_INVENTORY'
  | 'VIEW_AI_ASSISTANT';

export interface User {
  id: string; // Database UUID
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  password?: string; // Only for creating/mocking/resetting
  createdAt?: string;
  permissions?: Permission[]; // List of specific permissions
}

export interface Customer {
  id: string; // Database UUID
  code: string; // Business ID (e.g. C001)
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string; // Database UUID
  code: string; // Business ID (e.g. S001)
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string; // Database UUID
  code: string; // Business ID (e.g. P001)
  name: string;
  model?: string; // Mẫu mã / Model
  unit?: string; // Đơn vị tính (Cái, Hộp, Kg...)
  price: number; // Giá bán
  importPrice: number; // Giá vốn (Giá nhập bình quân)
  stock: number;
  category: string;
  origin?: string;
  imageUrl?: string;
  // New fields
  expiryDate?: string; // Hạn sử dụng
  batchNumber?: string; // Số lô
  description?: string; // Mô tả chi tiết
  catalogUrl?: string; // Link tài liệu/Catalogue
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

export type ViewState = 'DASHBOARD' | 'ORDERS' | 'PRODUCTS' | 'CUSTOMERS' | 'SUPPLIERS' | 'INVENTORY_LOGS' | 'AI_ASSISTANT' | 'SETTINGS' | 'USERS';

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
  date: string; // Ngày ghi nhận trên phiếu (User input)
  timestamp: string; // Thời gian tạo hệ thống
}