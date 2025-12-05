import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, Product, OrderStatus, Customer } from '../types';
import { MOCK_ORDERS, MOCK_PRODUCTS } from '../constants';

// --- MAPPING HELPERS ---

const mapRowToOrder = (row: any): Order => ({
  id: row.id,
  customerId: row.customer_id || 'GUEST',
  customerName: row.customer_name || 'Khách lẻ',
  items: row.items || [],
  totalAmount: Number(row.total_amount) || 0,
  status: (row.status as OrderStatus) || OrderStatus.PENDING,
  date: row.created_at || new Date().toISOString()
});

const mapOrderToRow = (order: Order) => ({
  id: order.id,
  customer_id: order.customerId,
  customer_name: order.customerName,
  items: order.items,
  total_amount: order.totalAmount,
  status: order.status,
  created_at: order.date
});

const mapRowToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price) || 0,
  stock: Number(row.stock) || 0,
  category: row.category || 'Khác'
});

const mapProductToRow = (product: Product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  stock: product.stock,
  category: product.category
});

const mapRowToCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || ''
});

const mapCustomerToRow = (customer: Customer) => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  address: customer.address
});

// --- SERVICE ---

export const dataService = {
  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured) return MOCK_ORDERS;
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) return MOCK_ORDERS;
      return data && data.length > 0 ? data.map(mapRowToOrder) : [];
    } catch (err) { return MOCK_ORDERS; }
  },

  async createOrder(order: Order): Promise<Order> {
    if (!isSupabaseConfigured) return order;
    const row = mapOrderToRow(order);
    const { data, error } = await supabase.from('orders').insert([row]).select().single();
    if (error) throw error;
    return mapRowToOrder(data);
  },

  async updateOrder(order: Order): Promise<Order> {
    if (!isSupabaseConfigured) return order;
    const row = mapOrderToRow(order);
    const { data, error } = await supabase.from('orders')
      .update({ customer_name: row.customer_name, items: row.items, total_amount: row.total_amount, status: row.status })
      .eq('id', order.id).select().single();
    if (error) throw error;
    return mapRowToOrder(data);
  },

  async deleteOrder(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return MOCK_PRODUCTS;
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) return MOCK_PRODUCTS; // Fallback
      return data && data.length > 0 ? data.map(mapRowToProduct) : MOCK_PRODUCTS;
    } catch { return MOCK_PRODUCTS; }
  },

  async createProduct(product: Product): Promise<Product> {
    if (!isSupabaseConfigured) return product;
    const row = mapProductToRow(product);
    const { data, error } = await supabase.from('products').insert([row]).select().single();
    if (error) throw error;
    return mapRowToProduct(data);
  },

  async updateProduct(product: Product): Promise<Product> {
    if (!isSupabaseConfigured) return product;
    const row = mapProductToRow(product);
    const { data, error } = await supabase.from('products').update(row).eq('id', product.id).select().single();
    if (error) throw error;
    return mapRowToProduct(data);
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data ? data.map(mapRowToCustomer) : [];
    } catch { return []; }
  },

  async createCustomer(customer: Customer): Promise<Customer> {
    if (!isSupabaseConfigured) return customer;
    const row = mapCustomerToRow(customer);
    const { data, error } = await supabase.from('customers').insert([row]).select().single();
    if (error) throw error;
    return mapRowToCustomer(data);
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    if (!isSupabaseConfigured) return customer;
    const row = mapCustomerToRow(customer);
    const { data, error } = await supabase.from('customers').update(row).eq('id', customer.id).select().single();
    if (error) throw error;
    return mapRowToCustomer(data);
  },

  async deleteCustomer(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  }
};