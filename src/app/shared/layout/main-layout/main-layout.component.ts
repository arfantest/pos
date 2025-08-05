import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { NzLayoutModule } from "ng-zorro-antd/layout"
import { NzMenuModule } from "ng-zorro-antd/menu"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzDropDownModule } from "ng-zorro-antd/dropdown"
import { NzAvatarModule } from "ng-zorro-antd/avatar"
import { NzBadgeModule } from "ng-zorro-antd/badge"
import { NzButtonModule } from "ng-zorro-antd/button"
import { AuthService } from "../../../core/services/auth.service"
import { User } from "../../../core/models/user.model"

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBadgeModule,
    NzButtonModule,
  ],
  template: `
    <nz-layout class="min-h-screen">
      <!-- Sidebar -->
      <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" [nzWidth]="256" class="bg-white shadow-lg">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center space-x-3" *ngIf="!isCollapsed">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span nz-icon nzType="shop" class="text-white text-lg"></span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">POS System</h1>
              <p class="text-xs text-gray-500">Point of Sale</p>
            </div>
          </div>
          <div class="flex justify-center" *ngIf="isCollapsed">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span nz-icon nzType="shop" class="text-white text-lg"></span>
            </div>
          </div>
        </div>

        <ul nz-menu nzMode="inline" [nzInlineCollapsed]="isCollapsed" class="border-r-0">
          <li nz-menu-item nzMatchRouter routerLink="/dashboard">
            <span nz-icon nzType="dashboard"></span>
            <span>Dashboard</span>
          </li>
          
          <li nz-submenu nzTitle="Products" nzIcon="shopping">
            <ul>
              <li nz-menu-item routerLink="/products">
                <span>Product List</span>
              </li>
              <li nz-menu-item routerLink="/products/categories">
                <span>Categories</span>
              </li>
              <li nz-menu-item routerLink="/products/brands">
                <span>Brands</span>
              </li>
            </ul>
          </li>

          <li nz-submenu nzTitle="Sales" nzIcon="dollar">
            <ul>
              <li nz-menu-item routerLink="/sales/new">
                <span>New Sale</span>
              </li>
              <li nz-menu-item routerLink="/sales">
                <span>Sales History</span>
              </li>
              <li nz-menu-item routerLink="/sales/returns">
                <span>Returns</span>
              </li>
            </ul>
          </li>

          <li nz-submenu nzTitle="Purchases" nzIcon="shopping-cart">
            <ul>
              <li nz-menu-item routerLink="/purchases/new">
                <span>New Purchase</span>
              </li>
              <li nz-menu-item routerLink="/purchases">
                <span>Purchase Orders</span>
              </li>
              <li nz-menu-item routerLink="/purchases/returns">
                <span>Purchase Returns</span>
              </li>
            </ul>
          </li>

          <li nz-submenu nzTitle="Reports" nzIcon="bar-chart">
            <ul>
              <li nz-menu-item routerLink="/reports">
                <span>Dashboard</span>
              </li>
              <li nz-menu-item routerLink="/reports/sales">
                <span>Sales Report</span>
              </li>
              <li nz-menu-item routerLink="/reports/purchases">
                <span>Purchase Report</span>
              </li>
              <li nz-menu-item routerLink="/reports/stock">
                <span>Stock Report</span>
              </li>
              <li nz-menu-item routerLink="/reports/returns">
                <span>Returns Report</span>
              </li>
            </ul>
          </li>

          <li nz-menu-item routerLink="/settings">
            <span nz-icon nzType="setting"></span>
            <span>Settings</span>
          </li>
        </ul>
      </nz-sider>

      <!-- Main Content -->
      <nz-layout>
        <!-- Header -->
        <nz-header class="bg-white shadow-sm px-6 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button nz-button nzType="text" (click)="isCollapsed = !isCollapsed">
              <span nz-icon [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"></span>
            </button>
            <div class="text-gray-600">
              <span class="text-sm">{{ getCurrentDateTime() }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <nz-badge [nzCount]="notificationCount">
              <button nz-button nzType="text" nzSize="large">
                <span nz-icon nzType="bell"></span>
              </button>
            </nz-badge>

            <!-- User Menu -->
            <div nz-dropdown [nzDropdownMenu]="userMenu" nzPlacement="bottomRight">
              <div class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <nz-avatar [nzSize]="32" nzIcon="user" class="bg-blue-600"></nz-avatar>
                <div class="text-left" *ngIf="currentUser">
                  <div class="text-sm font-medium text-gray-900">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
                  <div class="text-xs text-gray-500">{{ currentUser.role | titlecase }}</div>
                </div>
                <span nz-icon nzType="down" class="text-gray-400"></span>
              </div>
            </div>

            <nz-dropdown-menu #userMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item>
                  <span nz-icon nzType="user"></span>
                  Profile
                </li>
                <li nz-menu-item routerLink="/settings">
                  <span nz-icon nzType="setting"></span>
                  Settings
                </li>
                <li nz-menu-divider></li>
                <li nz-menu-item (click)="logout()">
                  <span nz-icon nzType="logout"></span>
                  Logout
                </li>
              </ul>
            </nz-dropdown-menu>
          </div>
        </nz-header>

        <!-- Content -->
        <nz-content class="bg-gray-50">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [
    `
    nz-sider {
      box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
    }
    
    nz-header {
      height: 64px;
      line-height: 64px;
      padding: 0 24px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .ant-menu-inline .ant-menu-item {
      margin: 4px 0;
      border-radius: 6px;
    }
    
    .ant-menu-inline .ant-menu-submenu-title {
      margin: 4px 0;
      border-radius: 6px;
    }
  `,
  ],
})
export class MainLayoutComponent implements OnInit {
  isCollapsed = false
  currentUser: User | null = null
  notificationCount = 3

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString()
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
