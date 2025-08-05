import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzGridModule } from "ng-zorro-antd/grid"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"
import { NzSelectModule } from "ng-zorro-antd/select"
import { BaseChartDirective } from "ng2-charts"
import { Chart, ChartConfiguration, ChartType, registerables } from "chart.js"
import { ReportService } from "../../../core/services/report.service"
import { PrintService } from "../../../core/services/print.service"
import { startOfMonth, endOfMonth, format } from "date-fns"

Chart.register(...registerables)

@Component({
  selector: "app-reports-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzDatePickerModule,
    NzSelectModule,
    BaseChartDirective,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
            <p class="text-gray-600 mt-1">Comprehensive business analytics and insights</p>
          </div>
          <div class="flex space-x-4">
            <nz-range-picker 
              [(ngModel)]="dateRange" 
              (ngModelChange)="onDateRangeChange()"
              class="w-64"
            ></nz-range-picker>
            <button nz-button nzType="primary" (click)="exportAllReports()">
              <span nz-icon nzType="download"></span>
              Export All
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                <p class="text-2xl font-bold text-gray-900">\${{ totalRevenue | number:'1.2-2' }}</p>
                <p class="text-xs text-green-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +{{ revenueGrowth | number:'1.1-1' }}% from last period
                </p>
              </div>
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="dollar" class="text-green-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Orders</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalOrders }}</p>
                <p class="text-xs text-blue-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +{{ orderGrowth | number:'1.1-1' }}% from last period
                </p>
              </div>
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="shopping-cart" class="text-blue-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p class="text-2xl font-bold text-gray-900">\${{ avgOrderValue | number:'1.2-2' }}</p>
                <p class="text-xs text-purple-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +{{ aovGrowth | number:'1.1-1' }}% from last period
                </p>
              </div>
              <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="bar-chart" class="text-purple-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Profit Margin</p>
                <p class="text-2xl font-bold text-gray-900">{{ profitMargin | number:'1.1-1' }}%</p>
                <p class="text-xs text-orange-600 mt-1">
                  <span nz-icon nzType="arrow-up"></span>
                  +{{ marginGrowth | number:'1.1-1' }}% from last period
                </p>
              </div>
              <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="pie-chart" class="text-orange-600 text-xl"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Revenue Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <nz-select [(ngModel)]="revenueChartPeriod" (ngModelChange)="updateRevenueChart()" class="w-24">
                <nz-option nzValue="daily" nzLabel="Daily"></nz-option>
                <nz-option nzValue="weekly" nzLabel="Weekly"></nz-option>
                <nz-option nzValue="monthly" nzLabel="Monthly"></nz-option>
              </nz-select>
            </div>
            <div class="chart-container">
              <canvas 
                baseChart
                [data]="revenueChartData"
                [options]="revenueChartOptions"
                [type]="revenueChartType">
              </canvas>
            </div>
          </div>

          <!-- Sales vs Purchases Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sales vs Purchases</h3>
            <div class="chart-container">
              <canvas 
                baseChart
                [data]="salesPurchasesChartData"
                [options]="salesPurchasesChartOptions"
                [type]="salesPurchasesChartType">
              </canvas>
            </div>
          </div>
        </div>

        <!-- Report Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Sales Report Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
               routerLink="/reports/sales">
            <div class="flex items-center justify-between mb-4">
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="line-chart" class="text-blue-600 text-xl"></span>
              </div>
              <span nz-icon nzType="arrow-right" class="text-gray-400"></span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sales Report</h3>
            <p class="text-gray-600 text-sm mb-4">Detailed sales analysis with trends and insights</p>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Last 30 days</span>
              <span class="font-semibold text-blue-600">\${{ last30DaysSales | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Purchase Report Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
               routerLink="/reports/purchases">
            <div class="flex items-center justify-between mb-4">
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="shopping-cart" class="text-green-600 text-xl"></span>
              </div>
              <span nz-icon nzType="arrow-right" class="text-gray-400"></span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Purchase Report</h3>
            <p class="text-gray-600 text-sm mb-4">Track purchase orders and supplier performance</p>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Last 30 days</span>
              <span class="font-semibold text-green-600">\${{ last30DaysPurchases | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Stock Report Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
               routerLink="/reports/stock">
            <div class="flex items-center justify-between mb-4">
              <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="database" class="text-orange-600 text-xl"></span>
              </div>
              <span nz-icon nzType="arrow-right" class="text-gray-400"></span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Stock Report</h3>
            <p class="text-gray-600 text-sm mb-4">Inventory levels and stock movement analysis</p>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Total Value</span>
              <span class="font-semibold text-orange-600">\${{ totalStockValue | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Returns Report Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
               routerLink="/reports/returns">
            <div class="flex items-center justify-between mb-4">
              <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="rollback" class="text-red-600 text-xl"></span>
              </div>
              <span nz-icon nzType="arrow-right" class="text-gray-400"></span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Returns Report</h3>
            <p class="text-gray-600 text-sm mb-4">Sales and purchase returns analysis</p>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Return Rate</span>
              <span class="font-semibold text-red-600">{{ returnRate | number:'1.1-1' }}%</span>
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
export class ReportsDashboardComponent implements OnInit {
  dateRange: Date[] = []

  // Stats
  totalRevenue = 0
  totalOrders = 0
  avgOrderValue = 0
  profitMargin = 0
  revenueGrowth = 0
  orderGrowth = 0
  aovGrowth = 0
  marginGrowth = 0
  last30DaysSales = 0
  last30DaysPurchases = 0
  totalStockValue = 0
  returnRate = 0

  // Chart configurations
  revenueChartPeriod = "daily"
  revenueChartType: any= "line"
  // revenueChartType: Chart= "line"
  revenueChartData: ChartConfiguration["data"] = {
    labels: [],
    datasets: [],
  }
  revenueChartOptions: ChartConfiguration["options"] = {
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

  salesPurchasesChartType: any= "bar"
  // salesPurchasesChartType: Chart= "bar"
  salesPurchasesChartData: ChartConfiguration["data"] = {
    labels: [],
    datasets: [],
  }
  salesPurchasesChartOptions: ChartConfiguration["options"] = {
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

  constructor(
    private reportService: ReportService,
    private printService: PrintService,
  ) {
    // Set default date range to current month
    const now = new Date()
    this.dateRange = [startOfMonth(now), endOfMonth(now)]
  }

  ngOnInit(): void {
    this.loadReportsData()
    this.updateRevenueChart()
    this.updateSalesPurchasesChart()
  }

  loadReportsData(): void {
    const startDate = format(this.dateRange[0], "yyyy-MM-dd")
    const endDate = format(this.dateRange[1], "yyyy-MM-dd")

    // Load sales report
    this.reportService.getSalesReport(startDate, endDate).subscribe({
      next: (data) => {
        this.totalRevenue = data.summary.totalSales
        this.totalOrders = data.summary.salesCount
        this.avgOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0
        this.last30DaysSales = data.summary.totalSales
      },
    })

    // Load purchase report
    this.reportService.getPurchaseReport(startDate, endDate).subscribe({
      next: (data) => {
        this.last30DaysPurchases = data.summary.totalPurchases
      },
    })

    // Load stock report
    this.reportService.getStockReport().subscribe({
      next: (data) => {
        this.totalStockValue = data.summary.totalStockValue
      },
    })

    // Load profit loss
    this.reportService.getProfitLossReport(startDate, endDate).subscribe({
      next: (data) => {
        this.profitMargin = data.grossProfitMargin
      },
    })

    // Mock growth data (replace with real calculations)
    this.revenueGrowth = 12.5
    this.orderGrowth = 8.3
    this.aovGrowth = 4.2
    this.marginGrowth = 2.1
    this.returnRate = 3.2
  }

  updateRevenueChart(): void {
    // Generate mock data based on period
    const labels: string[] = []
    const data: number[] = []

    if (this.revenueChartPeriod === "daily") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(format(date, "MMM dd"))
        data.push(Math.random() * 1000 + 500)
      }
    } else if (this.revenueChartPeriod === "weekly") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i * 7)
        labels.push(`Week ${format(date, "w")}`)
        data.push(Math.random() * 5000 + 2000)
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        labels.push(format(date, "MMM yyyy"))
        data.push(Math.random() * 20000 + 10000)
      }
    }

    this.revenueChartData = {
      labels,
      datasets: [
        {
          label: "Revenue",
          data,
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  updateSalesPurchasesChart(): void {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    this.salesPurchasesChartData = {
      labels,
      datasets: [
        {
          label: "Sales",
          data: [12000, 15000, 13000, 17000, 16000, 18000],
          backgroundColor: "#52c41a",
        },
        {
          label: "Purchases",
          data: [8000, 9000, 7500, 10000, 9500, 11000],
          backgroundColor: "#1890ff",
        },
      ],
    }
  }

  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2) {
      this.loadReportsData()
    }
  }

  exportAllReports(): void {
    this.printService.generateReport(
      {
        totalRevenue: this.totalRevenue,
        totalOrders: this.totalOrders,
        avgOrderValue: this.avgOrderValue,
        profitMargin: this.profitMargin,
        dateRange: this.dateRange,
      },
      "Business Reports Summary",
    )
  }
}
