import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, Product, OrderStatus, Customer, InventoryLog, InventoryType, Supplier } from '../types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_LOGS, MOCK_SUPPLIERS } from '../constants';

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
  importPrice: Number(row.import_price) || 0,
  stock: Number(row.stock) || 0,
  category: row.category || 'Khác',
  origin: row.origin || 'Chưa rõ',
  imageUrl: row.image_url || ''
});

const mapProductToRow = (product: Product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  import_price: product.importPrice,
  stock: product.stock,
  category: product.category,
  origin: product.origin,
  image_url: product.imageUrl
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

const mapRowToSupplier = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || ''
});

const mapSupplierToRow = (supplier: Supplier) => ({
  id: supplier.id,
  name: supplier.name,
  email: supplier.email,
  phone: supplier.phone,
  address: supplier.address
});

const mapRowToLog = (row: any): InventoryLog => ({
  id: row.id,
  productId: row.product_id,
  productName: row.products?.name || 'Unknown Product',
  type: row.type as InventoryType,
  quantity: row.quantity,
  oldStock: row.old_stock,
  newStock: row.new_stock,
  price: Number(row.price) || 0,
  supplier: row.supplier,
  referenceDoc: row.reference_doc,
  note: row.note,
  timestamp: row.created_at
});

// --- SERVICE ---

export const dataService = {
  // --- UTILS ---
  async uploadImage(file: File): Promise<string> {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1000));
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        // Suppress 'Bucket not found' error as it's common in dev/demo environments
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          console.warn('Storage bucket "product-images" missing. Using local URL.');
        } else {
          console.error('Upload Error:', uploadError);
        }
        // Fallback to local URL if upload fails
        return URL.createObjectURL(file);
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.warn('Upload failed, using local preview:', error);
      return URL.createObjectURL(file);
    }
  },

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
      if (error) return MOCK_PRODUCTS; 
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

  async updateProductStock(
    product: Product, 
    type: InventoryType, 
    quantity: number, 
    transactionPrice: number, 
    supplier: string,
    referenceDoc: string,
    note: string
  ): Promise<void> {
    const newStock = type === 'IMPORT' ? product.stock + quantity : product.stock - quantity;
    
    // TÍNH GIÁ VỐN BÌNH QUÂN
    let newImportPrice = product.importPrice;
    
    if (type === 'IMPORT' && transactionPrice > 0) {
      const currentTotalValue = product.stock * product.importPrice;
      const newImportValue = quantity * transactionPrice;
      if (newStock > 0) {
        newImportPrice = (currentTotalValue + newImportValue) / newStock;
      } else {
        newImportPrice = transactionPrice;
      }
    }

    if (!isSupabaseConfigured) return;

    const { error: prodError } = await supabase.from('products')
      .update({ 
        stock: newStock,
        import_price: Math.round(newImportPrice)
      })
      .eq('id', product.id);
      
    if (prodError) throw prodError;

    const { error: logError } = await supabase.from('inventory_logs').insert([{
      product_id: product.id,
      type,
      quantity,
      old_stock: product.stock,
      new_stock: newStock,
      price: transactionPrice,
      supplier,
      reference_doc: referenceDoc,
      note
    }]);
    
    if (logError) console.error("Error logging inventory", logError);
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // --- INVENTORY LOGS ---
  async getInventoryLogs(): Promise<InventoryLog[]> {
    if (!isSupabaseConfigured) return MOCK_LOGS;
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select(`*, products(name)`)
        .order('created_at', { ascending: false });
      
      if (error) return MOCK_LOGS;
      return data.map(mapRowToLog);
    } catch { return MOCK_LOGS; }
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
  },

  // --- SUPPLIERS ---
  async getSuppliers(): Promise<Supplier[]> {
    if (!isSupabaseConfigured) return MOCK_SUPPLIERS;
    try {
      const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
      if (error) return MOCK_SUPPLIERS;
      return data ? data.map(mapRowToSupplier) : [];
    } catch { return MOCK_SUPPLIERS; }
  },

  async createSupplier(supplier: Supplier): Promise<Supplier> {
    if (!isSupabaseConfigured) return supplier;
    const row = mapSupplierToRow(supplier);
    const { data, error } = await supabase.from('suppliers').insert([row]).select().single();
    if (error) throw error;
    return mapRowToSupplier(data);
  },

  async updateSupplier(supplier: Supplier): Promise<Supplier> {
    if (!isSupabaseConfigured) return supplier;
    const row = mapSupplierToRow(supplier);
    const { data, error } = await supabase.from('suppliers').update(row).eq('id', supplier.id).select().single();
    if (error) throw error;
    return mapRowToSupplier(data);
  },

  async deleteSupplier(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  }
};