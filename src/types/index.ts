export interface CategorySpend {
    categoryName: string;
    totalAmount: number;
  }
  
  export interface VendorSpend {
    vendorName: string;
    totalAmount: number;
  }
  
  export interface Expense {
    id: number;
    expenseDate: string;
    amount: number;
    vendorName: string;
    description: string;
    categoryName: string;
    anomaly: boolean;
  }
  
  export interface DashboardSummary {
    totalSpendThisMonth: number;
    totalExpensesCount: number;
    categoriesUsedCount: number;
    anomaliesCount: number;
    spendByCategory: CategorySpend[];
    topVendors: VendorSpend[];
    recentAnomalies: Expense[];
  }

  export interface ExpenseRequest {
    expenseDate: string;
    amount: number;
    vendorName: string;
    description: string;
  }

  export interface RowError {
    rowNumber: number;
    errorMessage: string;
  }
  
  export interface BatchUploadResult {
    batchId: string;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    errors: RowError[];
  }