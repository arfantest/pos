import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./product-list/product-list.component").then((m) => m.ProductListComponent),
  },
  {
    path: "categories",
    loadComponent: () => import("./categories/categories.component").then((m) => m.CategoriesComponent),
  },
  {
    path: "brands",
    loadComponent: () => import("./brands/brands.component").then((m) => m.BrandsComponent),
  },
]
