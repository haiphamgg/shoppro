import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { SALES_DATA, MOCK_ORDERS } from '../constants';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const Dashboard: React.FC = () => {
  const totalRevenue = SALES_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = MOCK_ORDERS.length;
  
  const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {trend === 'up' ? (
          <ArrowUpRight size={16} className="text-green-500 mr-1" />
        ) : (
          <ArrowDownRight size={16} className="text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {subtext}
        </span>
        <span className="text-sm text-gray-400 ml-2">vs tháng trước</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan kinh doanh</h2>
        <div className="text-sm text-gray-500">Cập nhật lần cuối: Hôm nay</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={formatCurrency(totalRevenue)} 
          subtext="+12.5%" 
          icon={DollarSign} 
          trend="up" 
        />
        <StatCard 
          title="Đơn hàng mới" 
          value={totalOrders} 
          subtext="+5.2%" 
          icon={ShoppingBag} 
          trend="up" 
        />
        <StatCard 
          title="Khách hàng mới" 
          value="128" 
          subtext="+2.4%" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Tỉ lệ chuyển đổi" 
          value="3.2%" 
          subtext="-0.4%" 
          icon={Activity} 
          trend="down" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ doanh thu</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(val) => `${val/1000000}M`} />
                <Tooltip 
                  cursor={{fill: '#eff6ff'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Xu hướng đơn hàng</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};