
import { Order, OrderStatus, Product, SalesData, InventoryLog } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'P001', 
    name: 'Áo Thun Basic Premium', 
    price: 250000, 
    importPrice: 150000,
    stock: 120, 
    category: 'Thời trang',
    origin: 'Việt Nam',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500'
  },
  { 
    id: 'P002', 
    name: 'Quần Jeans Slim Fit', 
    price: 450000, 
    importPrice: 280000,
    stock: 50, 
    category: 'Thời trang',
    origin: 'Việt Nam',
    imageUrl: 'https://images.unsplash.com/photo-1542272617-08f08315805d?auto=format&fit=crop&q=80&w=500'
  },
  { 
    id: 'P003', 
    name: 'Giày Sneaker Sport', 
    price: 1200000, 
    importPrice: 800000,
    stock: 30, 
    category: 'Giày dép',
    origin: 'Hàn Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500'
  },
  { 
    id: 'P004', 
    name: 'Balo Laptop Chống Nước', 
    price: 650000, 
    importPrice: 400000,
    stock: 45, 
    category: 'Phụ kiện',
    origin: 'Trung Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=500'
  },
  { 
    id: 'P005', 
    name: 'Đồng Hồ Thông Minh Gen 2', 
    price: 3500000, 
    importPrice: 2800000,
    stock: 15, 
    category: 'Điện tử',
    origin: 'Mỹ',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500'
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2023-001',
    customerId: 'C001',
    customerName: 'Nguyễn Văn A',
    items: [{ productId: 'P001', productName: 'Áo Thun Basic Premium', quantity: 2, price: 250000 }],
    totalAmount: 500000,
    status: OrderStatus.DELIVERED,
    date: '2023-10-15T09:30:00Z'
  },
  {
    id: 'ORD-2023-002',
    customerId: 'C002',
    customerName: 'Trần Thị B',
    items: [{ productId: 'P005', productName: 'Đồng Hồ Thông Minh Gen 2', quantity: 1, price: 3500000 }],
    totalAmount: 3500000,
    status: OrderStatus.SHIPPING,
    date: '2023-10-20T14:15:00Z'
  },
  {
    id: 'ORD-2023-003',
    customerId: 'C003',
    customerName: 'Lê Văn C',
    items: [
      { productId: 'P002', productName: 'Quần Jeans Slim Fit', quantity: 1, price: 450000 },
      { productId: 'P004', productName: 'Balo Laptop Chống Nước', quantity: 1, price: 650000 }
    ],
    totalAmount: 1100000,
    status: OrderStatus.PENDING,
    date: '2023-10-25T10:00:00Z'
  },
  {
    id: 'ORD-2023-004',
    customerId: 'C004',
    customerName: 'Phạm Thị D',
    items: [{ productId: 'P003', productName: 'Giày Sneaker Sport', quantity: 1, price: 1200000 }],
    totalAmount: 1200000,
    status: OrderStatus.CONFIRMED,
    date: '2023-10-26T16:45:00Z'
  },
  {
    id: 'ORD-2023-005',
    customerId: 'C005',
    customerName: 'Hoàng Văn E',
    items: [{ productId: 'P001', productName: 'Áo Thun Basic Premium', quantity: 5, price: 250000 }],
    totalAmount: 1250000,
    status: OrderStatus.CANCELLED,
    date: '2023-10-22T08:20:00Z'
  }
];

export const SALES_DATA: SalesData[] = [
  { month: 'Thg 5', revenue: 12000000, profit: 4500000, orders: 45 },
  { month: 'Thg 6', revenue: 15500000, profit: 5200000, orders: 52 },
  { month: 'Thg 7', revenue: 18000000, profit: 6800000, orders: 60 },
  { month: 'Thg 8', revenue: 14000000, profit: 4100000, orders: 48 },
  { month: 'Thg 9', revenue: 22000000, profit: 8500000, orders: 75 },
  { month: 'Thg 10', revenue: 25000000, profit: 9200000, orders: 82 },
];

export const MOCK_LOGS: InventoryLog[] = [
  {
    id: 'LOG-001',
    productId: 'P001',
    productName: 'Áo Thun Basic Premium',
    type: 'IMPORT',
    quantity: 50,
    oldStock: 70,
    newStock: 120,
    note: 'Nhập hàng đầu tháng',
    timestamp: '2023-10-01T08:00:00Z'
  },
  {
    id: 'LOG-002',
    productId: 'P003',
    productName: 'Giày Sneaker Sport',
    type: 'EXPORT',
    quantity: 5,
    oldStock: 35,
    newStock: 30,
    note: 'Xuất hủy do lỗi',
    timestamp: '2023-10-05T14:30:00Z'
  }
];
