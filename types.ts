export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  CONFIRMED = 'Đã xác nhận',
  SHIPPING = 'Đang giao',
  DELIVERED = 'Đã giao',
  CANCELLED = 'Đã hủy',
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
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
  orders: number;
}

export type ViewState = 'DASHBOARD' | 'ORDERS' | 'PRODUCTS' | 'CUSTOMERS' | 'AI_ASSISTANT';