import { Component, OnInit } from "@angular/core"
import { Router, RouterModule } from "@angular/router"
import { NzMessageService } from "ng-zorro-antd/message"
import { AccountService } from "../../core/services/account.service"
import { Account, AccountType } from "../../core/models/account.model"
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
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: "app-account-list",
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
    NzIconModule,
    RouterModule,
    NzPopconfirmModule
  ],
  templateUrl: "./account-list.component.html",
  styleUrls: ["./account-list.component.scss"],
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = []
  filteredAccounts: Account[] = []
  loading = false
  searchValue = ""

  constructor(
    private accountService: AccountService,
    private router: Router,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.loadAccounts()
  }

  loadAccounts(): void {
    this.loading = true
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts
        this.filteredAccounts = accounts
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading accounts:", error)
        this.message.error("Error loading accounts")
        this.loading = false
      },
    })
  }

  onSearch(): void {
    this.filteredAccounts = this.accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        account.code.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        account.type.toLowerCase().includes(this.searchValue.toLowerCase()),
    )
  }

  viewAccount(account: Account): void {
    this.router.navigate(["/view-details", account.id])
  }

  editAccount(account: Account): void {
    this.router.navigate(["/accounts", account.id, "edit"])
  }

  deleteAccount(account: Account): void {
    // debugger
    this.accountService.deleteAccount(account.id).subscribe({
      next: () => {
        this.message.success("Account deleted successfully")
        this.loadAccounts()
      },
      error: (error) => {
        console.error("Error deleting account:", error)
        this.message.error("Error deleting account")
      },
    })
  }

  getAccountTypeColor(type: AccountType): string {
    switch (type) {
      case AccountType.ASSET:
        return "blue";
      case AccountType.LIABILITY:
        return "red";
      case AccountType.EQUITY:
        return "purple";
      case AccountType.INCOME:
        return "green";
      case AccountType.EXPENSE:
        return "orange";
      default:
        return "default";
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
}
