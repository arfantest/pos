import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { NzMessageService } from "ng-zorro-antd/message"
import  { ExpenseService } from "../../core/services/expense.service"
import { AccountService } from "../../core/services/account.service"
import { Account, AccountType } from "../../core/models/account.model"
import  { CreateExpenseDto } from "../../core/models/expense.model"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzInputNumberModule } from "ng-zorro-antd/input-number"

@Component({
  selector: "app-expense-form",
  standalone:true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NzCardModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzInputModule,
    NzButtonModule,
    NzBreadCrumbModule,
  ],
  templateUrl: "./expense-form.component.html",
  styleUrls: ["./expense-form.component.scss"],
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup
  isEditMode = false
  expenseId: string | null = null
  loading = false
  submitting = false
  accounts: Account[] = []

  expenseCategories = [
    "Office Supplies",
    "Utilities",
    "Rent",
    "Marketing",
    "Travel",
    "Meals & Entertainment",
    "Professional Services",
    "Insurance",
    "Maintenance",
    "Fuel",
    "Other",
  ]

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
  ) {
    this.expenseForm = this.fb.group({
      description: ["", [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      category: ["", Validators.required],
      accountId: ["", Validators.required],
      receiptNumber: [""],
      notes: [""],
    })
  }

  ngOnInit(): void {
    this.loadAccounts()
    this.expenseId = this.route.snapshot.paramMap.get("id")
    this.isEditMode = !!this.expenseId

    if (this.isEditMode && this.expenseId) {
      this.loadExpense(this.expenseId)
    }
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(
          (account) =>
            account.type === AccountType.EXPENSE ||
            (account.type === AccountType.ASSET &&
              (account.name.toLowerCase().includes("cash") || account.name.toLowerCase().includes("bank"))),
        )
      },
      error: (error) => {
        console.error("Error loading accounts:", error)
        this.message.error("Error loading accounts")
      },
    })
  }

  loadExpense(id: string): void {
    this.loading = true
    this.expenseService.getExpense(id).subscribe({
      next: (expense) => {
        this.expenseForm.patchValue({
          description: expense.description,
          amount: expense.amount,
          date: new Date(expense.date),
          category: expense.category,
          accountId: expense.accountId,
          receiptNumber: expense.receiptNumber,
          notes: expense.notes,
        })
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading expense:", error)
        this.message.error("Error loading expense")
        this.loading = false
      },
    })
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.submitting = true
      const expenseData: CreateExpenseDto = {
        ...this.expenseForm.value,
        date: new Date(this.expenseForm.value.date),
      }

      const operation =
        this.isEditMode && this.expenseId
          ? this.expenseService.updateExpense(this.expenseId, expenseData)
          : this.expenseService.createExpense(expenseData)

      operation.subscribe({
        next: () => {
          const message = this.isEditMode ? "Expense updated successfully" : "Expense created successfully"
          this.message.success(message)
          this.router.navigate(["/expenses"])
        },
        error: (error) => {
          console.error("Error saving expense:", error)
          this.message.error("Error saving expense")
          this.submitting = false
        },
      })
    } else {
      Object.values(this.expenseForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }

  onCancel(): void {
    this.router.navigate(["/expenses"])
  }
}
