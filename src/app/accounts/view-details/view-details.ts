import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from "../../core/services/account.service";
import { Account, AccountType } from "../../core/models/account.model";
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-view-details',
  standalone: true,
  imports: [
    NzCardModule,
    NzSpinModule,
    CommonModule,
    NzTagModule,
    NzDividerModule,
    CurrencyPipe,
    NzGridModule
    
  ],
  templateUrl: './view-details.html',
  styleUrl: './view-details.scss'
})
export class ViewDetails implements OnInit {
  account: Account = {
    id: '',
    code: '',
    name: '',
    type: AccountType.ASSET, // Default value
    balance: 0,
    isActive: true
  };
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.accountService.getAccount(id).subscribe({
        next: (data) => {
          this.account = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching account details:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getAccountTypeName(type: AccountType): string {
    switch(type) {
      case AccountType.ASSET: return 'Asset';
      case AccountType.LIABILITY: return 'Liability';
      case AccountType.EQUITY: return 'Equity';
      case AccountType.INCOME: return 'Income';
      case AccountType.EXPENSE: return 'Expense';
      default: return 'Unknown';
    }
  }

  getTagColor(type: AccountType): string {
    switch(type) {
      case AccountType.ASSET: return 'green';
      case AccountType.LIABILITY: return 'red';
      case AccountType.EQUITY: return 'blue';
      case AccountType.INCOME: return 'geekblue';
      case AccountType.EXPENSE: return 'orange';
      default: return 'default';
    }
  }

  goBack(): void {
    window.history.back();
  }
}