
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity, TrendingUp, Package, Warehouse, ArrowDownCircle, ArrowUpCircle, FileText, CheckCircle } from 'lucide-react';
import { Order, Product, UserRole, InventoryLog, OrderStatus } from '../types';

interface DashboardProps {
  userRole: UserRole;
  orders: Order[];
  products: Product[];
  logs?: InventoryLog[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export const Dashboard: React.FC<DashboardProps> = ({ userRole, orders, products, logs = [] }) => {
  
  // 1. Calculate Real-time Stats based on Orders AND Export Logs
  const { totalRevenue, totalProfit, totalOrdersCount, chartData, growthStats, pendingRevenue } = useMemo(() => {
    // A. Process Orders
    // 1. Valid Orders (Not Cancelled) - Used for filtering logs and counting potential
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    
    // 2. Realized Orders (DELIVERED only) - Used for Financial Stats (Revenue/Profit)
    // This ensures Dashboard matches the "Sales Profit" report which is strictly realized gains.
    const realizedOrders = validOrders.filter(o => o.status === OrderStatus.DELIVERED);

    // Calculate potential revenue from pending/shipping orders for display
    const pendingOrders = validOrders.filter(o => o.status !== OrderStatus.DELIVERED);
    const pendingRev = pendingOrders.reduce((acc, o) => acc + (o.finalAmount || o.totalAmount), 0);
    
    // B. Process Export Logs (Manual Sales)
    // Filter logs that are EXPORT and NOT linked to an existing VALID order (prevent double counting)
    const manualSalesLogs = logs.filter(l => 
        l.type === 'EXPORT' && 
        !validOrders.find(o => o.id === l.referenceDoc)
    );

    // Helper to get product cost
    const getProductCost = (productId: string) => {
        const p = products.find(prod => prod.id === productId);
        return p ? (p.importPrice || 0) : 0;
    };

    // --- CALCULATE TOTALS (STRICTLY REALIZED) ---

    // 1. From Realized Orders
    const orderRevenue = realizedOrders.reduce((acc, curr) => acc + (curr.finalAmount || curr.totalAmount), 0);
    const orderProfit = realizedOrders.reduce((acc, order) => {
        const orderCost = order.items.reduce((iAcc, item) => {
            return iAcc + (getProductCost(item.productId) * item.quantity);
        }, 0);
        // Profit = Final Amount (Revenue) - Cost
        return acc + ((order.finalAmount || order.totalAmount) - orderCost); 
    }, 0);

    // 2. From Manual Exports (Logs are considered instant/realized)
    const logRevenue = manualSalesLogs.reduce((acc, log) => acc + ((log.price || 0) * log.quantity), 0);
    const logProfit = manualSalesLogs.reduce((acc, log) => {
        const cost = getProductCost(log.productId) * log.quantity;
        const revenue = (log.price || 0) * log.quantity;
        return acc + (revenue - cost);
    }, 0);

    const totalRevenue = orderRevenue + logRevenue;
    const totalProfit = orderProfit + logProfit;
    
    // Total transactions: Delivered Orders + Export Logs
    const totalTransactions = realizedOrders.length + manualSalesLogs.length;

    // --- PREPARE CHART DATA (Last 6 Months) ---
    // Chart should also reflect Realized stats to be consistent
    const today = new Date();
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.getMonth();
        const yearKey = d.getFullYear();
        
        // Filter Realized Orders in Month
        const monthOrders = realizedOrders.filter(o => {
            const od = new Date(o.date);
            return od.getMonth() === monthKey && od.getFullYear() === yearKey;
        });

        // Filter Logs in Month
        const monthLogs = manualSalesLogs.filter(l => {
            const ld = new Date(l.date || l.timestamp);
            return ld.getMonth() === monthKey && ld.getFullYear() === yearKey;
        });

        // Calculate Monthly Metrics
        const mOrderRev = monthOrders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount), 0);
        const mLogRev = monthLogs.reduce((sum, l) => sum + ((l.price || 0) * l.quantity), 0);
        
        const mOrderProfit = monthOrders.reduce((sum, o) => {
             const cost = o.items.reduce((c, item) => c + (getProductCost(item.productId) * item.quantity), 0);
             return sum + ((o.finalAmount || o.totalAmount) - cost);
        }, 0);
        
        const mLogProfit = monthLogs.reduce((sum, l) => {
            const cost = getProductCost(l.productId) * l.quantity;
            const revenue = (l.price || 0) * l.quantity;
            return sum + (revenue - cost);
        }, 0);

        monthlyData.push({
            month: `Thg ${monthKey + 1}`,
            revenue: mOrderRev + mLogRev,
            profit: mOrderProfit + mLogProfit,
            orders: monthOrders.length + monthLogs.length // Combined transaction count
        });
    }

    // --- CALCULATE GROWTH ---
    const currentMonth = monthlyData[monthlyData.length - 1];
    const lastMonth = monthlyData[monthlyData.length - 2];
    
    const revenueGrowth = lastMonth.revenue === 0 ? 100 : ((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100;
    const profitGrowth = lastMonth.profit === 0 ? 100 : ((currentMonth.profit - lastMonth.profit) / lastMonth.profit) * 100;
    const ordersGrowth = lastMonth.orders === 0 ? 100 : ((currentMonth.orders - lastMonth.orders) / lastMonth.orders) * 100;

    return {
        totalRevenue,
        totalProfit,
        totalOrdersCount: totalTransactions,
        chartData: monthlyData,
        growthStats: {
            revenue: revenueGrowth,
            profit: profitGrowth,
            orders: ordersGrowth
        },
        pendingRevenue: pendingRev
    };
  }, [orders, products, logs]);

  // Inventory Stats
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * (p.importPrice || 0)), 0);
  const uniqueCustomers = new Set(orders.map(o => o.customerId)).size; 

  const StatCard = ({ title, value, subtext, icon: Icon, trend, colorFrom, colorTo, iconColor, alert }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorFrom} ${colorTo} opacity-10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-20`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
          <Icon size={24} className={iconColor.replace('bg-', 'text-')} />
        </div>
      </div>
      
      <div className="flex flex-col mt-4 relative z-10">
        <div className="flex items-center">
            <span className={`flex items-center text-sm font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'} bg-opacity-10 px-2 py-0.5 rounded-lg mr-2`}>
            {trend >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">{subtext}</span>
        </div>
        {alert && (
            <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block w-fit">
                {alert}
            </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Tổng quan kinh doanh</h2>
           <p className="text-slate-500">Số liệu dựa trên các giao dịch <strong>đã hoàn thành</strong> (Đã giao / Xuất kho).</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           Cập nhật realtime
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Doanh Thu Thực" 
          value={formatCurrency(totalRevenue)} 
          subtext="Đã thu về" 
          icon={DollarSign} 
          trend={growthStats.revenue}
          colorFrom="from-blue-500"
          colorTo="to-indigo-500"
          iconColor="bg-blue-500 text-blue-600"
          alert={pendingRevenue > 0 ? `+${formatCurrency(pendingRevenue)} đang chờ xử lý` : undefined}
        />
        
        {userRole === 'ADMIN' ? (
          <StatCard 
            title="Lợi Nhuận Ròng" 
            value={formatCurrency(totalProfit)} 
            subtext="Lợi nhuận thực tế" 
            icon={TrendingUp} 
            trend={growthStats.profit}
            colorFrom="from-emerald-400"
            colorTo="to-teal-500"
            iconColor="bg-emerald-500 text-emerald-600"
          />
        ) : (
          <StatCard 
            title="Tổng Giao Dịch" 
            value={totalOrdersCount} 
            subtext="Đơn hàng & Phiếu xuất" 
            icon={ShoppingBag} 
            trend={growthStats.orders}
            colorFrom="from-violet-500"
            colorTo="to-purple-500"
            iconColor="bg-violet-500 text-violet-600"
          />
        )}

        <StatCard 
          title="Giá Trị Kho Hàng" 
          value={formatCurrency(totalInventoryValue)} 
          subtext={`Tổng ${totalStock} sản phẩm`}
          icon={Warehouse} 
          trend={0} // Neutral
          colorFrom="from-orange-400"
          colorTo="to-amber-500"
          iconColor="bg-orange-500 text-orange-600"
        />
        
        <StatCard 
          title="Khách Hàng Mua" 
          value={uniqueCustomers} 
          subtext="đã từng mua hàng" 
          icon={Users} 
          trend={100} 
          colorFrom="from-pink-500"
          colorTo="to-rose-500"
          iconColor="bg-rose-500 text-rose-600"
        />
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">Biểu đồ Doanh thu & Lợi nhuận</h3>
                 <p className="text-sm text-slate-400">Hiệu quả kinh doanh 6 tháng gần nhất (Đã hoàn tất)</p>
              </div>
            </div>
            
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu thực" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Lợi nhuận thực" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xu hướng giao dịch</h3>
            <p className="text-sm text-slate-400 mb-6">Số lượng đơn hàng & phiếu xuất thành công</p>
            
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="orders" name="Giao dịch" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-50">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500">Tổng GD tháng này</span>
                  <span className="text-sm font-bold text-slate-800">{chartData[chartData.length-1]?.orders || 0}</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '100%' }}></div>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Inventory Activity Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    Biến động kho gần đây
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Sản phẩm</th>
                            <th className="px-6 py-4">Loại phiếu</th>
                            <th className="px-6 py-4">Số lượng</th>
                            <th className="px-6 py-4">Giá trị</th>
                            <th className="px-6 py-4">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.slice(0, 5).map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{log.productName}</td>
                                <td className="px-6 py-4">
                                    {log.type === 'IMPORT' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                            <ArrowDownCircle size={12} /> Nhập
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                                            <ArrowUpCircle size={12} /> Xuất
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-mono">{log.quantity}</td>
                                <td className="px-6 py-4 font-medium">{formatCurrency((log.price || 0) * log.quantity)}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {formatDate(log.date || log.timestamp)}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    Chưa có giao dịch kho nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
