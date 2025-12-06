import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Bot, Settings, LogOut, X, ClipboardList, Truck } from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, onLogout, userRole }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'ORDERS', label: 'Đơn hàng', icon: ShoppingCart },
    { id: 'PRODUCTS', label: 'Sản phẩm', icon: Package },
    { id: 'INVENTORY_LOGS', label: 'Lịch sử kho', icon: ClipboardList },
    { id: 'CUSTOMERS', label: 'Khách hàng', icon: Users },
    { id: 'SUPPLIERS', label: 'Nhà cung cấp', icon: Truck },
    { id: 'AI_ASSISTANT', label: 'Trợ lý AI', icon: Bot },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 shadow-xl lg:shadow-none lg:border-r 
    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex lg:flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">SalesPro</h1>
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                {userRole === 'ADMIN' ? 'ADMINISTRATOR' : 'STAFF MEMBER'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium group relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>}
                <Icon size={22} className={`transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          {userRole === 'ADMIN' && (
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm transition-all duration-200 mb-2">
              <Settings size={20} className="text-slate-400" />
              <span>Cài đặt hệ thống</span>
            </button>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};