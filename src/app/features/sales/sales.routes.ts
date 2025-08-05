import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./sale-list/sale-list.component").then((m) => m.SaleListComponent),
  },
  {
    path: "new",
    loadComponent: () => import("./new-sale/new-sale.component").then((m) => m.NewSaleComponent),
  },
  {
    path: "returns",
    loadComponent: () => import("./sale-returns/sale-returns.component").then((m) => m.SaleReturnsComponent),
  },
]
