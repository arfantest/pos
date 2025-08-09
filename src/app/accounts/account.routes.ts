import type { Routes } from "@angular/router"

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./account-list/account-list.component").then((m) => m.AccountListComponent),
    },
    {
        path: "new",
        loadComponent: () => import("./account-form/account-form.component").then((m) => m.AccountFormComponent),
    },
    {
        path: ':id/edit',
        loadComponent: () => import("./account-form/account-form.component").then((m) => m.AccountFormComponent),
    },
    // {
    //     path: 'view-details/:id',
    //     loadComponent: () => import("./view-details/view-details").then((m) => m.ViewDetails),
    // },
]
