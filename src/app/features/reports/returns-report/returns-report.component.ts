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
import { NzTabsModule } from "ng-zorro-antd/tabs"
import  { NzMessageService } from "ng-zorro-antd/message"
import { BaseChartDirective } from "ng2-charts"
import { Chart,  ChartConfiguration,  ChartType, registerables } from "chart.js"
import { format, subDays } from "date-fns"
import { ReportService, ReturnsReportData } from "../../../core/services/report.service"
import { PrintService } from "../../../core/services/print.service"

Chart.register(...registerables)

@Component({
  selector: "app-returns-report",
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
    NzTabsModule,
    BaseChartDirective,
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Returns Report</h1>
        <p class="text-gray-600">Track and analyze return patterns and trends</p>
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

      <div *ngIf="reportData && !loading" id="returns-report-content">
        <!-- Summary Cards -->
        <div nz-row [nzGutter]="16" class="mb-6">
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Sale Returns Value"
                [nzValue]="reportData.summary.saleReturnValue"
                nzPrefix="$"
                ></nz-statistic>
                // [nzPrecision]="2"
                // nzValueStyle="color: #cf1322"
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Purchase Returns Value"
                [nzValue]="reportData.summary.purchaseReturnValue"
                nzPrefix="$"
                ></nz-statistic>
                [nzPrecision]="2"
                // nzValueStyle="color: #fa8c16"
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Total Sale Returns"
                [nzValue]="reportData.summary.totalSaleReturns"
                ></nz-statistic>
                // nzValueStyle="color: #1890ff"
            </nz-card>
          </div>
          <div nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Return Rate"
                [nzValue]="reportData.summary.returnRate"
                nzSuffix="%"
                ></nz-statistic>
                // [nzPrecision]="2"
                // nzValueStyle="color: #722ed1"
                </nz-card>
          </div>
        </div>

        <!-- Chart -->
        <nz-card class="mb-6" nzTitle="Returns Trends">
          <div class="h-96">
            <canvas
              baseChart
              [data]="chartData"
              [options]="chartOptions"
              []="chartType"
            ></canvas>
          </div>
        </nz-card>

        <!-- Returns Tables -->
        <nz-tabset>
          <nz-tab nzTitle="Sale Returns">
            <nz-card nzTitle="Sale Returns Details">
              <nz-table
                #saleReturnsTable
                [nzData]="reportData.saleReturns"
                [nzPageSize]="10"
                [nzShowSizeChanger]="true"
                [nzShowQuickJumper]="true"
                nzSize="middle"
              >
                <thead>
                  <tr>
                    <th>Return ID</th>
                    <th>Original Sale ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items Returned</th>
                    <th>Return Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let return of saleReturnsTable.data">
                    <td>{{ return.id }}</td>
                    <td>{{ return.saleId }}</td>
                    <td>{{ return.createdAt | date: 'short' }}</td>
                    <td>{{ return.customerName || 'Walk-in Customer' }}</td>
                    <td>{{ return.items?.length || 0 }}</td>
                    <td>{{ return.totalAmount | currency }}</td>
                    <td>{{ return.reason || 'N/A' }}</td>
                    <td>
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': return.status === 'completed',
                          'bg-yellow-100 text-yellow-800': return.status === 'pending',
                          'bg-red-100 text-red-800': return.status === 'rejected'
                        }"
                      >
                        {{ return.status | titlecase }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </nz-tab>

          <nz-tab nzTitle="Purchase Returns">
            <nz-card nzTitle="Purchase Returns Details">
              <nz-table
                #purchaseReturnsTable
                [nzData]="reportData.purchaseReturns"
                [nzPageSize]="10"
                [nzShowSizeChanger]="true"
                [nzShowQuickJumper]="true"
                nzSize="middle"
              >
                <thead>
                  <tr>
                    <th>Return ID</th>
                    <th>Original Purchase ID</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Items Returned</th>
                    <th>Return Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let return of purchaseReturnsTable.data">
                    <td>{{ return.id }}</td>
                    <td>{{ return.purchaseId }}</td>
                    <td>{{ return.createdAt | date: 'short' }}</td>
                    <td>{{ return.supplierName || 'N/A' }}</td>
                    <td>{{ return.items?.length || 0 }}</td>
                    <td>{{ return.totalAmount | currency }}</td>
                    <td>{{ return.reason || 'N/A' }}</td>
                    <td>
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': return.status === 'completed',
                          'bg-yellow-100 text-yellow-800': return.status === 'pending',
                          'bg-red-100 text-red-800': return.status === 'rejected'
                        }"
                      >
                        {{ return.status | titlecase }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </nz-tab>
        </nz-tabset>
      </div>
    </div>
  `,
})
export class ReturnsReportComponent implements OnInit {
  filterForm: FormGroup
  reportData: ReturnsReportData | null = null
  loading = false

  chartType: ChartType = "bar"
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
        text: "Returns Comparison Over Time",
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

    this.reportService.getReturnsReport(startDate, endDate).subscribe({
      next: (data) => {
        this.reportData = data
        this.updateChart()
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading returns report:", error)
        this.message.error("Failed to load returns report")
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
            label: "Sale Returns",
            data: this.reportData.chartData.datasets[0]?.data || [],
            backgroundColor: "rgba(207, 19, 34, 0.6)",
            borderColor: "#cf1322",
            borderWidth: 1,
          },
          {
            label: "Purchase Returns",
            data: this.reportData.chartData.datasets[1]?.data || [],
            backgroundColor: "rgba(250, 140, 22, 0.6)",
            borderColor: "#fa8c16",
            borderWidth: 1,
          },
        ],
      }
    }
  }

  exportToPDF(): void {
    if (this.reportData) {
      this.printService.printElement("returns-report-content", "returns-report.pdf")
    }
  }
}
