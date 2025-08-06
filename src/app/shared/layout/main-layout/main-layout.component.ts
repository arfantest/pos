import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router"
import { NzLayoutModule } from "ng-zorro-antd/layout"
import { NzMenuModule } from "ng-zorro-antd/menu"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzDropDownModule } from "ng-zorro-antd/dropdown"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
  ],
  template: `
    <nz-layout class="min-h-screen">
      <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" nzWidth="256px">
        <!-- <div class="logo p-4 text-center text-white font-bold text-lg">

          POS System
        </div> -->
        <div class="logo text-center text-white font-bold " [ngClass]="{ 'p-4 text-lg': !isCollapsed, 'p-2 text-xl': isCollapsed }"> 
          <span *ngIf="!isCollapsed">POS System</span>
          <span *ngIf="isCollapsed">POS</span>
        </div>

        <ul nz-menu nzTheme="dark" nzMode="inline" [nzInlineCollapsed]="isCollapsed">
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/dashboard">
              <i nz-icon nzType="dashboard"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li nz-submenu nzTitle="Products" nzIcon="shopping">
            <ul>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/products">Product List</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/products/categories">Categories</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/products/brands">Brands</a>
              </li>
            </ul>
          </li>
          <li nz-submenu nzTitle="Sales" nzIcon="dollar">
            <ul>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/sales/new">New Sale</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/sales">Sales List</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/sales/returns">Returns</a>
              </li>
            </ul>
          </li>
          <li nz-submenu nzTitle="Purchases" nzIcon="shopping-cart">
            <ul>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/purchases/new">New Purchase</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/purchases">Purchase List</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/purchases/returns">Returns</a>
              </li>
            </ul>
          </li>
          <li nz-submenu nzTitle="Expense" nzIcon="bar-chart">
            <ul>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/expenses">Expenses</a>
              </li>
            </ul>
          </li>
          <li nz-submenu nzTitle="Reports" nzIcon="bar-chart">
            <ul>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/reports">Dashboard</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/reports/sales">Sales Report</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/reports/purchases">Purchase Report</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/reports/stock">Stock Report</a>
              </li>
              <li nz-menu-item nzMatchRouter>
                <a routerLink="/reports/returns">Returns Report</a>
              </li>
            </ul>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/settings">
              <i nz-icon nzType="setting"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nz-sider>
      <nz-layout>
        <nz-header class="bg-white px-4 flex justify-between items-center shadow-sm">
          <i
            class="trigger cursor-pointer text-lg"
            nz-icon
            [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"
            (click)="isCollapsed = !isCollapsed"
          ></i>
          <div nz-dropdown [nzDropdownMenu]="menu" nzPlacement="bottomRight">
            <a nz-button nzType="text" class="ant-dropdown-link">
              <i nz-icon nzType="user"></i>
              {{ currentUser?.name || 'User' }}
              <i nz-icon nzType="down"></i>
            </a>
          </div>
          <nz-dropdown-menu #menu="nzDropdownMenu">
            <ul nz-menu>
              <li nz-menu-item (click)="logout()">
                <i nz-icon nzType="logout"></i>
                Logout
              </li>
            </ul>
          </nz-dropdown-menu>
        </nz-header>
        <nz-content class="m-6">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
})
export class MainLayoutComponent {
  isCollapsed = false
  currentUser: any

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })
  }

  logout(): void {
    this.authService.logout()
  }
}
