import type { Routes } from "@angular/router"
import { AuthGuard } from "./core/guards/auth.guard"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "",
    loadComponent: () => import("./shared/layout/main-layout/main-layout.component").then((m) => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
      },
      {
        path: "products",
        loadChildren: () => import("./features/products/products.routes").then((m) => m.routes),
      },
      {
        path: "sales",
        loadChildren: () => import("./features/sales/sales.routes").then((m) => m.routes),
      },
      {
        path: "purchases",
        loadChildren: () => import("./features/purchases/purchases.routes").then((m) => m.routes),
      },
      {
        path: "reports",
        loadChildren: () => import("./features/reports/reports.routes").then((m) => m.routes),
      },
      {
        path: "settings",
        loadComponent: () => import("./features/settings/settings.component").then((m) => m.SettingsComponent),
      },
    ],
  },
]
