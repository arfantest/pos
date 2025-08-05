import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzGridModule } from "ng-zorro-antd/grid"
import { BaseChartDirective } from "ng2-charts"
import { Chart, ChartConfiguration, ChartType, registerables } from "chart.js"
import { ReportService } from "../../../core/services/report.service"
import { PrintService } from "../../../core/services/print.service"
import { startOfMonth, endOfMonth, format } from "date-fns"

Chart.register(...registerables)

@Component({
  selector: "app-sales-report",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzStatisticModule,
    NzGridModule,
    BaseChartDirective,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sales Report</h1>
            <p class="text-gray-600 mt-1">Detailed sales analysis and insights</p>
          </div>
          <div class="flex space-x-4">
            <nz-range-picker 
              [(ngModel)]="dateRange" 
              (ngModelChange)="onDateRangeChange()"
              class="w-64"
            ></nz-range-picker>
            <button nz-button nzType="primary" (click)="exportReport()">
              <span nz-icon nzType="download"></span>
              Export PDF
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Sales</p>
                <p class="text-2xl font-bold text-gray-900">\${{ summary.totalSales | number:'1.2-2' }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ summary.salesCount }}</p>
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
                <p class="text-2xl font-bold text-gray-900">\${{ summary.avgOrderValue | number:'1.2-2' }}</p>
              </div>
              <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="bar-chart" class="text-purple-600 text-xl"></span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Items Sold</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.totalItemsSold }}</p>
              </div>
              <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span nz-icon nzType="shopping" class="text-orange-600 text-xl"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Daily Sales Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Daily Sales Trend</h3>
            <div class="chart-container">
              <canvas 
                baseChart
                [data]="dailySalesChartData"
                [options]="chartOptions"
                [type]="chartType">
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
                [options]="pieChartOptions"
                [type]="pieChartType">
              </canvas>
            </div>
          </div>
        </div>

        <!-- Detailed Sales Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Sales Details</h3>
          </div>
          
          <nz-table #salesTable [nzData]="salesData" [nzLoading]="loading">
            <thead>
              <tr>
                <th class="text-left">Date</th>
                <th class="text-left">Invoice #</th>
                <th class="text-left">Customer</th>
                <th class="text-right">Items</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">Tax</th>
                <th class="text-right">Total</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sale of salesTable.data">
                <td>{{ sale.createdAt | date:'short' }}</td>
                <td class="font-medium text-blue-600">{{ sale.invoiceNumber }}</td>
                <td>{{ sale.customerName || 'Walk-in' }}</td>
                <td class="text-right">{{ sale.items?.length || 0 }}</td>
                <td class="text-right">\${{ sale.subtotal | number:'1.2-2' }}</td>
                <td class="text-right">\${{ sale.tax | number:'1.2-2' }}</td>
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
              </tr>
            </tbody>
          </nz-table>
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
export class SalesReportComponent implements OnInit {
  dateRange: Date[] = []
  loading = false
  salesData: any[] = []

  summary = {
    totalSales: 0,
    salesCount: 0,
    avgOrderValue: 0,
    totalItemsSold: 0,
  }

  // Chart configurations
  chartType: any= "line"
  // chartType: Chart= "line"
  pieChartType: any= "doughnut"
  // pieChartType: Chart= "doughnut"

  dailySalesChartData: ChartConfiguration["data"] = {
    labels: [],
    datasets: [],
  }

  topProductsChartData: ChartConfiguration["data"] = {
    labels: [],
    datasets: [],
  }

  chartOptions: ChartConfiguration["options"] = {
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

  pieChartOptions: ChartConfiguration["options"] = {
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
    private reportService: ReportService,
    private printService: PrintService,
  ) {
    // Set default date range to current month
    const now = new Date()
    this.dateRange = [startOfMonth(now), endOfMonth(now)]
  }

  ngOnInit(): void {
    this.loadSalesReport()
  }

  loadSalesReport(): void {
    this.loading = true
    const startDate = format(this.dateRange[0], "yyyy-MM-dd")
    const endDate = format(this.dateRange[1], "yyyy-MM-dd")

    this.reportService.getSalesReport(startDate, endDate).subscribe({
      next: (data) => {
        this.salesData = data.sales
        this.summary = data.summary
        this.updateCharts()
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading sales report:", error)
        this.loading = false
      },
    })
  }

  updateCharts(): void {
    // Update daily sales chart
    const dailyData = this.groupSalesByDay()
    this.dailySalesChartData = {
      labels: dailyData.labels,
      datasets: [
        {
          label: "Daily Sales",
          data: dailyData.data,
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }

    // Update top products chart
    const topProducts = this.getTopProducts()
    this.topProductsChartData = {
      labels: topProducts.labels,
      datasets: [
        {
          data: topProducts.data,
          backgroundColor: ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"],
        },
      ],
    }
  }

  groupSalesByDay(): { labels: string[]; data: number[] } {
    const dailyTotals: { [key: string]: number } = {}

    this.salesData.forEach((sale) => {
      const date = format(new Date(sale.createdAt), "MMM dd")
      dailyTotals[date] = (dailyTotals[date] || 0) + sale.total
    })

    return {
      labels: Object.keys(dailyTotals),
      data: Object.values(dailyTotals),
    }
  }

  getTopProducts(): { labels: string[]; data: number[] } {
    const productTotals: { [key: string]: number } = {}

    this.salesData.forEach((sale) => {
      sale.items?.forEach((item: any) => {
        const productName = item.product.name
        productTotals[productName] = (productTotals[productName] || 0) + item.total
      })
    })

    const sorted = Object.entries(productTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      labels: sorted.map(([name]) => name),
      data: sorted.map(([, total]) => total),
    }
  }

  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2) {
      this.loadSalesReport()
    }
  }

  exportReport(): void {
    this.printService.generateReport(
      {
        summary: this.summary,
        sales: this.salesData,
        dateRange: this.dateRange,
      },
      "Sales Report",
    )
  }
}
