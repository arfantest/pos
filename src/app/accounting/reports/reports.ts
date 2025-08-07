import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { DatePipe } from '@angular/common';
import { AccountService } from '../../core/services/account.service';

interface JournalEntry {
  id: string;
  entryNumber: string;
  transactionType: string;
  description: string;
  transactionDate: string;
  totalAmount: string;
  referenceId: string;
  referenceType: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lines: any[];
  createdByUser: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface ApiResponse {
  entries: JournalEntry[];
  total: number;
  page: number;
  totalPages: number;
}

@Component({
  selector: 'app-journal-entries-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzDatePickerModule,
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    NzGridModule
  ],
  providers: [DatePipe],
  template: `
    <div class="filter-section">
      <form nz-form>
        <div nz-row nzGutter="16">
          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>Transaction Type</nz-form-label>
              <nz-form-control>
                <nz-select
                  [(ngModel)]="transactionType"
                  name="transactionType"
                  (ngModelChange)="loadData()"
                >
                  <nz-option nzValue="sale" nzLabel="Sale"></nz-option>
                  <nz-option nzValue="purchase" nzLabel="Purchase"></nz-option>
                  <nz-option nzValue="payment" nzLabel="Payment"></nz-option>
                  <nz-option nzValue="receipt" nzLabel="Receipt"></nz-option>
                  <nz-option nzValue="all" nzLabel="All"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>Start Date</nz-form-label>
              <nz-form-control>
                <nz-date-picker
                  [(ngModel)]="startDate"
                  name="startDate"
                  (ngModelChange)="onDateChange()"
                ></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>End Date</nz-form-label>
              <nz-form-control>
                <nz-date-picker
                  [(ngModel)]="endDate"
                  name="endDate"
                  (ngModelChange)="onDateChange()"
                ></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>Search</nz-form-label>
              <nz-form-control>
                <nz-input-group>
                  <input
                    nz-input
                    [(ngModel)]="searchText"
                    name="searchText"
                    placeholder="Search by description or number"
                    (input)="onSearch()"
                  />
                  <button nz-button nzType="primary" (click)="loadData()">
                    <span nz-icon nzType="search"></span>
                  </button>
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
      </form>
    </div>

    <nz-spin [nzSpinning]="isLoading">
      <nz-table
        #journalEntriesTable
        [nzData]="data.entries"
        [nzFrontPagination]="false"
        [nzTotal]="data.total"
        [nzPageIndex]="pageIndex"
        [nzPageSize]="pageSize"
        (nzPageIndexChange)="onPageIndexChange($event)"
        [nzShowSizeChanger]="true"
        [nzPageSizeOptions]="[10, 20, 50, 100]"
        (nzPageSizeChange)="onPageSizeChange($event)"
      >
        <thead>
          <tr>
            <th nzColumnKey="entryNumber">Entry Number</th>
            <th nzColumnKey="transactionType">Transaction Type</th>
            <th>Description</th>
            <th nzColumnKey="transactionDate">Date</th>
            <th nzColumnKey="totalAmount">Amount</th>
            <th>Reference</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let entry of journalEntriesTable.data">
            <td>{{ entry.entryNumber }}</td>
            <td>{{ entry.transactionType }}</td>
            <td>{{ entry.description }}</td>
            <td>{{ entry.transactionDate | date:'mediumDate' }}</td>
            <td>{{ entry.totalAmount | currency }}</td>
            <td>{{ entry.referenceType }} ({{ entry.referenceId }})</td>
            <td>{{ entry.createdByUser.firstName }} {{ entry.createdByUser.lastName }}</td>
            <td>
              <button nz-button nzType="link" (click)="viewDetails(entry)">
                <span nz-icon nzType="eye" nzTheme="outline"></span>
              </button>
              <nz-divider nzType="vertical"></nz-divider>
              <button nz-button nzType="link" nzDanger (click)="deleteEntry(entry)">
                <span nz-icon nzType="delete" nzTheme="outline"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>
  `,
  styles: [`
    .filter-section {
      margin-bottom: 20px;
      padding: 16px;
      background: #fafafa;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }
    nz-table {
      margin-top: 16px;
    }
    nz-input-group {
      display: flex;
    }
    nz-input-group input {
      flex: 1;
    }
  `]
})
export class JournalEntriesTableComponent implements OnInit {
  isLoading = false;
  data: ApiResponse = {
    entries: [],
    total: 0,
    page: 1,
    totalPages: 0
  };
  pageIndex = 1;
  pageSize = 50;
  transactionType = 'sale';
  startDate: Date = new Date('2025-08-07');
  endDate: Date = new Date('2025-08-08');
  searchText = '';
  sortField: string | null = null;
  sortDirection: 'ascend' | 'descend' | null = null;

  constructor(private accountService :AccountService,  private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Format dates
    const formattedStartDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    const formattedEndDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    
    // Build query parameters
    let params: any = {
      page: this.pageIndex,
      limit: this.pageSize,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
    
    if (this.transactionType !== 'all') {
      params.transactionType = this.transactionType;
    }
    
    if (this.searchText) {
      params.search = this.searchText;
    }
    
    if (this.sortField && this.sortDirection) {
      params.sortField = this.sortField;
      params.sortOrder = this.sortDirection === 'ascend' ? 'asc' : 'desc';
    }
    
    this.getLedger(params)  
  }

  getLedger(params:any){
    this.accountService.getJournalEntries(params).subscribe({
      next: (response) => {
        this.data = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading journal entries:', error);
        this.isLoading = false;
      }
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadData();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.loadData();
  }

  onDateChange(): void {
    if (this.startDate && this.endDate) {
      this.loadData();
    }
  }

  onSearch(): void {
    // Debounce could be added here to prevent too many requests
    this.loadData();
  }

  sortFn = (a: JournalEntry, b: JournalEntry, field: string): number => {
    this.sortField = field;
    // Toggle sort direction if clicking the same field
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortField = field;
      this.sortDirection = 'ascend';
    }
    
    this.loadData();
    return 0; // Actual sorting is done server-side
  };

  viewDetails(entry: JournalEntry): void {
    console.log('View details:', entry);
    // Implement modal or navigation to details view
  }

  deleteEntry(entry: JournalEntry): void {
    console.log('Delete entry:', entry);
    // Implement delete confirmation and API call
  }
}