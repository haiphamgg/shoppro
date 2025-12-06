import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity, TrendingUp, Package, Warehouse } from 'lucide-react';
import { SALES_DATA } from '../constants';
import { Order, Product, UserRole } from '../types';

interface DashboardProps {
  userRole: UserRole;
  orders: Order[];
  products: Product[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ userRole, orders, products }) => {
  // Real-time calculations
  const totalRevenue = orders.filter(o => o.status !== 'Đã hủy').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOrders = orders.length;
  
  // Inventory Calculations
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * (p.importPrice || 0)), 0);

  let totalProfit = 0;
  if (userRole === 'ADMIN') {
    orders.filter(o => o.status !== 'Đã hủy').forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const profitPerItem = item.price - (product.importPrice || 0);
          totalProfit += profitPerItem * item.quantity;
        }
      });
    });
  }

  const StatCard = ({ title, value, subtext, icon: Icon, trend, colorFrom, colorTo, iconColor }: any) => (
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
      
      <div className="flex items-center mt-4 relative z-10">
        <span className={`flex items-center text-sm font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-slate-500'} bg-opacity-10 px-2 py-0.5 rounded-lg mr-2`}>
          {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : (trend === 'down' ? <ArrowDownRight size={16} className="mr-1" /> : null)}
          {subtext}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Tổng quan kinh doanh</h2>
           <p className="text-slate-500">Chào mừng trở lại! Đây là tình hình hoạt động hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           Cập nhật realtime
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value={formatCurrency(totalRevenue)} 
          subtext="+12.5% tháng này" 
          icon={DollarSign} 
          trend="up"
          colorFrom="from-blue-500"
          colorTo="to-indigo-500"
          iconColor="bg-blue-500 text-blue-600"
        />
        
        {userRole === 'ADMIN' ? (
          <StatCard 
            title="Lợi Nhuận Ròng" 
            value={formatCurrency(totalProfit)} 
            subtext="+8.4% tháng này" 
            icon={TrendingUp} 
            trend="up" 
            colorFrom="from-emerald-400"
            colorTo="to-teal-500"
            iconColor="bg-emerald-500 text-emerald-600"
          />
        ) : (
          <StatCard 
            title="Đơn Hàng Mới" 
            value={totalOrders} 
            subtext="+5.2% hôm nay" 
            icon={ShoppingBag} 
            trend="up" 
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
          trend="neutral"
          colorFrom="from-orange-400"
          colorTo="to-amber-500"
          iconColor="bg-orange-500 text-orange-600"
        />
        
        <StatCard 
          title="Khách Hàng" 
          value="128" 
          subtext="+3 mới hôm nay" 
          icon={Users} 
          trend="up" 
          colorFrom="from-pink-500"
          colorTo="to-rose-500"
          iconColor="bg-rose-500 text-rose-600"
        />
      </div>

      {/* Charts Section */}
      {userRole === 'ADMIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">Biểu đồ Doanh thu & Lợi nhuận</h3>
                 <p className="text-sm text-slate-400">Hiệu quả kinh doanh 6 tháng gần nhất</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1.5 outline-none text-slate-600 font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                 <option>6 tháng qua</option>
                 <option>Năm nay</option>
              </select>
            </div>
            
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xu hướng đơn hàng</h3>
            <p className="text-sm text-slate-400 mb-6">Số lượng đơn hàng hoàn thành</p>
            
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="orders" name="Đơn hàng" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-50">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500">Tỉ lệ hoàn thành</span>
                  <span className="text-sm font-bold text-slate-800">92%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '92%' }}></div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};