import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { ReportsService } from "../../core/services/reports.service"
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
import { NzTabsModule } from "ng-zorro-antd/tabs"
import { NzSpinModule } from "ng-zorro-antd/spin"
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb"
import { ProfitLossReportComponent } from "./profit-loss-report/profit-loss-report.component"

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ProfitLossReportComponent,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzDatePickerModule,
    NzBreadCrumbModule,
    NzSelectModule,
    NzTabsModule,
    NzSpinModule
  ],
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  dateRangeForm: FormGroup
  loading = false
  selectedTabIndex = 0

  // Report data
  salesReport: any = null
  purchaseReport: any = null
  stockReport: any = null
  profitLossReport: any = null
  expenseReport: any = null
  accountBalanceReport: any = null

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
  ) {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    this.dateRangeForm = this.fb.group({
      dateRange: [[firstDayOfMonth, today]],
    })
  }

  ngOnInit(): void {
    this.loadAllReports()
  }

  loadAllReports(): void {
    const dateRange = this.dateRangeForm.value.dateRange
    const startDate = dateRange[0]
    const endDate = dateRange[1]

    this.loading = true

    // Load all reports
    this.loadSalesReport(startDate, endDate)
    this.loadPurchaseReport(startDate, endDate)
    this.loadStockReport()
    this.loadProfitLossReport(startDate, endDate)
    this.loadExpenseReport(startDate, endDate)
    this.loadAccountBalanceReport()
  }

  loadSalesReport(startDate: Date, endDate: Date): void {
    this.reportsService.getSalesReport(startDate, endDate).subscribe({
      next: (data) => {
        this.salesReport = data
      },
      error: (error) => {
        console.error("Error loading sales report:", error)
      },
    })
  }

  loadPurchaseReport(startDate: Date, endDate: Date): void {
    this.reportsService.getPurchaseReport(startDate, endDate).subscribe({
      next: (data) => {
        this.purchaseReport = data
      },
      error: (error) => {
        console.error("Error loading purchase report:", error)
      },
    })
  }

  loadStockReport(): void {
    this.reportsService.getStockReport().subscribe({
      next: (data) => {
        this.stockReport = data
      },
      error: (error) => {
        console.error("Error loading stock report:", error)
      },
    })
  }

  loadProfitLossReport(startDate: Date, endDate: Date): void {
    this.reportsService.getProfitLossStatement(startDate, endDate).subscribe({
      next: (data) => {
        this.profitLossReport = data
      },
      error: (error) => {
        console.error("Error loading profit & loss report:", error)
      },
    })
  }

  loadExpenseReport(startDate: Date, endDate: Date): void {
    this.reportsService.getExpenseReport(startDate, endDate).subscribe({
      next: (data) => {
        this.expenseReport = data
      },
      error: (error) => {
        console.error("Error loading expense report:", error)
      },
    })
  }

  loadAccountBalanceReport(): void {
    this.reportsService.getAccountBalanceReport().subscribe({
      next: (data) => {
        this.accountBalanceReport = data
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading account balance report:", error)
        this.loading = false
      },
    })
  }

  onDateRangeChange(): void {
    this.loadAllReports()
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString()
  }
}
