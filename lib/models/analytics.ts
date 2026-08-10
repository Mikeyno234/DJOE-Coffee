import { MenuHppSummaryView, DailySalesRecapView } from "@/lib/db/views/analytics";

export interface AnalyticsSummary {
  kpi: {
    totalMenu: number;
    avgHpp: number;
    avgJual: number;
    avgMargin: number;
  };
  topMargin: any[];
  categoryRecap: Record<string, { count: number; avgPrice: number }>;
  views: {
    menuHppViews: MenuHppSummaryView[];
    dailySalesRecap: DailySalesRecapView[];
  };
}


