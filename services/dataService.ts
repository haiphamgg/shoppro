import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, Product, OrderStatus, Customer, InventoryLog, InventoryType, Supplier } from '../types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_LOGS, MOCK_SUPPLIERS } from '../constants';

// --- UTILS ---
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- MAPPING HELPERS ---

const mapRowToOrder = (row: any): Order => ({
  id: String(row.id),
  customerId: row.customer_id || 'GUEST',
  customerName: row.customer_name || 'Khách lẻ',
  items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
  totalAmount: Number(row.total_amount) || 0,
  status: (row.status as OrderStatus) || OrderStatus.PENDING,
  date: row.created_at || new Date().toISOString()
});

const mapOrderToRow = (order: Order) => ({
  id: order.id,
  customer_id: order.customerId,
  customer_name: order.customerName,
  items: JSON.stringify(order.items), 
  total_amount: order.totalAmount,
  status: order.status,
  created_at: order.date
});

const mapRowToProduct = (row: any): Product => ({
  id: String(row.id),
  code: row.code || '',
  name: row.name,
  model: row.model || '',
  unit: row.unit || 'Cái',
  price: Number(row.price) || 0,
  importPrice: Number(row.import_price) || 0,
  stock: Number(row.stock) || 0,
  category: row.category || 'Khác',
  origin: row.origin || 'Chưa rõ',
  imageUrl: row.image_url || '',
  expiryDate: row.expiry_date,
  batchNumber: row.batch_number,
  description: row.description,
  catalogUrl: row.catalog_url
});

const mapProductToRow = (product: Product) => ({
  id: product.id,
  code: product.code,
  name: product.name,
  model: product.model || null,
  unit: product.unit || 'Cái',
  price: product.price,
  import_price: product.importPrice,
  stock: product.stock,
  category: product.category,
  origin: product.origin,
  image_url: product.imageUrl,
  expiry_date: product.expiryDate || null, 
  batch_number: product.batchNumber || null,
  description: product.description || null,
  catalog_url: product.catalogUrl || null
});

const mapRowToCustomer = (row: any): Customer => ({
  id: String(row.id),
  code: row.code || '',
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || ''
});

const mapCustomerToRow = (customer: Customer) => ({
  id: customer.id,
  code: customer.code,
  name: customer.name,
  email: customer.email || null,
  phone: customer.phone,
  address: customer.address || null
});

const mapRowToSupplier = (row: any): Supplier => ({
  id: String(row.id),
  code: row.code || '',
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || ''
});

const mapSupplierToRow = (supplier: Supplier) => ({
  id: supplier.id,
  code: supplier.code,
  name: supplier.name,
  email: supplier.email || null,
  phone: supplier.phone,
  address: supplier.address || null
});

const mapRowToLog = (row: any): InventoryLog => ({
  id: String(row.id),
  productId: String(row.product_id),
  productName: row.products?.name || 'Unknown Product',
  type: row.type as InventoryType,
  quantity: row.quantity,
  oldStock: row.old_stock,
  newStock: row.new_stock,
  price: Number(row.price) || 0,
  supplier: row.supplier,
  referenceDoc: row.reference_doc,
  note: row.note,
  date: row.date || row.created_at, // Use date column or fallback to created_at
  timestamp: row.created_at
});

// --- SERVICE ---

export const dataService = {
  // --- UTILS ---
  async uploadFile(file: File, bucket: string = 'product-images'): Promise<string> {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1000));
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_'); 
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.warn(`Storage bucket "${bucket}" issue. Using local URL. Error:`, uploadError.message);
        return URL.createObjectURL(file);
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.warn('Upload failed, falling back to local object URL:', error);
      return URL.createObjectURL(file);
    }
  },

  async uploadImage(file: File): Promise<string> {
      return this.uploadFile(file, 'product-images');
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
    const { id, ...row } = mapOrderToRow(order);
    const { data, error } = await supabase.from('orders').insert([{ ...row, id: order.id }]).select().single();
    if (error) throw error;
    if (!data) throw new Error("Tạo đơn hàng thành công nhưng không nhận được phản hồi.");
    return mapRowToOrder(data);
  },

  async updateOrder(order: Order): Promise<Order> {
    if (!isSupabaseConfigured) return order;
    const row = mapOrderToRow(order);
    const { data, error } = await supabase.from('orders')
      .update({ customer_name: row.customer_name, items: row.items, total_amount: row.total_amount, status: row.status })
      .eq('id', order.id).select().single();
    if (error) throw error;
    if (!data) throw new Error("Cập nhật đơn hàng thành công nhưng không nhận được phản hồi.");
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
    
    // GENERATE ID CLIENT SIDE
    const dbId = (product.id && !product.id.startsWith('TEMP')) 
        ? product.id 
        : generateUUID();

    // 1. Try to insert with ALL fields
    const fullRow = { ...mapProductToRow(product), id: dbId };
    console.log("Attempting create product:", fullRow);

    const { data, error } = await supabase.from('products').insert([fullRow]).select().single();
    
    if (!error && data) {
        return mapRowToProduct(data);
    }

    // 2. FALLBACK DETECTION
    console.warn("Full insert failed. Trying fallback mode...", error);
    
    // REMOVED 'model' from safeFallbackRow to prevent "Could not find column" errors if DB is outdated
    const safeFallbackRow = {
        id: dbId,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image_url: product.imageUrl,
    };
    
    try {
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .insert([safeFallbackRow])
            .select()
            .single();
        
        if (fallbackError) throw new Error(fallbackError.message);
        if (fallbackData) return mapRowToProduct(fallbackData);
    } catch (innerErr: any) {
            throw new Error("Lỗi lưu DB (Fallback): " + (innerErr.message || JSON.stringify(innerErr)));
    }
    
    throw new Error(error?.message || "Lỗi không xác định khi tạo sản phẩm");
  },

  async updateProduct(product: Product): Promise<Product> {
    if (!isSupabaseConfigured) return product;
    const row = mapProductToRow(product);
    
    const { data, error } = await supabase.from('products').update(row).eq('id', product.id).select().single();
    
    if (error) {
         console.warn("Update schema mismatch. Retrying with legacy fields...");
         // Removed 'model' from fallback update as well
         const fallbackRow = {
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            image_url: product.imageUrl,
        };
        const { data: fallbackData, error: fallbackError } = await supabase.from('products').update(fallbackRow).eq('id', product.id).select().single();
        
        if (fallbackError) throw new Error(`Lỗi cập nhật (Fallback): ${fallbackError.message}`);
        if (fallbackData) return mapRowToProduct(fallbackData);
    }
    
    if (!data) throw new Error("Cập nhật sản phẩm thành công nhưng không nhận được phản hồi.");
    return mapRowToProduct(data);
  },

  async updateProductStock(
    product: Product, 
    type: InventoryType, 
    quantity: number, 
    transactionPrice: number, 
    supplier: string, 
    referenceDoc: string, 
    note: string,
    date: string // New parameter for transaction date
  ): Promise<void> {
    const newStock = type === 'IMPORT' ? product.stock + quantity : product.stock - quantity;
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

    // Update Product Stock
    const { error: prodError } = await supabase.from('products')
      .update({ 
        stock: newStock,
        import_price: Math.round(newImportPrice)
      })
      .eq('id', product.id);
      
    if (prodError) {
         // Fallback if import_price column missing
         const { error: fallbackError } = await supabase.from('products')
          .update({ stock: newStock })
          .eq('id', product.id);
         if (fallbackError) throw fallbackError;
    }

    // Insert Log with user-selected DATE
    const { error: logError } = await supabase.from('inventory_logs').insert([{
      product_id: product.id,
      type,
      quantity,
      old_stock: product.stock,
      new_stock: newStock,
      price: transactionPrice,
      supplier: supplier || null,
      reference_doc: referenceDoc || null,
      note: note || null,
      date: date || new Date().toISOString() // Save the transaction date
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
        .order('date', { ascending: false }); // Sort by transaction date instead of created_at
      
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
    const { id, ...row } = mapCustomerToRow(customer);
    const { data, error } = await supabase.from('customers').insert([{...row, id: customer.id}]).select().single();
    if (error) throw error;
    if (!data) throw new Error("Tạo khách hàng thành công nhưng không nhận được phản hồi.");
    return mapRowToCustomer(data);
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    if (!isSupabaseConfigured) return customer;
    const row = mapCustomerToRow(customer);
    const { data, error } = await supabase.from('customers').update(row).eq('id', customer.id).select().single();
    if (error) throw error;
    if (!data) throw new Error("Cập nhật khách hàng thành công nhưng không nhận được phản hồi.");
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
    const { id, ...row } = mapSupplierToRow(supplier);
    const { data, error } = await supabase.from('suppliers').insert([{...row, id: supplier.id}]).select().single();
    if (error) throw error;
    if (!data) throw new Error("Tạo NCC thành công nhưng không nhận được phản hồi.");
    return mapRowToSupplier(data);
  },

  async updateSupplier(supplier: Supplier): Promise<Supplier> {
    if (!isSupabaseConfigured) return supplier;
    const row = mapSupplierToRow(supplier);
    const { data, error } = await supabase.from('suppliers').update(row).eq('id', supplier.id).select().single();
    if (error) throw error;
    if (!data) throw new Error("Cập nhật NCC thành công nhưng không nhận được phản hồi.");
    return mapRowToSupplier(data);
  },

  async deleteSupplier(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  }
};