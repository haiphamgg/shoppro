import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash, Eye, Calendar, User, Package } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderListProps {
  orders: Order[];
  onAddOrder: () => void;
  onDeleteOrder: (id: string) => void;
  onEditOrder: (order: Order) => void;
}

const getStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border border-amber-200';
    case OrderStatus.CONFIRMED: return 'bg-blue-50 text-blue-700 border border-blue-200';
    case OrderStatus.SHIPPING: return 'bg-purple-50 text-purple-700 border border-purple-200';
    case OrderStatus.DELIVERED: return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case OrderStatus.CANCELLED: return 'bg-rose-50 text-rose-700 border border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const OrderList: React.FC<OrderListProps> = ({ orders, onAddOrder, onDeleteOrder, onEditOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white z-10">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto">
             <select 
               className="w-full sm:w-48 appearance-none pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 text-sm cursor-pointer"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="ALL">Tất cả trạng thái</option>
               {Object.values(OrderStatus).map(status => (
                 <option key={status} value={status}>{status}</option>
               ))}
             </select>
             <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
        
        <button 
          onClick={onAddOrder}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span>Tạo đơn hàng</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-0">
        {/* Desktop View (Table) */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-bold text-xs">
                          #{order.id.slice(-3)}
                        </span>
                        <span className="font-medium text-slate-700 text-sm">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <User size={10} /> {order.customerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => onEditOrder(order)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Xóa"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Package size={32} />
                      </div>
                      <p className="text-lg font-medium text-slate-700">Không tìm thấy đơn hàng</p>
                      <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Thử tìm kiếm từ khóa khác hoặc tạo đơn hàng mới.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="sm:hidden space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">{order.id}</div>
                    <div className="font-semibold text-slate-800 text-lg">{order.customerName}</div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3 pb-3 border-b border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package size={14} />
                    {order.items.length} sản phẩm
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEditOrder(order)}
                      className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-10 text-slate-500">
                <p>Không có dữ liệu</p>
             </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-white text-sm text-slate-500 flex justify-between items-center z-10">
        <span className="hidden sm:inline">Hiển thị {filteredOrders.length} kết quả</span>
        <span className="sm:hidden">{filteredOrders.length} đơn hàng</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-xs sm:text-sm font-medium" disabled>Trước</button>
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs sm:text-sm font-medium">Sau</button>
        </div>
      </div>
    </div>
  );
};