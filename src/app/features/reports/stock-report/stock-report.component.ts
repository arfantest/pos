import { Component, OnInit } from "@angular/core"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzGridModule } from "ng-zorro-antd/grid"
import { ReportService } from "../../../core/services/report.service"
import { PrintService } from "../../../core/services/print.service"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-stock-report",
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzStatisticModule,
    NzGridModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Stock Report</h1>
            <p class="text-gray-600 mt-1">Inventory levels and stock movement analysis</p>
          </div>
          <button nz-button nzType="primary" (click)="exportReport()">
            <span nz-icon nzType="download"></span>
            Export PDF
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Products</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.totalProducts }}</p>
              </div>
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="shopping" class="text-blue-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Stock Value</p>
                <p class="text-2xl font-bold text-gray-900">\${{ summary.totalStockValue | number:'1.2-2' }}</p>
              </div>
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="dollar" class="text-green-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p class="text-2xl font-bold text-red-600">{{ summary.lowStockItems }}</p>
              </div>
              <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="warning" class="text-red-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Out of Stock</p>
                <p class="text-2xl font-bold text-red-600">{{ summary.outOfStockItems }}</p>
              </div>
              <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="exclamation-circle" class="text-red-600 text-xl"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Details Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Stock Details</h3>
          </div>
          
          <nz-table #stockTable [nzData]="stockData" [nzLoading]="loading">
            <thead>
              <tr>
                <th class="text-left">Product</th>
                <th class="text-left">SKU</th>
                <th class="text-left">Category</th>
                <th class="text-right">Current Stock</th>
                <th class="text-right">Min Stock</th>
                <th class="text-right">Unit Cost</th>
                <th class="text-right">Stock Value</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of stockTable.data">
                <td class="font-medium">{{ item.name }}</td>
                <td class="text-gray-600">{{ item.sku }}</td>
                <td>{{ item.category?.name || 'N/A' }}</td>
                <td class="text-right">{{ item.stock }}</td>
                <td class="text-right">{{ item.minStock }}</td>
                <td class="text-right">\${{ item.cost | number:'1.2-2' }}</td>
                <td class="text-right font-semibold">\${{ (item.stock * item.cost) | number:'1.2-2' }}</td>
                <td class="text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': item.stock > item.minStock,
                          'bg-yellow-100 text-yellow-800': item.stock <= item.minStock && item.stock > 0,
                          'bg-red-100 text-red-800': item.stock === 0
                        }">
                    {{ getStockStatus(item) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>
      </div>
    </div>
  `,
})
export class StockReportComponent implements OnInit {
  loading = false
  stockData: any[] = []

  summary = {
    totalProducts: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  }

  constructor(
    private reportService: ReportService,
    private printService: PrintService,
  ) {}

  ngOnInit(): void {
    this.loadStockReport()
  }

  loadStockReport(): void {
    this.loading = true

    this.reportService.getStockReport().subscribe({
      next: (data) => {
        this.stockData = data.products
        this.summary = data.summary
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading stock report:", error)
        this.loading = false
      },
    })
  }

  getStockStatus(item: any): string {
    if (item.stock === 0) return "Out of Stock"
    if (item.stock <= item.minStock) return "Low Stock"
    return "In Stock"
  }

  exportReport(): void {
    this.printService.generateReport(
      {
        summary: this.summary,
        products: this.stockData,
      },
      "Stock Report",
    )
  }
}
