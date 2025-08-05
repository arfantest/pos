import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder,  FormGroup, ReactiveFormsModule } from "@angular/forms"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzGridModule } from "ng-zorro-antd/grid"
import { NzSpinModule } from "ng-zorro-antd/spin"
import  { NzMessageService } from "ng-zorro-antd/message"
import { BaseChartDirective } from "ng2-charts"
import { Chart,  ChartConfiguration,  ChartType, registerables } from "chart.js"
import { format, subDays } from "date-fns"
import  { ReportService, PurchaseReportData } from "../../../core/services/report.service"
import  { PrintService } from "../../../core/services/print.service"

Chart.register(...registerables)

@Component({
  selector: "app-purchase-report",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzDatePickerModule,
    NzTableModule,
    NzStatisticModule,
    NzGridModule,
    NzSpinModule,
    BaseChartDirective,
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Purchase Report</h1>
        <p class="text-gray-600">Analyze your purchase data and trends</p>
      </div>

      <!-- Filters -->
      <nz-card class="mb-6">
        <form [formGroup]="filterForm" class="flex gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <nz-range-picker
              formControlName="dateRange"
              class="w-full"
              [nzFormat]="'yyyy-MM-dd'"
            ></nz-range-picker>
          </div>
          <div>
            <button
              nz-button
              nzType="primary"
              (click)="loadReport()"
              [nzLoading]="loading"
            >
              Generate Report
            </button>
          </div>
          <div>
            <button
              nz-button
              nzType="default"
              (click)="exportToPDF()"
              [disabled]="!reportData"
            >
              Export PDF
            </button>
          </div>
        </form>
      </nz-card>

      <div *ngIf="loading" class="text-center py-12">
        <nz-spin nzSize="large"></nz-spin>
      </div>

      <div *ngIf="reportData && !loading" id="purchase-report-content">
        <!-- Summary Cards -->
        <div nz-row [nzGutter]="16" class="mb-6">
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Total Purchases"
                [nzValue]="reportData.summary.totalPurchases"
                nzPrefix="$"
                ></nz-statistic>
                // [nzPrecision]="2"
                // nzValueStyle="color: #3f8600"
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Purchase Count"
                [nzValue]="reportData.summary.purchaseCount"
                ></nz-statistic>
                // nzValueStyle="color: #1890ff"
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Average Purchase Value"
                [nzValue]="reportData.summary.avgPurchaseValue"
                nzPrefix="$"
                ></nz-statistic>
                // [nzPrecision]="2"
                // nzValueStyle="color: #722ed1"
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Items Purchased"
                [nzValue]="reportData.summary.totalItemsPurchased"
                ></nz-statistic>
                // nzValueStyle="color: #fa8c16"
            </nz-card>
          </div>
        </div>

        <!-- Chart -->
        <nz-card class="mb-6" nzTitle="Purchase Trends">
          <div class="h-96">
            <canvas
              baseChart
              [data]="chartData"
              [options]="chartOptions"
              []="chartType"
            ></canvas>
          </div>
        </nz-card>

        <!-- Purchase Table -->
        <nz-card nzTitle="Purchase Details">
          <nz-table
            #purchaseTable
            [nzData]="reportData.purchases"
            [nzPageSize]="10"
            [nzShowSizeChanger]="true"
            [nzShowQuickJumper]="true"
            nzSize="middle"
          >
            <thead>
              <tr>
                <th>Purchase ID</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let purchase of purchaseTable.data">
                <td>{{ purchase.id }}</td>
                <td>{{ purchase.createdAt | date: 'short' }}</td>
                <td>{{ purchase.supplier || 'N/A' }}</td>
                <td>{{ purchase.items?.length || 0 }}</td>
                <td>{{ purchase.totalAmount | currency }}</td>
                <td>
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800': purchase.status === 'completed',
                      'bg-yellow-100 text-yellow-800': purchase.status === 'pending',
                      'bg-red-100 text-red-800': purchase.status === 'cancelled'
                    }"
                  >
                    {{ purchase.status | titlecase }}
                  </span>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </nz-card>
      </div>
    </div>
  `,
})
export class PurchaseReportComponent implements OnInit {
  filterForm: FormGroup
  reportData: PurchaseReportData | null = null
  loading = false

  chartType: ChartType = "line"
  chartData: ChartConfiguration["data"] = {
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
      title: {
        display: true,
        text: "Purchase Trends Over Time",
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
    private fb: FormBuilder,
    private reportService: ReportService,
    private printService: PrintService,
    private message: NzMessageService,
  ) {
    this.filterForm = this.fb.group({
      dateRange: [[subDays(new Date(), 30), new Date()]],
    })
  }

  ngOnInit(): void {
    this.loadReport()
  }

  loadReport(): void {
    const dateRange = this.filterForm.get("dateRange")?.value
    if (!dateRange || dateRange.length !== 2) {
      this.message.error("Please select a valid date range")
      return
    }

    this.loading = true
    const startDate = format(dateRange[0], "yyyy-MM-dd")
    const endDate = format(dateRange[1], "yyyy-MM-dd")

    this.reportService.getPurchaseReport(startDate, endDate).subscribe({
      next: (data) => {
        this.reportData = data
        this.updateChart()
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading purchase report:", error)
        this.message.error("Failed to load purchase report")
        this.loading = false
      },
    })
  }

  updateChart(): void {
    if (this.reportData?.chartData) {
      this.chartData = {
        labels: this.reportData.chartData.labels,
        datasets: [
          {
            label: "Purchase Amount",
            data: this.reportData.chartData.datasets[0]?.data || [],
            borderColor: "#1890ff",
            backgroundColor: "rgba(24, 144, 255, 0.1)",
            tension: 0.4,
          },
        ],
      }
    }
  }

  exportToPDF(): void {
    if (this.reportData) {
      this.printService.printElement("purchase-report-content", "purchase-report.pdf")
    }
  }
}
