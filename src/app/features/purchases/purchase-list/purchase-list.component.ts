import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzPopconfirmModule } from "ng-zorro-antd/popconfirm"
import { NzMessageService } from "ng-zorro-antd/message"
import { PurchaseService } from "../../../core/services/purchase.service"
import { PrintService } from "../../../core/services/print.service"
import { Purchase } from "../../../core/models/purchase.model"

@Component({
  selector: "app-purchase-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p class="text-gray-600 mt-1">Manage your purchase orders and supplier transactions</p>
          </div>
          <button nz-button nzType="primary" routerLink="/purchases/new" class="bg-blue-600 hover:bg-blue-700">
            <span nz-icon nzType="plus"></span>
            New Purchase Order
          </button>
        </div>

        <!-- Search Bar -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex space-x-4">
            <div class="flex-1">
              <input 
                nz-input 
                placeholder="Search by PO number, supplier name..." 
                [(ngModel)]="searchText" 
                (input)="onSearch()"
                class="w-full"
              />
            </div>
            <button nz-button nzType="primary" (click)="onSearch()">
              <span nz-icon nzType="search"></span>
              Search
            </button>
          </div>
        </div>

        <!-- Purchase Orders Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Purchase Orders</h3>
          </div>
          
          <nz-table #purchaseTable [nzData]="filteredPurchases" [nzLoading]="loading" [nzPageSize]="10">
            <thead>
              <tr>
                <th class="text-left">PO Number</th>
                <th class="text-left">Supplier</th>
                <th class="text-left">Contact</th>
                <th class="text-right">Total Amount</th>
                <th class="text-center">Status</th>
                <th class="text-left">Created Date</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let purchase of purchaseTable.data">
                <td class="font-medium text-blue-600">{{ purchase.purchaseOrderNumber }}</td>
                <td class="font-medium">{{ purchase.supplierName }}</td>
                <td>{{ purchase.supplierContact || '-' }}</td>
                <td class="text-right font-semibold">\${{ purchase.total | number:'1.2-2' }}</td>
                <td class="text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': purchase.status === 'pending',
                          'bg-green-100 text-green-800': purchase.status === 'received',
                          'bg-red-100 text-red-800': purchase.status === 'cancelled'
                        }">
                    {{ purchase.status | titlecase }}
                  </span>
                </td>
                <td>{{ purchase.createdAt | date:'short' }}</td>
                <td class="text-center">
                  <div class="flex justify-center space-x-2">
                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small" 
                      (click)="viewPurchase(purchase)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <span nz-icon nzType="eye"></span>
                    </button>
                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small" 
                      (click)="printPurchase(purchase)"
                      class="text-green-600 hover:text-green-800"
                    >
                      <span nz-icon nzType="printer"></span>
                    </button>
                    <button 
                      *ngIf="purchase.status === 'pending'"
                      nz-button 
                      nzType="link" 
                      nzSize="small" 
                      nz-popconfirm 
                      nzPopconfirmTitle="Mark this purchase as received?"
                      (nzOnConfirm)="receivePurchase(purchase.id)"
                      class="text-purple-600 hover:text-purple-800"
                    >
                      <span nz-icon nzType="check"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>

        <!-- Purchase Details Modal -->
        <div *ngIf="selectedPurchase" id="purchase-details" class="hidden">
          <div class="print-container bg-white p-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Purchase Order</h2>
              <p class="text-gray-600">{{ selectedPurchase.purchaseOrderNumber }}</p>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                <p><strong>Name:</strong> {{ selectedPurchase.supplierName }}</p>
                <p><strong>Contact:</strong> {{ selectedPurchase.supplierContact || 'N/A' }}</p>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <p><strong>PO Number:</strong> {{ selectedPurchase.purchaseOrderNumber }}</p>
                <p><strong>Status:</strong> {{ selectedPurchase.status | titlecase }}</p>
                <p><strong>Date:</strong> {{ selectedPurchase.createdAt | date:'medium' }}</p>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Items</h3>
              <table class="w-full border-collapse border border-gray-300">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-2 text-left">Product</th>
                    <th class="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                    <th class="border border-gray-300 px-4 py-2 text-right">Unit Cost</th>
                    <th class="border border-gray-300 px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selectedPurchase.items">
                    <td class="border border-gray-300 px-4 py-2">{{ item.product.name }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center">{{ item.quantity }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">\${{ item.unitCost | number:'1.2-2' }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-right">\${{ item.total | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end">
              <div class="w-64">
                <div class="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>\${{ selectedPurchase.subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2" *ngIf="selectedPurchase.discount > 0">
                  <span>Discount:</span>
                  <span>-\${{ selectedPurchase.discount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span>Tax:</span>
                  <span>\${{ selectedPurchase.tax | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                  <span>Total:</span>
                  <span>\${{ selectedPurchase.total | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PurchaseListComponent implements OnInit {
  purchases: Purchase[] = []
  filteredPurchases: Purchase[] = []
  loading = false
  searchText = ""
  selectedPurchase: Purchase | null = null

  constructor(
    private purchaseService: PurchaseService,
    private printService: PrintService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadPurchases()
  }

  loadPurchases(): void {
    this.loading = true
    this.purchaseService.getPurchases().subscribe({
      next: (purchases) => {
        this.purchases = purchases
        this.filteredPurchases = purchases
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load purchases")
        this.loading = false
      },
    })
  }

  onSearch(): void {
    if (!this.searchText) {
      this.filteredPurchases = this.purchases
    } else {
      this.filteredPurchases = this.purchases.filter(
        (purchase) =>
          purchase.purchaseOrderNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
          purchase.supplierName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          purchase.supplierContact?.toLowerCase().includes(this.searchText.toLowerCase()),
      )
    }
  }

  viewPurchase(purchase: Purchase): void {
    this.selectedPurchase = purchase
  }

  printPurchase(purchase: Purchase): void {
    this.selectedPurchase = purchase
    setTimeout(() => {
      this.printService.printElement("purchase-details")
    }, 100)
  }

  receivePurchase(id: string): void {
    this.purchaseService.receivePurchase(id).subscribe({
      next: () => {
        this.message.success("Purchase marked as received")
        this.loadPurchases()
      },
      error: (error) => {
        this.message.error("Failed to update purchase status")
      },
    })
  }
}
