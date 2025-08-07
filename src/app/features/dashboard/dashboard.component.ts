import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzGridModule } from "ng-zorro-antd/grid"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"
import { NzButtonModule } from "ng-zorro-antd/button"
import { FormsModule } from "@angular/forms"
import { BaseChartDirective } from "ng2-charts"
import { Chart, type ChartConfiguration, type ChartType, registerables } from "chart.js"
import { ProductService } from "../../core/services/product.service"
import { SaleService } from "../../core/services/sale.service"
import { ReportService } from "../../core/services/report.service"
import { Product } from "../../core/models/product.model"
import { Sale } from "../../core/models/sale.model"
import { forkJoin } from "rxjs"
import { startOfWeek, startOfMonth, format, subDays } from "date-fns"
import { ParseNumberPipe } from "../../pipe"

Chart.register(...registerables)

interface DashboardStats {
  totalProducts: number
  lowStockItems: number
  todaySales: number
  totalStockValue: number
  weeklySales: number
  monthlySales: number
  totalCustomers: number
  avgOrderValue: number
}

interface SalesChartData {
  labels: string[]
  datasets: any[]
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    FormsModule,
    BaseChartDirective,
    ParseNumberPipe,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div class="flex space-x-4">
            <nz-select [(ngModel)]="selectedPeriod" (ngModelChange)="onPeriodChange()" class="w-32">
              <nz-option nzValue="today" nzLabel="Today"></nz-option>
              <nz-option nzValue="week" nzLabel="This Week"></nz-option>
              <nz-option nzValue="month" nzLabel="This Month"></nz-option>
              <nz-option nzValue="custom" nzLabel="Custom"></nz-option>
            </nz-select>
            <button nz-button nzType="primary" (click)="refreshData()">
              <span nz-icon nzType="reload"></span>
              Refresh
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Today's Sales -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Today's Sales</p>
                <p class="text-2xl font-bold text-gray-900">\${{ stats.todaySales | parseNumber:'1.2-2' }}</p>
                <p class="text-xs text-green-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +12% from yesterday
                </p>
              </div>
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="dollar" class="text-blue-600 text-xl"></span>
              </div>
            </div>
          </div>

          <!-- Weekly Sales -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Weekly Sales</p>
                <p class="text-2xl font-bold text-gray-900">\${{ stats.weeklySales | parseNumber:'1.2-2' }}</p>
                <p class="text-xs text-green-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +8% from last week
                </p>
              </div>
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="line-chart" class="text-green-600 text-xl"></span>
              </div>
            </div>
          </div>

          <!-- Monthly Sales -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Monthly Sales</p>
                <p class="text-2xl font-bold text-gray-900">\${{ stats.monthlySales | parseNumber:'1.2-2' }}</p>
                <p class="text-xs text-green-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +15% from last month
                </p>
              </div>
              <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="bar-chart" class="text-purple-600 text-xl"></span>
              </div>
            </div>
          </div>

          <!-- Total Products -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Products</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
                <p class="text-xs text-red-600 mt-1" *ngIf="stats.lowStockItems > 0">
                  <span nz-icon nzType="warning"></span>
                  {{ stats.lowStockItems }} low stock
                </p>
              </div>
              <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="shopping" class="text-orange-600 text-xl"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Sales Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Sales Overview</h3>
              <nz-select [(ngModel)]="chartPeriod" (ngModelChange)="updateSalesChart()" class="w-24">
                <nz-option nzValue="7" nzLabel="7 Days"></nz-option>
                <nz-option nzValue="30" nzLabel="30 Days"></nz-option>
                <nz-option nzValue="90" nzLabel="90 Days"></nz-option>
              </nz-select>
            </div>
            <div class="chart-container">
              <canvas 
                baseChart
                [data]="salesChartData"
                [options]="salesChartOptions"
                [type]="salesChartType">
              </canvas>
            </div>
          </div>

          <!-- Top Products Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div class="chart-container">
              <canvas 
                baseChart
                [data]="topProductsChartData"
                [options]="topProductsChartOptions"
                [type]="topProductsChartType">
              </canvas>
            </div>
          </div>
        </div>

        <!-- Tables Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Sales -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Recent Sales</h3>
            </div>
            <div class="p-6">
              <nz-table #recentSalesTable [nzData]="recentSales" [nzPageSize]="5" nzSize="small" [nzShowPagination]="false">
                <thead>
                  <tr>
                    <th class="text-left">Invoice</th>
                    <th class="text-left">Customer</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sale of recentSalesTable.data">
                    <td class="font-medium">{{ sale.invoiceNumber }}</td>
                    <td>{{ sale.customerName || 'Walk-in' }}</td>
                    <td class="text-right font-semibold">\${{ sale.total | parseNumber:'1.2-2' }}</td>
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
                  </tr>
                </tbody>
              </nz-table>
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            </div>
            <div class="p-6">
              <nz-table #lowStockTable [nzData]="lowStockProducts" [nzPageSize]="5" nzSize="small" [nzShowPagination]="false">
                <thead>
                  <tr>
                    <th class="text-left">Product</th>
                    <th class="text-center">Current</th>
                    <th class="text-center">Min Stock</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let product of lowStockTable.data">
                    <td class="font-medium">{{ product.name }}</td>
                    <td class="text-center">{{ product.stock }}</td>
                    <td class="text-center">{{ product.minStock }}</td>
                    <td class="text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="{
                              'bg-red-100 text-red-800': product.stock === 0,
                              'bg-yellow-100 text-yellow-800': product.stock > 0 && product.stock <= product.minStock
                            }">
                        {{ product.stock === 0 ? 'Out of Stock' : 'Low Stock' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `,
  ],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalStockValue: 0,
    weeklySales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
  }

  recentSales: Sale[] = []
  lowStockProducts: Product[] = []
  selectedPeriod = "today"
  chartPeriod = "7"

  // Chart configurations
  salesChartType: ChartType = "line"
  salesChartData: ChartConfiguration["data"] = {
    labels: [],
    datasets: [],
  }
  salesChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "$" + value,
        },
      },
    },
  }

  topProductsChartType: ChartType = "doughnut"
  topProductsChartData: ChartConfiguration["data"] = {
    labels: [],
    datasets: [],
  }
  topProductsChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
    },
  }

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData()
    this.updateSalesChart()
  }

  loadDashboardData(): void {
    forkJoin({
      products: this.productService.getProducts(),
      sales: this.saleService.getSales(),
    }).subscribe({
      next: ({ products, sales }) => {
        this.calculateStats(products, sales)
        this.recentSales = sales.slice(0, 10)
        this.lowStockProducts = products.filter((p) => p.stock <= p.minStock)
        this.updateTopProductsChart(sales)
      },
      error: (error) => {
        console.error("Error loading dashboard data:", error)
      },
    })
  }

  calculateStats(products: Product[], sales: Sale[]): void {
    const now = new Date()
    const today = now.toDateString()
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    this.stats.totalProducts = products.length
    this.stats.lowStockItems = products.filter((p) => p.stock <= p.minStock).length
    this.stats.totalStockValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0)

    // Calculate sales for different periods
    const todaySales = sales.filter((s) => new Date(s.createdAt).toDateString() === today)
    const weeklySales = sales.filter((s) => new Date(s.createdAt) >= weekStart)
    const monthlySales = sales.filter((s) => new Date(s.createdAt) >= monthStart)

    this.stats.todaySales = todaySales.reduce((sum, s) => sum + s.total, 0)
    this.stats.weeklySales = weeklySales.reduce((sum, s) => sum + s.total, 0)
    this.stats.monthlySales = monthlySales.reduce((sum, s) => sum + s.total, 0)

    // Calculate customers and average order value
    const uniqueCustomers = new Set(sales.filter((s) => s.customerName).map((s) => s.customerName))
    this.stats.totalCustomers = uniqueCustomers.size
    this.stats.avgOrderValue = sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0
  }

  updateSalesChart(): void {
    const days = Number.parseInt(this.chartPeriod)
    const labels: string[] = []
    const data: number[] = []

    // Generate labels for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      labels.push(format(date, "MMM dd"))
      data.push(Math.random() * 1000 + 500) // Mock data - replace with real data
    }

    this.salesChartData = {
      labels,
      datasets: [
        {
          label: "Sales",
          data,
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  updateTopProductsChart(sales: Sale[]): void {
    // Calculate top products from sales data
    const productSales: { [key: string]: { name: string; total: number } } = {}

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.product.id
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.product.name,
            total: 0,
          }
        }
        productSales[productId].total += item.total
      })
    })

    // Get top 5 products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    this.topProductsChartData = {
      labels: topProducts.map((p) => p.name),
      datasets: [
        {
          data: topProducts.map((p) => p.total),
          backgroundColor: ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"],
        },
      ],
    }
  }

  onPeriodChange(): void {
    this.loadDashboardData()
  }

  refreshData(): void {
    this.loadDashboardData()
    this.updateSalesChart()
  }
}
