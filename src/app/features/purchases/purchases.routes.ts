import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./purchase-list/purchase-list.component").then((m) => m.PurchaseListComponent),
  },
  {
    path: "new",
    loadComponent: () => import("./new-purchase/new-purchase.component").then((m) => m.NewPurchaseComponent),
  },
  {
    path: "returns",
    loadComponent: () =>
      import("./purchase-returns/purchase-returns.component").then((m) => m.PurchaseReturnsComponent),
  },
]
