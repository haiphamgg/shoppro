
import { Order, OrderStatus, Product, SalesData, InventoryLog, Supplier } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'P001', 
    name: 'Cơm Tấm Sườn Bì Chả', 
    price: 45000, 
    importPrice: 25000,
    stock: 50, 
    category: 'Món ăn',
    origin: 'Bếp trung tâm',
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=500'
  },
  { 
    id: 'P002', 
    name: 'Áo Thun Polo Classic', 
    price: 250000, 
    importPrice: 150000,
    stock: 120, 
    category: 'Thời trang',
    origin: 'Việt Nam',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500'
  },
  { 
    id: 'P003', 
    name: 'Nước Mắm Hạnh Phúc 500ml', 
    price: 120000, 
    importPrice: 95000,
    stock: 30, 
    category: 'Hàng hóa',
    origin: 'Phú Quốc',
    imageUrl: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&q=80&w=500'
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
    name: 'Trà Sữa Trân Châu Đường Đen', 
    price: 35000, 
    importPrice: 15000,
    stock: 200, 
    category: 'Món ăn',
    origin: 'Pha chế',
    imageUrl: 'https://images.unsplash.com/photo-1558584725-c1f0da4b1d60?auto=format&fit=crop&q=80&w=500'
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2023-001',
    customerId: 'C001',
    customerName: 'Nguyễn Văn A',
    items: [{ productId: 'P001', productName: 'Cơm Tấm Sườn Bì Chả', quantity: 2, price: 45000 }],
    totalAmount: 90000,
    status: OrderStatus.DELIVERED,
    date: '2023-10-15T09:30:00Z'
  },
  {
    id: 'ORD-2023-002',
    customerId: 'C002',
    customerName: 'Trần Thị B',
    items: [{ productId: 'P002', productName: 'Áo Thun Polo Classic', quantity: 1, price: 250000 }],
    totalAmount: 250000,
    status: OrderStatus.SHIPPING,
    date: '2023-10-20T14:15:00Z'
  },
  {
    id: 'ORD-2023-003',
    customerId: 'C003',
    customerName: 'Lê Văn C',
    items: [
      { productId: 'P003', productName: 'Nước Mắm Hạnh Phúc 500ml', quantity: 2, price: 120000 },
      { productId: 'P005', productName: 'Trà Sữa Trân Châu Đường Đen', quantity: 1, price: 35000 }
    ],
    totalAmount: 275000,
    status: OrderStatus.PENDING,
    date: '2023-10-25T10:00:00Z'
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
    productName: 'Cơm Tấm Sườn Bì Chả',
    type: 'IMPORT',
    quantity: 50,
    oldStock: 0,
    newStock: 50,
    note: 'Nhập nguyên liệu đầu ngày',
    timestamp: '2023-10-01T08:00:00Z'
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'S001', name: 'Công ty Thực Phẩm Sạch', phone: '02838640800', email: 'orders@cleanfood.vn', address: 'KCN Tân Bình, HCM' },
  { id: 'S002', name: 'Kho Hàng Gia Dụng Tổng Hợp', phone: '0909123456', email: 'sales@giadung.com', address: 'Q12, TP.HCM' },
  { id: 'S003', name: 'Xưởng May Mặc Thời Trang', phone: '0987654321', email: 'fashion@workshop.vn', address: 'Hóc Môn, TP.HCM' }
];
