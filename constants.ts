import { Order, OrderStatus, Product, SalesData } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Áo Thun Basic Premium', price: 250000, stock: 120, category: 'Thời trang' },
  { id: 'P002', name: 'Quần Jeans Slim Fit', price: 450000, stock: 50, category: 'Thời trang' },
  { id: 'P003', name: 'Giày Sneaker Sport', price: 1200000, stock: 30, category: 'Giày dép' },
  { id: 'P004', name: 'Balo Laptop Chống Nước', price: 650000, stock: 45, category: 'Phụ kiện' },
  { id: 'P005', name: 'Đồng Hồ Thông Minh Gen 2', price: 3500000, stock: 15, category: 'Điện tử' },
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
  { month: 'Thg 5', revenue: 12000000, orders: 45 },
  { month: 'Thg 6', revenue: 15500000, orders: 52 },
  { month: 'Thg 7', revenue: 18000000, orders: 60 },
  { month: 'Thg 8', revenue: 14000000, orders: 48 },
  { month: 'Thg 9', revenue: 22000000, orders: 75 },
  { month: 'Thg 10', revenue: 25000000, orders: 82 },
];