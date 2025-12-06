
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, Product, OrderStatus, Customer, InventoryLog, InventoryType, Supplier, User, Permission, Promotion, CustomerRank } from '../types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_LOGS, MOCK_SUPPLIERS, MOCK_USERS } from '../constants';

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
  discountAmount: Number(row.discount_amount) || 0,
  finalAmount: Number(row.final_amount) || Number(row.total_amount) || 0,
  promotionId: row.promotion_id,
  status: (row.status as OrderStatus) || OrderStatus.PENDING,
  date: row.created_at || new Date().toISOString()
});

const mapOrderToRow = (order: Order) => ({
  id: order.id,
  customer_id: order.customerId,
  customer_name: order.customerName,
  items: JSON.stringify(order.items), 
  total_amount: order.totalAmount,
  discount_amount: order.discountAmount || 0,
  final_amount: order.finalAmount || order.totalAmount,
  promotion_id: order.promotionId || null,
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
  address: row.address || '',
  totalSpending: Number(row.total_spending) || 0
});

const mapCustomerToRow = (customer: Customer) => ({
  id: customer.id,
  code: customer.code,
  name: customer.name,
  email: customer.email || null,
  phone: customer.phone,
  address: customer.address || null,
  total_spending: customer.totalSpending
});

const mapRowToSupplier = (row: any): Supplier => ({
  id: String(row.id),
  code: row.code || '',
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || '',
  debt: Number(row.debt) || 0,
  totalPurchased: Number(row.total_purchased) || 0
});

const mapSupplierToRow = (supplier: Supplier) => ({
  id: supplier.id,
  code: supplier.code,
  name: supplier.name,
  email: supplier.email || null,
  phone: supplier.phone,
  address: supplier.address || null,
  debt: supplier.debt,
  total_purchased: supplier.totalPurchased || 0
});

const mapRowToPromotion = (row: any): Promotion => ({
  id: String(row.id),
  code: row.code,
  name: row.name,
  type: row.type,
  value: Number(row.value),
  minOrderValue: Number(row.min_order_value) || 0,
  minCustomerSpending: Number(row.min_customer_spending) || 0,
  startDate: row.start_date,
  endDate: row.end_date,
  isActive: row.is_active,
  description: row.description
});

const mapPromotionToRow = (promotion: Promotion) => ({
  id: promotion.id,
  code: promotion.code,
  name: promotion.name,
  type: promotion.type,
  value: promotion.value,
  min_order_value: promotion.minOrderValue,
  min_customer_spending: promotion.minCustomerSpending,
  start_date: promotion.startDate,
  end_date: promotion.endDate,
  is_active: promotion.isActive,
  description: promotion.description
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

const mapRowToUser = (row: any): User => ({
  id: String(row.id),
  email: row.email,
  name: row.name,
  role: row.role,
  phone: row.phone || '',
  createdAt: row.created_at,
  permissions: row.permissions ? (typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions) : []
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
    
    // Update spending if order is valid
    if (order.customerId && order.customerId !== 'GUEST' && order.status !== OrderStatus.CANCELLED) {
       await this._incrementCustomerSpending(order.customerId, order.finalAmount || order.totalAmount);
    }

    if (!data) throw new Error("Tạo đơn hàng thành công nhưng không nhận được phản hồi.");
    return mapRowToOrder(data);
  },

  async updateOrder(order: Order): Promise<Order> {
    if (!isSupabaseConfigured) return order;
    
    // Fetch old order to see difference
    const { data: oldOrderData } = await supabase.from('orders').select('final_amount, total_amount, status').eq('id', order.id).single();
    const oldAmount = oldOrderData ? (oldOrderData.final_amount || oldOrderData.total_amount || 0) : 0;
    const oldStatus = oldOrderData ? oldOrderData.status : null;

    const row = mapOrderToRow(order);
    const { data, error } = await supabase.from('orders')
      .update({ 
          customer_name: row.customer_name, 
          items: row.items, 
          total_amount: row.total_amount, 
          final_amount: row.final_amount,
          discount_amount: row.discount_amount,
          promotion_id: row.promotion_id,
          status: row.status 
      })
      .eq('id', order.id).select().single();
    if (error) throw error;

    // Adjust spending logic
    if (order.customerId && order.customerId !== 'GUEST') {
        const newAmount = order.finalAmount || order.totalAmount;
        let change = 0;

        // Logic: 
        // 1. If cancelled now but was active -> subtract old amount
        // 2. If active now but was cancelled -> add new amount
        // 3. If active before and active now -> add difference (new - old)

        const isActive = (s: string) => s !== OrderStatus.CANCELLED;

        if (isActive(order.status) && isActive(oldStatus)) {
            change = newAmount - oldAmount;
        } else if (!isActive(order.status) && isActive(oldStatus)) {
            change = -oldAmount;
        } else if (isActive(order.status) && !isActive(oldStatus)) {
            change = newAmount;
        }

        if (change !== 0) {
            await this._incrementCustomerSpending(order.customerId, change);
        }
    }

    if (!data) throw new Error("Cập nhật đơn hàng thành công nhưng không nhận được phản hồi.");
    return mapRowToOrder(data);
  },

  async _incrementCustomerSpending(customerId: string, amount: number) {
      if (!amount) return;
      const { data } = await supabase.from('customers').select('total_spending').eq('id', customerId).single();
      if (data) {
          const current = Number(data.total_spending) || 0;
          await supabase.from('customers').update({ total_spending: current + amount }).eq('id', customerId);
      }
  },

  async deleteOrder(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    
    // Get order before delete to subtract spending
    const { data: order } = await supabase.from('orders').select('customer_id, final_amount, total_amount, status').eq('id', id).single();
    
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;

    if (order && order.customer_id && order.status !== OrderStatus.CANCELLED) {
        const amount = order.final_amount || order.total_amount || 0;
        await this._incrementCustomerSpending(order.customer_id, -amount);
    }
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
    return mapRowToCustomer(data);
  },

  async deleteCustomer(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },

  async recalculateAllCustomerSpending(): Promise<void> {
     if (!isSupabaseConfigured) return;
     
     // 1. Reset all to 0
     await supabase.from('customers').update({ total_spending: 0 }).neq('id', 'x');

     // 2. Calculate sum from orders (simplified approach, ideally use a SQL function)
     const { data: orders } = await supabase.from('orders')
        .select('customer_id, final_amount, total_amount')
        .neq('status', OrderStatus.CANCELLED)
        .not('customer_id', 'is', null);
     
     if (!orders) return;

     const spendingMap: Record<string, number> = {};
     orders.forEach((o: any) => {
         const cid = o.customer_id;
         const amt = Number(o.final_amount) || Number(o.total_amount) || 0;
         if (cid && cid !== 'GUEST') {
             spendingMap[cid] = (spendingMap[cid] || 0) + amt;
         }
     });

     // 3. Update in batches (doing individually for simplicity here, but could be optimized)
     const updates = Object.entries(spendingMap).map(([id, total]) => 
        supabase.from('customers').update({ total_spending: total }).eq('id', id)
     );
     
     await Promise.all(updates);
  },

  // --- CUSTOMER RANKS ---
  async getCustomerRanks(): Promise<CustomerRank[]> {
      if (!isSupabaseConfigured) return [];
      try {
          const { data, error } = await supabase.from('customer_ranks').select('*').order('min_spending', { ascending: false });
          if (error) return [];
          return data ? data.map((r: any) => ({
              id: r.id, name: r.name, minSpending: Number(r.min_spending), color: r.color
          })) : [];
      } catch { return []; }
  },

  async saveCustomerRanks(ranks: CustomerRank[]): Promise<void> {
      if (!isSupabaseConfigured) return;
      // Replace all strategy: Delete all and insert new
      await supabase.from('customer_ranks').delete().neq('id', 'x');
      
      const rows = ranks.map(r => ({
          id: r.id,
          name: r.name,
          min_spending: r.minSpending,
          color: r.color
      }));
      
      if (rows.length > 0) {
          const { error } = await supabase.from('customer_ranks').insert(rows);
          if (error) throw error;
      }
  },


  // --- PROMOTIONS ---
  async getPromotions(): Promise<Promotion[]> {
      if (!isSupabaseConfigured) return [];
      try {
          const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
          if (error) return [];
          return data ? data.map(mapRowToPromotion) : [];
      } catch { return []; }
  },

  async createPromotion(promo: Promotion): Promise<Promotion> {
      if (!isSupabaseConfigured) return promo;
      const { id, ...row } = mapPromotionToRow(promo);
      const { data, error } = await supabase.from('promotions').insert([{ ...row, id: promo.id }]).select().single();
      if (error) throw error;
      return mapRowToPromotion(data);
  },

  async updatePromotion(promo: Promotion): Promise<Promotion> {
      if (!isSupabaseConfigured) return promo;
      const row = mapPromotionToRow(promo);
      const { data, error } = await supabase.from('promotions').update(row).eq('id', promo.id).select().single();
      if (error) throw error;
      return mapRowToPromotion(data);
  },

  async deletePromotion(id: string): Promise<void> {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from('promotions').delete().eq('id', id);
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

    const fullRow = { ...mapProductToRow(product), id: dbId };
    const { data, error } = await supabase.from('products').insert([fullRow]).select().single();
    
    if (!error && data) {
        return mapRowToProduct(data);
    }
    
    console.warn("Product create error, using fallback...", error);
    // Simple fallback logic omitted for brevity in this update
    throw new Error(error?.message || "Lỗi tạo sản phẩm");
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
    note: string,
    date: string,
    newSellingPrice?: number
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

    // Prepare update object
    const updatePayload: any = { 
        stock: newStock,
        import_price: Math.round(newImportPrice)
    };
    if (type === 'IMPORT' && newSellingPrice !== undefined) {
        updatePayload.price = newSellingPrice;
    }

    const { error: prodError } = await supabase.from('products').update(updatePayload).eq('id', product.id);
    if (prodError) throw prodError;

    // Insert Log
    const { error: logError } = await supabase.from('inventory_logs').insert([{
      id: generateUUID(),
      product_id: product.id,
      type,
      quantity,
      old_stock: product.stock,
      new_stock: newStock,
      price: transactionPrice,
      supplier: supplier || null,
      reference_doc: referenceDoc || null,
      note: note || null,
      date: date || new Date().toISOString()
    }]);
    
    if (logError) throw new Error(`Ghi nhận lịch sử thất bại: ${logError.message}`);
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
      const { data: logsData } = await supabase.from('inventory_logs').select('*').order('date', { ascending: false });
      if (!logsData || logsData.length === 0) return [];

      const productIds = Array.from(new Set(logsData.map(l => l.product_id).filter(id => id)));
      let nameMap: Record<string, string> = {};
      if (productIds.length > 0) {
          const { data: productsData } = await supabase.from('products').select('id, name').in('id', productIds);
          if (productsData) productsData.forEach(p => { nameMap[p.id] = p.name; });
      }

      return logsData.map(row => ({
        id: String(row.id),
        productId: String(row.product_id),
        productName: nameMap[row.product_id] || 'SP đã xóa',
        type: row.type as InventoryType,
        quantity: row.quantity,
        oldStock: row.old_stock,
        newStock: row.new_stock,
        price: Number(row.price) || 0,
        supplier: row.supplier,
        referenceDoc: row.reference_doc,
        note: row.note,
        date: row.date || row.created_at,
        timestamp: row.created_at
      }));
    } catch (err) { return MOCK_LOGS; }
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
    return mapRowToSupplier(data);
  },

  async updateSupplier(supplier: Supplier): Promise<Supplier> {
    if (!isSupabaseConfigured) return supplier;
    const row = mapSupplierToRow(supplier);
    const { data, error } = await supabase.from('suppliers').update(row).eq('id', supplier.id).select().single();
    if (error) throw error;
    return mapRowToSupplier(data);
  },

  async updateSupplierDebt(supplierId: string, debtChange: number, purchaseChange: number): Promise<void> {
      if (!isSupabaseConfigured) return;
      
      // Fetch current data first to be safe
      const { data: currentData, error: fetchError } = await supabase.from('suppliers').select('debt, total_purchased').eq('id', supplierId).single();
      if (fetchError) throw fetchError;

      const currentDebt = Number(currentData.debt) || 0;
      const currentPurchased = Number(currentData.total_purchased) || 0;

      const { error } = await supabase.from('suppliers').update({
          debt: currentDebt + debtChange,
          total_purchased: currentPurchased + purchaseChange
      }).eq('id', supplierId);

      if (error) throw error;
  },

  async deleteSupplier(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  },

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured) return MOCK_USERS;
    try {
      const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
      if (error) return MOCK_USERS;
      return data ? data.map(mapRowToUser) : [];
    } catch { return MOCK_USERS; }
  },

  async createUser(user: User): Promise<User> {
    if (!isSupabaseConfigured) return user;
    const row = {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      password: user.password,
      permissions: JSON.stringify(user.permissions || [])
    };
    const { data, error } = await supabase.from('app_users').insert([row]).select().single();
    if (error) throw error;
    return mapRowToUser(data);
  },

  async updateUser(user: User): Promise<User> {
    if (!isSupabaseConfigured) return user;
    const row: any = {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      permissions: JSON.stringify(user.permissions || [])
    };
    if (user.password) row.password = user.password;
    const { data, error } = await supabase.from('app_users').update(row).eq('id', user.id).select().single();
    if (error) throw error;
    return mapRowToUser(data);
  },

  async deleteUser(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('app_users').delete().eq('id', id);
    if (error) throw error;
  },
  
  async changePassword(userId: string, newPassword: string): Promise<void> {
     if (!isSupabaseConfigured) return;
     const { error } = await supabase.from('app_users').update({ password: newPassword }).eq('id', userId);
     if (error) throw error;
  }
};
