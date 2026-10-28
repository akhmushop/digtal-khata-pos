export interface SalesOverview {
  month: string;
  sales: number;
  cash: number;
}

export interface LowStockProduct {
  id: number;
  productName: string;
  sku: string;
  status: string;
  quantity: number;
}

export interface StaleStockProduct {
  id: number;
  productName: string;
  sku: string;
  quantity: number;
  lastSoldAt: string | null;
  daysSinceLastSale: number | null;
  stockValue: number;
}

export interface RecentSale {
  id: number;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  paymentStatus: "paid" | "partial" | "unpaid";
  itemCount: number;
  soldPrice: number;
}

export interface SalesActivity {
  transactionCount: number;
  averageSale: number;
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
  paymentCount: number;
}

export interface DashboardData {
  salesOverview: SalesOverview[];
  productsSummary: {
    lowStock: number;
    stockOut: number;
    totalItems: number;
    totalValuation: number;
  };
  topItemsByGross: {
    productName: string;
    currentGross: number;
    trend: string;
  }[];
  topSoldProductsByCategory: {
    category: string;
    soldItems: number;
  }[];
  profitByCategory: {
    category: string;
    profit: number;
  }[];
  salesSummary: {
    currentNetSales: number;
    currentReturn: number;
    salesGrowth: number;
    returnGrowth: number;
  };
  salesActivity: SalesActivity;
  paymentBreakdown: PaymentBreakdown[];
  netProfit: {
    currentNetProfit: number;
    profitGrowth: number;
  };
  invoiceDue: {
    currentDue: number;
    growth: number | null;
  };
  expensesSummary: {
    currentExpenses: number;
    expensesGrowth: number | null;
  };
  purchasesSummary: {
    currentPurchases: number;
    purchasesGrowth: number | null;
  };
  returnSummary: {
    currentReturns: number;
    growth: number | null;
  };
  recentSales: RecentSale[];
  lowStockProducts: LowStockProduct[];
  staleStockProducts: StaleStockProduct[];
  topSellingProducts: {
    id: number;
    productName: string;
    unitsSold: number;
    soldPrice: number;
    grossSales: number;
  }[];
}
