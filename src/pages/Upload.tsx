import { useState } from 'react';
import { apiClient } from '../api/client';
import type { BatchUploadResult } from '../types';
import toast, { Toaster } from 'react-hot-toast';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BatchUploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Reset previous results when a new file is picked
    }
  };

  const downloadTemplate = () => {
    const csvContent = "date,amount,vendor_name,description\n2026-03-01,450.00,Swiggy,Dinner order\n2026-03-02,1200.00,Amazon,Office supplies";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file); // 'file' matches the @RequestParam in your Spring Boot controller

    try {
      const response = await apiClient.post<BatchUploadResult>('/expenses/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setResult(response.data);
      
      if (response.data.failedRows === 0) {
        toast.success("All expenses imported successfully!");
      } else {
        toast.error(`Imported with ${response.data.failedRows} errors`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Server error: Check file format or column lengths");
    } finally {
      // THE LEARNING: Always clear the file and stop loading state, 
      // regardless of whether the upload succeeded or failed.
      setFile(null);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <Toaster position="top-right" />
      
      <div className="bg-[#252525] p-8 rounded-xl border border-[#333] text-center">
        <h3 className="text-xl font-medium text-white mb-2">Bulk Import</h3>
        <p className="text-sm text-gray-400 mb-6">Upload a CSV file to sync your bank statements.</p>

        <button 
          onClick={downloadTemplate}
          className="mb-6 text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2 mx-auto"
        >
          <span>📥</span> Download CSV Template
        </button>

        {/* Drag & Drop Style Area */}
        <div className="border-2 border-dashed border-[#444] rounded-2xl p-12 bg-[#1c1c1c]/50 hover:border-gray-500 transition-all cursor-pointer group">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="hidden" 
            id="csv-input" 
          />
          <label htmlFor="csv-input" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">
                {file ? '📄' : '☁️'}
              </div>
              <div className="text-gray-200 font-medium">
                {file ? file.name : "Click to select or drag CSV here"}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Supports .CSV up to 10MB</p>
            </div>
          </label>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-8 bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
        >
          {uploading ? 'Processing file...' : 'Start Import'}
        </button>
      </div>

      {/* RESULT SECTION: Summary Boxes */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1c1c1c] p-6 rounded-xl border border-[#333] shadow-inner">
              <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest">Successful</span>
              <p className="text-4xl font-semibold text-white mt-1 tabular-nums">{result.successfulRows}</p>
            </div>
            <div className="bg-[#1c1c1c] p-6 rounded-xl border border-[#333] shadow-inner">
              <span className="text-[10px] uppercase text-red-500 font-bold tracking-widest">Failed</span>
              <p className="text-4xl font-semibold text-white mt-1 tabular-nums">{result.failedRows}</p>
            </div>
          </div>

          {/* Detailed Error Table */}
          {result.errors.length > 0 && (
            <div className="bg-[#252525] rounded-xl border border-[#333] overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-[#1c1c1c] border-b border-[#333] flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Error Logs</h4>
                <span className="text-[10px] text-gray-600 italic">Fix these rows and re-upload</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-500 uppercase bg-[#1c1c1c]/50">
                    <tr>
                      <th className="px-4 py-2 font-medium w-24">Row #</th>
                      <th className="px-4 py-2 font-medium">Issue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {result.errors.map((err, i) => (
                      <tr key={i} className="hover:bg-[#2d2d2d] transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{err.rowNumber}</td>
                        <td className="px-4 py-3 text-red-400/90 text-xs leading-relaxed">{err.errorMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}