import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { DashboardSummary } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<DashboardSummary>('/dashboard/summary')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-400">Loading dashboard...</div>;
  if (!data) return <div className="text-red-400">Failed to load data. Is Spring Boot running?</div>;

  // Find the maximum values so our progress bars know how to scale to 100%
  const maxCategorySpend = Math.max(...data.spendByCategory.map(c => c.totalAmount), 1);
  const maxVendorSpend = Math.max(...data.topVendors.map(v => v.totalAmount), 1);

  // Helper to format "2026-03-29" to "29 Mar 2026"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* --- TOP STATS ROW --- */}
      <div className="grid grid-cols-4 gap-4 items-start">
        <div>
          <p className="text-gray-400 text-sm mb-1">This month</p>
          <p className="text-3xl font-semibold tracking-tight">₹{data.totalSpendThisMonth.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Total expenses</p>
          <p className="text-3xl font-semibold tracking-tight">{data.totalExpensesCount}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Categories</p>
          <p className="text-3xl font-semibold tracking-tight">{data.categoriesUsedCount}</p>
        </div>
        
        {/* The Pink Anomalies Box */}
        <div className="bg-[#fce8e8] text-[#9b1c1c] p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium mb-1">Anomalies</p>
          <p className="text-3xl font-bold tracking-tight">{data.anomaliesCount}</p>
        </div>
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        
        {/* Category Progress Bars */}
        <div className="bg-[#252525] p-6 rounded-xl border border-[#333]">
          <h3 className="text-sm font-medium mb-6 text-white">Monthly spend by category</h3>
          <div className="space-y-4">
            {data.spendByCategory.map(cat => (
              <div key={cat.categoryName} className="flex items-center text-sm">
                <div className="w-32 text-right pr-4 text-gray-400">{cat.categoryName}</div>
                <div className="flex-1 h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${cat.categoryName === 'Uncategorised' ? 'bg-gray-400' : 'bg-blue-500'}`}
                    style={{ width: `${(cat.totalAmount / maxCategorySpend) * 100}%` }}
                  ></div>
                </div>
                <div className="w-28 text-right pl-4 text-gray-200">₹{cat.totalAmount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Progress Bars */}
        <div className="bg-[#252525] p-6 rounded-xl border border-[#333]">
          <h3 className="text-sm font-medium mb-6 text-white">Top 5 vendors by spend</h3>
          <div className="space-y-4">
            {data.topVendors.map(vendor => (
              <div key={vendor.vendorName} className="flex items-center text-sm">
                <div className="w-32 text-right pr-4 text-gray-400">{vendor.vendorName}</div>
                <div className="flex-1 h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#10b981] rounded-full"
                    style={{ width: `${(vendor.totalAmount / maxVendorSpend) * 100}%` }}
                  ></div>
                </div>
                <div className="w-28 text-right pl-4 text-gray-200">₹{vendor.totalAmount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ANOMALIES TABLE --- */}
      <div className="bg-[#252525] p-6 rounded-xl border border-[#333] mt-6">
        <h3 className="text-sm font-medium mb-6 text-white">Flagged anomalies</h3>
        {data.recentAnomalies.length === 0 ? (
          <p className="text-gray-500 text-sm">No anomalies detected this month.</p>
        ) : (
          <div className="space-y-0">
            {data.recentAnomalies.map(expense => (
              <div key={expense.id} className="flex justify-between items-center text-sm border-b border-[#333] py-3 first:pt-0 last:border-0 last:pb-0">
                <div className="w-28 text-gray-400">{formatDate(expense.expenseDate)}</div>
                <div className="flex-1 font-medium text-gray-200">{expense.vendorName}</div>
                
                {/* Dark Category Pill */}
                <div className="px-3 py-1 bg-[#1c1c1c] text-gray-400 rounded-full text-xs mr-6">
                  {expense.categoryName}
                </div>
                
                <div className="w-20 text-right font-medium text-white mr-6">
                  ₹{expense.amount.toLocaleString()}
                </div>
                
                {/* Red Anomaly Pill */}
                <div className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#fce8e8] text-[#9b1c1c]">
                  anomaly
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}