import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Expense, ExpenseRequest } from '../types';
import toast, { Toaster } from 'react-hot-toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Form State
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/expenses?month=${selectedMonth}`);
      const dataArray = Array.isArray(response.data) ? response.data : response.data.content;
      setExpenses(dataArray || []);
    } catch (error) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !vendor) return;

    setSubmitting(true);
    const newExpense: ExpenseRequest = {
      expenseDate: date,
      amount: parseFloat(amount),
      vendorName: vendor,
      description: description
    };

    try {
      await apiClient.post('/expenses', newExpense);
      toast.success("Saved");
      setDate(''); setAmount(''); setVendor(''); setDescription('');
      fetchExpenses(); 
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatShortDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex gap-8 items-start">
      <Toaster position="top-right" />
      
      {/* LEFT COLUMN: Input Form */}
      <div className="w-[380px] bg-[#252525] p-6 rounded-xl border border-[#333] shrink-0 sticky top-8">
        <h3 className="text-lg font-medium mb-6 text-white">Add expense</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Date</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-white [color-scheme:dark] outline-none focus:border-gray-500" 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-white tabular-nums outline-none focus:border-gray-500" 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Vendor name</label>
            <input 
              type="text" 
              required 
              placeholder="Swiggy" 
              value={vendor} 
              onChange={(e) => setVendor(e.target.value)} 
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500" 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Category (auto-assigned)</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full text-xs font-medium flex items-center gap-1.5 border border-[#10b981]/20">
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
                Auto
              </span>
              <span className="text-[10px] text-gray-500 italic">detected on save</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
            <textarea 
              rows={3} 
              placeholder="Optional note" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500 resize-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full bg-white text-black hover:bg-gray-200 py-2.5 rounded-lg transition-colors font-semibold mt-2 shadow-sm active:scale-95"
          >
            {submitting ? 'Saving...' : 'Save expense'}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Scrolling List */}
      <div className="flex-1 bg-[#252525] p-6 rounded-xl border border-[#333] overflow-hidden">
        
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-medium text-white tracking-tight">All Expenses</h3>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-gray-300 [color-scheme:dark] cursor-pointer outline-none" 
          />
        </div>

        {/* Header Alignment */}
        <div className="flex text-[10px] uppercase tracking-widest text-gray-500 border-b border-[#333] pb-3 px-2 mb-2">
          <div className="w-16 shrink-0">Date</div>
          <div className="flex-1">Vendor / Description</div>
          <div className="w-32 shrink-0 text-center">Category</div>
          <div className="w-24 shrink-0 text-right">Amount</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Loading data...</div>
        ) : (
          <div className="space-y-0.5">
            {expenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center text-sm py-3 px-2 hover:bg-[#2d2d2d] rounded-lg transition-colors group"
              >
                {/* Date */}
                <div className="w-16 text-gray-500 shrink-0 tabular-nums text-xs">
                  {formatShortDate(expense.expenseDate)}
                </div>
                
                {/* Vendor + Description */}
                <div className="flex-1 truncate pr-4 text-gray-200">
                  <span className="font-medium">{expense.vendorName}</span>
                  {expense.description && (
                     <span className="text-gray-500 font-normal ml-2 text-xs italic">
                       — {expense.description}
                     </span>
                  )}
                </div>
                
                {/* Category Pill */}
                <div className="w-32 shrink-0 flex justify-center">
                  <span className="px-2.5 py-0.5 bg-[#1c1c1c] text-gray-400 rounded-md text-[10px] border border-[#333] min-w-[80px] text-center">
                    {expense.categoryName}
                  </span>
                </div>
                
                {/* Amount (Right Aligned) */}
                <div className="w-24 shrink-0 text-right font-semibold text-white tabular-nums">
                  ₹{expense.amount.toLocaleString()}
                </div>
              </div>
            ))}
            
            {expenses.length === 0 && (
              <div className="py-20 text-center text-gray-600 text-sm">
                No records found for this period.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}