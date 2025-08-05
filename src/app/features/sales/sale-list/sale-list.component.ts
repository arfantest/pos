import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzMessageService } from "ng-zorro-antd/message"
import { SaleService } from "../../../core/services/sale.service"
import { PrintService } from "../../../core/services/print.service"
import { Sale } from "../../../core/models/sale.model"

@Component({
  selector: "app-sale-list",
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
    NzDatePickerModule,
    NzSelectModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sales History</h1>
            <p class="text-gray-600 mt-1">View and manage all sales transactions</p>
          </div>
          <button nz-button nzType="primary" routerLink="/sales/new" class="bg-blue-600 hover:bg-blue-700">
            <span nz-icon nzType="plus"></span>
            New Sale
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input 
                nz-input 
                placeholder="Invoice, customer name..." 
                [(ngModel)]="searchText" 
                (input)="onSearch()"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <nz-select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()" nzPlaceHolder="All Status" class="w-full">
                <nz-option nzValue="" nzLabel="All Status"></nz-option>
                <nz-option nzValue="completed" nzLabel="Completed"></nz-option>
                <nz-option nzValue="pending" nzLabel="Pending"></nz-option>
                <nz-option nzValue="cancelled" nzLabel="Cancelled"></nz-option>
              </nz-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <nz-range-picker [(ngModel)]="dateRange" (ngModelChange)="onSearch()" class="w-full"></nz-range-picker>
            </div>
            <div class="flex items-end">
              <button nz-button nzType="primary" (click)="exportSales()" class="w-full">
                <span nz-icon nzType="download"></span>
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Sales Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Sales Transactions</h3>
          </div>
          
          <nz-table #salesTable [nzData]="filteredSales" [nzLoading]="loading" [nzPageSize]="10">
            <thead>
              <tr>
                <th class="text-left">Invoice #</th>
                <th class="text-left">Customer</th>
                <th class="text-left">Cashier</th>
                <th class="text-right">Items</th>
                <th class="text-right">Total</th>
                <th class="text-center">Status</th>
                <th class="text-left">Date</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sale of salesTable.data">
                <td class="font-medium text-blue-600">{{ sale.invoiceNumber }}</td>
                <td>{{ sale.customerName || 'Walk-in Customer' }}</td>
                <td>{{ sale.cashier.firstName }} {{ sale.cashier.lastName }}</td>
                <td class="text-right">{{ sale.items.length || 0 }}</td>
                <td class="text-right font-semibold">\${{ sale.total | number:'1.2-2' }}</td>
                <td class="text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': sale.status === 'completed',
                          'bg-yellow-100 text-yellow-800': sale.status === 'pending',
                          'bg-red-100 text-red-800': sale.status === 'cancelled'
                        }">
                    {{ sale.status | titlecase }}
                  </span>
                </td>
                <td>{{ sale.createdAt | date:'short' }}</td>
                <td class="text-center">
                  <div class="flex justify-center space-x-2">
                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small" 
                      (click)="viewSale(sale)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <span nz-icon nzType="eye"></span>
                    </button>
                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small" 
                      (click)="printInvoice(sale)"
                      class="text-green-600 hover:text-green-800"
                    >
                      <span nz-icon nzType="printer"></span>
                    </button>
                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small" 
                      routerLink="/sales/returns"
                      class="text-orange-600 hover:text-orange-800"
                    >
                      <span nz-icon nzType="rollback"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>

        <!-- Invoice Print Template -->
        <div *ngIf="selectedSale" id="invoice-print" class="hidden">
          <div class="print-container bg-white p-8 max-w-2xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p class="text-lg text-gray-600">{{ selectedSale.invoiceNumber }}</p>
            </div>

            <!-- Company & Customer Info -->
            <div class="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">From:</h3>
                <div class="text-gray-700">
                  <p class="font-semibold">My POS System</p>
                  <p>123 Business Street</p>
                  <p>City, State 12345</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: info@mypos.com</p>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">To:</h3>
                <div class="text-gray-700">
                  <p class="font-semibold">{{ selectedSale.customerName || 'Walk-in Customer' }}</p>
                  <p *ngIf="selectedSale.customerPhone">Phone: {{ selectedSale.customerPhone }}</p>
                  <p><strong>Date:</strong> {{ selectedSale.createdAt | date:'medium' }}</p>
                  <p><strong>Cashier:</strong> {{ selectedSale.cashier.firstName }} {{ selectedSale.cashier.lastName }}</p>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="mb-8">
              <table class="w-full border-collapse border border-gray-300">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-gray-300 px-4 py-3 text-left">Item</th>
                    <th class="border border-gray-300 px-4 py-3 text-center">Qty</th>
                    <th class="border border-gray-300 px-4 py-3 text-right">Price</th>
                    <th class="border border-gray-300 px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selectedSale.items">
                    <td class="border border-gray-300 px-4 py-3">{{ item.product.name }}</td>
                    <td class="border border-gray-300 px-4 py-3 text-center">{{ item.quantity }}</td>
                    <td class="border border-gray-300 px-4 py-3 text-right">\${{ item.unitPrice | number:'1.2-2' }}</td>
                    <td class="border border-gray-300 px-4 py-3 text-right">\${{ item.total | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="flex justify-end mb-8">
              <div class="w-64">
                <div class="flex justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-semibold">\${{ selectedSale.subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200" *ngIf="selectedSale.discount > 0">
                  <span class="text-gray-600">Discount:</span>
                  <span class="font-semibold text-green-600">-\${{ selectedSale.discount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-600">Tax:</span>
                  <span class="font-semibold">\${{ selectedSale.tax | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-3 border-t-2 border-gray-400">
                  <span class="text-lg font-bold">Total:</span>
                  <span class="text-lg font-bold">\${{ selectedSale.total | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Paid:</span>
                  <span class="font-semibold">\${{ selectedSale.paid | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Change:</span>
                  <span class="font-semibold">\${{ selectedSale.change | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-gray-600 text-sm border-t border-gray-200 pt-4">
              <p>Thank you for your business!</p>
              <p>Please keep this receipt for your records.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SaleListComponent implements OnInit {
  sales: Sale[] = []
  filteredSales: Sale[] = []
  loading = false
  searchText = ""
  statusFilter = ""
  dateRange: Date[] = []
  selectedSale: Sale | null = null

  constructor(
    private saleService: SaleService,
    private printService: PrintService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadSales()
  }

  loadSales(): void {
    this.loading = true
    this.saleService.getSales().subscribe({
      next: (sales) => {
        this.sales = sales
        this.filteredSales = sales
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load sales")
        this.loading = false
      },
    })
  }

  onSearch(): void {
    let filtered = this.sales

    // Text search
    if (this.searchText) {
      filtered = filtered.filter(
        (sale) =>
          sale.invoiceNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
          sale.customerName?.toLowerCase().includes(this.searchText.toLowerCase()),
      )
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter((sale) => sale.status === this.statusFilter)
    }

    // Date range filter
    if (this.dateRange && this.dateRange.length === 2) {
      const startDate = this.dateRange[0]
      const endDate = this.dateRange[1]
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt)
        return saleDate >= startDate && saleDate <= endDate
      })
    }

    this.filteredSales = filtered
  }

  viewSale(sale: Sale): void {
    this.selectedSale = sale
  }

  printInvoice(sale: Sale): void {
    this.selectedSale = sale
    setTimeout(() => {
      this.printService.printElement("invoice-print")
    }, 100)
  }

  exportSales(): void {
    this.printService.generateReport(this.filteredSales, "Sales Report")
  }
}
