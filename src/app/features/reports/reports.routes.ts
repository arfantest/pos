import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./reports-dashboard/reports-dashboard.component").then((m) => m.ReportsDashboardComponent),
  },
  {
    path: "sales",
    loadComponent: () => import("./sales-report/sales-report.component").then((m) => m.SalesReportComponent),
  },
  {
    path: "purchases",
    loadComponent: () => import("./purchase-report/purchase-report.component").then((m) => m.PurchaseReportComponent),
  },
  {
    path: "stock",
    loadComponent: () => import("./stock-report/stock-report.component").then((m) => m.StockReportComponent),
  },
  {
    path: "returns",
    loadComponent: () => import("./returns-report/returns-report.component").then((m) => m.ReturnsReportComponent),
  },
]
