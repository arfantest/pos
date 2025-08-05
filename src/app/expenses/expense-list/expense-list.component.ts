import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { NzMessageService } from "ng-zorro-antd/message"
import { ExpenseService } from "../../core/services/expense.service"
import { Expense } from "../../core/models/expense.model"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzModalModule } from "ng-zorro-antd/modal"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzDropDownModule } from "ng-zorro-antd/dropdown"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzGridModule } from "ng-zorro-antd/grid"
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-expense-list",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzInputModule,
    NzModalModule,
    NzTagModule,
    NzDropDownModule,
    NzStatisticModule,
    NzGridModule,
    NzBreadCrumbModule,
  ],
  templateUrl: "./expense-list.component.html",
  styleUrls: ["./expense-list.component.scss"],
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = []
  filteredExpenses: Expense[] = []
  loading = false
  searchValue = ""
  totalExpenses = 0

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.loadExpenses()
  }

  loadExpenses(): void {
    this.loading = true
    this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses
        this.filteredExpenses = expenses
        this.totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading expenses:", error)
        this.message.error("Error loading expenses")
        this.loading = false
      },
    })
  }

  onSearch(): void {
    this.filteredExpenses = this.expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        expense.category.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        (expense.receiptNumber && expense.receiptNumber.toLowerCase().includes(this.searchValue.toLowerCase())),
    )
  }

  editExpense(expense: Expense): void {
    this.router.navigate(["/expenses", expense.id, "edit"])
  }

  deleteExpense(expense: Expense): void {
    this.expenseService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.message.success("Expense deleted successfully")
        this.loadExpenses()
      },
      error: (error) => {
        console.error("Error deleting expense:", error)
        this.message.error("Error deleting expense")
      },
    })
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString()
  }
}
