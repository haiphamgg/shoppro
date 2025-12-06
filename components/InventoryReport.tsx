
import React, { useMemo, useState } from 'react';
import { Package, DollarSign, TrendingUp, Filter, Search, ArrowUp, ArrowDown, PieChart, ArrowRightLeft, Calendar, ShoppingBag } from 'lucide-react';
import { Product, InventoryLog, Order, OrderStatus } from '../types';

interface InventoryReportProps {
  products: Product[];
  logs?: InventoryLog[];
  orders?: Order[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(amount);
};

export const InventoryReport: React.FC<InventoryReportProps> = ({ products, logs = [], orders = [] }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'DETAILED' | 'SALES_PROFIT'>('GENERAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'totalImportValue', direction: 'desc' });
  
  // Date range for Detailed Report & Profit Report
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // --- GENERAL TAB CALCULATIONS ---
  const generalStats = useMemo(() => {
    let totalStock = 0;
    let totalImportValue = 0; // Vốn tồn kho
    let totalSellingValue = 0; // Giá trị bán ra dự kiến
    
    products.forEach(p => {
        const stock = p.stock || 0;
        const importPrice = p.importPrice || 0;
        const sellingPrice = p.price || 0;

        totalStock += stock;
        totalImportValue += stock * importPrice;
        totalSellingValue += stock * sellingPrice;
    });

    const potentialProfit = totalSellingValue - totalImportValue;
    const profitMargin = totalImportValue > 0 ? (potentialProfit / totalImportValue) * 100 : 0;

    return {
        totalProducts: products.length,
        totalStock,
        totalImportValue,
        totalSellingValue,
        potentialProfit,
        profitMargin
    };
  }, [products]);

  const generalTableData = useMemo(() => {
      let data = products.map(p => {
          const stock = p.stock || 0;
          const importVal = stock * (p.importPrice || 0);
          const sellingVal = stock * (p.price || 0);
          const profit = sellingVal - importVal;
          return {
              ...p,
              totalImportValue: importVal,
              totalSellingValue: sellingVal,
              potentialProfit: profit
          };
      });

      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          data = data.filter(p => 
              p.name.toLowerCase().includes(lowerTerm) || 
              (p.code && p.code.toLowerCase().includes(lowerTerm))
          );
      }

      if (sortConfig && activeTab === 'GENERAL') {
          data.sort((a: any, b: any) => {
              if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
              if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }

      return data;
  }, [products, searchTerm, sortConfig, activeTab]);

  // --- DETAILED TAB CALCULATIONS ---
  const detailedTableData = useMemo(() => {
      if (!logs || logs.length === 0) return [];

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Filter products first
      let filteredProducts = products;
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          filteredProducts = products.filter(p => 
              p.name.toLowerCase().includes(lowerTerm) || 
              (p.code && p.code.toLowerCase().includes(lowerTerm))
          );
      }

      return filteredProducts.map(p => {
          const productLogs = logs.filter(l => l.productId === p.id);
          
          // 1. Calculate Movements within Period
          const inPeriodLogs = productLogs.filter(l => {
              const d = new Date(l.date || l.timestamp);
              return d >= start && d <= end;
          });

          // Import Qty & Value (Actual log price)
          const importLogs = inPeriodLogs.filter(l => l.type === 'IMPORT');
          const importQty = importLogs.reduce((sum, l) => sum + l.quantity, 0);
          const importVal = importLogs.reduce((sum, l) => sum + (l.quantity * (l.price || 0)), 0);

          // Export Qty & Value (Using Product Import Price to represent Cost of Goods Sold)
          const exportLogs = inPeriodLogs.filter(l => l.type === 'EXPORT');
          const exportQty = exportLogs.reduce((sum, l) => sum + l.quantity, 0);
          const exportVal = exportQty * (p.importPrice || 0);

          // 2. Calculate Closing Stock (at end of period)
          const logsAfterPeriod = productLogs.filter(l => {
              const d = new Date(l.date || l.timestamp);
              return d > end;
          });

          let closingStock = p.stock;
          logsAfterPeriod.forEach(l => {
              if (l.type === 'IMPORT') closingStock -= l.quantity;
              else if (l.type === 'EXPORT') closingStock += l.quantity;
          });
          const closingVal = closingStock * (p.importPrice || 0);

          // 3. Calculate Opening Stock (at start of period)
          const openingStock = closingStock - importQty + exportQty;
          const openingVal = openingStock * (p.importPrice || 0);

          return {
              ...p,
              openingStock,
              openingVal,
              importQty,
              importVal,
              exportQty,
              exportVal,
              closingStock,
              closingVal
          };
      });

  }, [products, logs, startDate, endDate, searchTerm]);

  // Calculate detailed totals
  const detailedTotals = useMemo(() => {
      return detailedTableData.reduce((acc, row) => ({
          openingStock: acc.openingStock + row.openingStock,
          openingVal: acc.openingVal + row.openingVal,
          importQty: acc.importQty + row.importQty,
          importVal: acc.importVal + row.importVal,
          exportQty: acc.exportQty + row.exportQty,
          exportVal: acc.exportVal + row.exportVal,
          closingStock: acc.closingStock + row.closingStock,
          closingVal: acc.closingVal + row.closingVal
      }), {
          openingStock: 0, openingVal: 0,
          importQty: 0, importVal: 0,
          exportQty: 0, exportVal: 0,
          closingStock: 0, closingVal: 0
      });
  }, [detailedTableData]);

  // --- SALES PROFIT CALCULATIONS (UPDATED to include Exports) ---
  const salesProfitData = useMemo(() => {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const productSales: Record<string, { qty: number, revenue: number, cost: number }> = {};

      // 1. Process ORDERS (Status = DELIVERED)
      const validOrders = orders.filter(o => {
          const d = new Date(o.date);
          return d >= start && d <= end && o.status === OrderStatus.DELIVERED;
      });

      validOrders.forEach(order => {
          order.items.forEach(item => {
              if (!productSales[item.productId]) {
                  productSales[item.productId] = { qty: 0, revenue: 0, cost: 0 };
              }
              const product = products.find(p => p.id === item.productId);
              const costBasis = product ? (product.importPrice || 0) : 0;
              
              productSales[item.productId].qty += item.quantity;
              productSales[item.productId].revenue += item.price * item.quantity;
              productSales[item.productId].cost += costBasis * item.quantity;
          });
      });

      // 2. Process INVENTORY LOGS (Type = EXPORT)
      // Note: We try to avoid double counting if a log is linked to an order we already processed.
      // Assuming 'referenceDoc' in logs might match 'order.id'.
      const validLogs = logs.filter(l => {
          const d = new Date(l.date || l.timestamp);
          const isExport = l.type === 'EXPORT';
          const inRange = d >= start && d <= end;
          // Check if this log is already covered by a valid order (prevent double counting)
          const linkedOrder = validOrders.find(o => o.id === l.referenceDoc);
          return isExport && inRange && !linkedOrder;
      });

      validLogs.forEach(log => {
          if (!productSales[log.productId]) {
              productSales[log.productId] = { qty: 0, revenue: 0, cost: 0 };
          }
          const product = products.find(p => p.id === log.productId);
          const costBasis = product ? (product.importPrice || 0) : 0;
          
          // In Manual Export, 'price' is the Selling Price (Giá xuất), Cost is importPrice.
          const logRevenue = log.quantity * (log.price || 0); 
          const logCost = log.quantity * costBasis;

          productSales[log.productId].qty += log.quantity;
          productSales[log.productId].revenue += logRevenue;
          productSales[log.productId].cost += logCost;
      });

      // 3. Map to Array
      let reportData = Object.entries(productSales).map(([productId, stats]) => {
          const product = products.find(p => p.id === productId);
          const profit = stats.revenue - stats.cost;
          const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;

          return {
              id: productId,
              name: product?.name || 'Sản phẩm đã xóa',
              code: product?.code || '---',
              qtySold: stats.qty,
              revenue: stats.revenue,
              cogs: stats.cost, // Cost of Goods Sold
              profit: profit,
              margin: margin
          };
      });

      // Filter
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          reportData = reportData.filter(p => 
              p.name.toLowerCase().includes(lowerTerm) || 
              p.code.toLowerCase().includes(lowerTerm)
          );
      }

      // Sort logic for Profit tab
      if (sortConfig && activeTab === 'SALES_PROFIT') {
          reportData.sort((a: any, b: any) => {
              if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
              if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }

      return reportData;

  }, [orders, logs, products, startDate, endDate, searchTerm, sortConfig, activeTab]);

  const salesProfitTotals = useMemo(() => {
      return salesProfitData.reduce((acc, row) => ({
          qtySold: acc.qtySold + row.qtySold,
          revenue: acc.revenue + row.revenue,
          cogs: acc.cogs + row.cogs,
          profit: acc.profit + row.profit
      }), { qtySold: 0, revenue: 0, cogs: 0, profit: 0 });
  }, [salesProfitData]);


  const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'desc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
          direction = 'asc';
      }
      setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
      if (sortConfig?.key !== columnKey) return <Filter size={14} className="opacity-20" />;
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-100 bg-white overflow-x-auto">
            <button 
                onClick={() => setActiveTab('GENERAL')}
                className={`flex-1 sm:flex-none whitespace-nowrap px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'GENERAL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                <PieChart size={18} /> Giá trị tồn kho (Tổng hợp)
            </button>
            <button 
                onClick={() => setActiveTab('DETAILED')}
                className={`flex-1 sm:flex-none whitespace-nowrap px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'DETAILED' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                <ArrowRightLeft size={18} /> Xuất Nhập Tồn (Chi tiết)
            </button>
            <button 
                onClick={() => setActiveTab('SALES_PROFIT')}
                className={`flex-1 sm:flex-none whitespace-nowrap px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'SALES_PROFIT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                <ShoppingBag size={18} /> Lợi nhuận bán hàng
            </button>
        </div>

        {/* --- TAB 1: GENERAL --- */}
        {activeTab === 'GENERAL' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50/50 border-b border-slate-100">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-2 text-slate-500">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Package size={20} />
                            </div>
                            <span className="text-sm font-bold uppercase">Tổng vốn tồn kho</span>
                        </div>
                        <div className="mt-auto">
                            <span className="text-2xl font-bold text-slate-800">{formatCurrency(generalStats.totalImportValue)} đ</span>
                            <p className="text-xs text-slate-400 mt-1">Giá trị nhập * Số lượng tồn</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-2 text-slate-500">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-sm font-bold uppercase">Tổng giá trị bán</span>
                        </div>
                        <div className="mt-auto">
                            <span className="text-2xl font-bold text-emerald-700">{formatCurrency(generalStats.totalSellingValue)} đ</span>
                            <p className="text-xs text-slate-400 mt-1">Giá bán hiện tại * Số lượng tồn</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp size={100} />
                        </div>
                        <div className="flex items-center gap-3 mb-2 text-slate-500">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-sm font-bold uppercase">Lợi nhuận dự kiến</span>
                        </div>
                        <div className="mt-auto relative z-10">
                            <span className="text-2xl font-bold text-purple-700">{formatCurrency(generalStats.potentialProfit)} đ</span>
                            <p className="text-xs text-purple-600/70 font-bold mt-1">
                                Tỷ suất lợi nhuận: {generalStats.profitMargin.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-slate-500">
                        <span className="font-bold text-slate-800">{generalTableData.length}</span> sản phẩm
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="border border-slate-200 rounded-xl overflow-hidden relative">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('stock')}>
                                        <div className="flex items-center justify-end gap-1">SL Tồn <SortIcon columnKey="stock"/></div>
                                    </th>
                                    <th className="px-4 py-3 text-right">Giá vốn</th>
                                    <th className="px-4 py-3 text-right">Giá bán</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalImportValue')}>
                                        <div className="flex items-center justify-end gap-1">Tổng vốn <SortIcon columnKey="totalImportValue"/></div>
                                    </th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('potentialProfit')}>
                                        <div className="flex items-center justify-end gap-1">Lãi dự kiến <SortIcon columnKey="potentialProfit"/></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {generalTableData.length > 0 ? (
                                    generalTableData.map((product) => (
                                        <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-800">{product.name}</div>
                                                <div className="text-xs text-slate-400">{product.code}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500">
                                                {formatCurrency(product.importPrice || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-800">
                                                {formatCurrency(product.totalImportValue)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold text-emerald-600">
                                                    {formatCurrency(product.potentialProfit)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* General Footer */}
                            <tfoot className="bg-slate-100 font-bold text-slate-800 border-t border-slate-300 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <td className="px-4 py-3 text-left">TỔNG CỘNG</td>
                                    <td className="px-4 py-3 text-right">{generalStats.totalStock}</td>
                                    <td className="px-4 py-3 text-right">---</td>
                                    <td className="px-4 py-3 text-right">---</td>
                                    <td className="px-4 py-3 text-right text-blue-700">{formatCurrency(generalStats.totalImportValue)}</td>
                                    <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(generalStats.potentialProfit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </>
        )}

        {/* --- TAB 2: DETAILED --- */}
        {activeTab === 'DETAILED' && (
            <>
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-lg">
                            <Calendar size={16} className="text-slate-400" />
                            <input 
                                type="date" 
                                className="text-sm outline-none text-slate-600 font-medium"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-slate-400">-</span>
                            <input 
                                type="date" 
                                className="text-sm outline-none text-slate-600 font-medium"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="border border-slate-200 rounded-xl overflow-hidden relative">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-500 font-semibold uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 w-1/4">Sản phẩm</th>
                                    <th className="px-4 py-3 text-right bg-blue-50/50 text-blue-700">Tồn đầu</th>
                                    <th className="px-4 py-3 text-right text-green-700">Nhập</th>
                                    <th className="px-4 py-3 text-right text-red-700">Xuất</th>
                                    <th className="px-4 py-3 text-right bg-slate-200/50 text-slate-800">Tồn cuối</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {detailedTableData.length > 0 ? (
                                    detailedTableData.map((row) => (
                                        <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                                                <div className="text-xs text-slate-400">{row.code}</div>
                                            </td>
                                            
                                            <td className="px-4 py-3 text-right bg-blue-50/20 align-top">
                                                <div className="font-bold text-slate-700">{row.openingStock}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">{formatCurrency(row.openingVal)}</div>
                                            </td>

                                            <td className="px-4 py-3 text-right align-top">
                                                <div className="font-bold text-green-600">{row.importQty}</div>
                                                {row.importQty > 0 && (
                                                    <div className="text-[10px] text-green-600/80 mt-0.5">{formatCurrency(row.importVal)}</div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right align-top">
                                                <div className="font-bold text-red-600">{row.exportQty}</div>
                                                {row.exportQty > 0 && (
                                                    <div className="text-[10px] text-red-600/80 mt-0.5">{formatCurrency(row.exportVal)}</div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right bg-slate-50/30 align-top">
                                                <div className="font-bold text-slate-900">{row.closingStock}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">{formatCurrency(row.closingVal)}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            Không có dữ liệu trong khoảng thời gian này
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* Detailed Footer */}
                            <tfoot className="bg-slate-100 font-bold text-slate-800 border-t border-slate-300 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <td className="px-4 py-3 text-left">TỔNG CỘNG</td>
                                    <td className="px-4 py-3 text-right bg-blue-100/50">
                                        <div>{detailedTotals.openingStock}</div>
                                        <div className="text-[10px] opacity-70">{formatCurrency(detailedTotals.openingVal)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-800">
                                        <div>{detailedTotals.importQty}</div>
                                        <div className="text-[10px] opacity-70">{formatCurrency(detailedTotals.importVal)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-800">
                                        <div>{detailedTotals.exportQty}</div>
                                        <div className="text-[10px] opacity-70">{formatCurrency(detailedTotals.exportVal)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right bg-slate-200/50">
                                        <div>{detailedTotals.closingStock}</div>
                                        <div className="text-[10px] opacity-70">{formatCurrency(detailedTotals.closingVal)}</div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </>
        )}

        {/* --- TAB 3: SALES PROFIT (NEW) --- */}
        {activeTab === 'SALES_PROFIT' && (
            <>
                <div className="p-4 bg-purple-50 border-b border-purple-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-purple-200 rounded-lg">
                            <Calendar size={16} className="text-purple-400" />
                            <input 
                                type="date" 
                                className="text-sm outline-none text-purple-900 font-medium"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-purple-400">-</span>
                            <input 
                                type="date" 
                                className="text-sm outline-none text-purple-900 font-medium"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="border border-purple-100 rounded-xl overflow-hidden relative">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-purple-50 text-purple-900 font-semibold uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-100" onClick={() => handleSort('qtySold')}>
                                        <div className="flex items-center justify-end gap-1">Đã bán <SortIcon columnKey="qtySold"/></div>
                                    </th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-100" onClick={() => handleSort('revenue')}>
                                        <div className="flex items-center justify-end gap-1">Doanh thu <SortIcon columnKey="revenue"/></div>
                                    </th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-100" onClick={() => handleSort('cogs')}>
                                        <div className="flex items-center justify-end gap-1">Giá vốn (COGS) <SortIcon columnKey="cogs"/></div>
                                    </th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-100" onClick={() => handleSort('profit')}>
                                        <div className="flex items-center justify-end gap-1">Lợi nhuận thực <SortIcon columnKey="profit"/></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50 bg-white">
                                {salesProfitData.length > 0 ? (
                                    salesProfitData.map((row) => (
                                        <tr key={row.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                                                <div className="text-xs text-slate-400">{row.code}</div>
                                            </td>
                                            
                                            <td className="px-4 py-3 text-right text-slate-700 font-medium">
                                                {row.qtySold}
                                            </td>

                                            <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                                {formatCurrency(row.revenue)}
                                            </td>

                                            <td className="px-4 py-3 text-right text-slate-500">
                                                {formatCurrency(row.cogs)}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <div className="font-bold text-emerald-600">{formatCurrency(row.profit)}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{row.margin.toFixed(1)}% Margin</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            Không có đơn hàng "Đã giao" hoặc phiếu "Xuất kho" trong khoảng thời gian này
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* Sales Profit Footer */}
                            <tfoot className="bg-purple-50 font-bold text-purple-900 border-t border-purple-200 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <td className="px-4 py-3 text-left">TỔNG CỘNG</td>
                                    <td className="px-4 py-3 text-right">{salesProfitTotals.qtySold}</td>
                                    <td className="px-4 py-3 text-right text-blue-700">{formatCurrency(salesProfitTotals.revenue)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(salesProfitTotals.cogs)}</td>
                                    <td className="px-4 py-3 text-right text-emerald-700 text-lg">{formatCurrency(salesProfitTotals.profit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};
