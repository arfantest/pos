import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzModalModule } from "ng-zorro-antd/modal"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzMessageService } from "ng-zorro-antd/message"
import { SaleService } from "../../../core/services/sale.service"
import { Sale } from "../../../core/models/sale.model"

@Component({
  selector: "app-sale-returns",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzTagModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sale Returns</h1>
            <p class="text-gray-600 mt-1">Manage customer returns and refunds</p>
          </div>
          <button nz-button nzType="primary" (click)="showCreateReturnModal()" class="bg-blue-600 hover:bg-blue-700">
            <span nz-icon nzType="plus"></span>
            New Return
          </button>
        </div>

        <!-- Returns Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Sale Returns</h3>
          </div>
          
          <nz-table #returnsTable [nzData]="returns" [nzLoading]="loading">
            <thead>
              <tr>
                <th class="text-left">Return #</th>
                <th class="text-left">Original Invoice</th>
                <th class="text-left">Customer</th>
                <th class="text-right">Return Amount</th>
                <th class="text-center">Status</th>
                <th class="text-left">Return Date</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let return of returnsTable.data">
                <td class="font-medium text-blue-600">{{ return.returnNumber }}</td>
                <td>{{ return.sale.invoiceNumber }}</td>
                <td>{{ return.sale.customerName || 'Walk-in' }}</td>
                <td class="text-right font-semibold">\${{ return.total | number:'1.2-2' }}</td>
                <td class="text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': return.status === 'pending',
                          'bg-green-100 text-green-800': return.status === 'approved',
                          'bg-red-100 text-red-800': return.status === 'rejected'
                        }">
                    {{ return.status | titlecase }}
                  </span>
                </td>
                <td>{{ return.createdAt | date:'short' }}</td>
                <td class="text-center">
                  <button nz-button nzType="link" nzSize="small" (click)="viewReturn(return)">
                    <span nz-icon nzType="eye" class="text-blue-600"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>

        <!-- Create Return Modal -->
        <nz-modal
          [(nzVisible)]="isCreateReturnModalVisible"
          nzTitle="Create Sale Return"
          (nzOnCancel)="handleCreateReturnCancel()"
          (nzOnOk)="handleCreateReturnOk()"
          [nzOkLoading]="processing"
          nzWidth="800px"
        >
          <ng-container *nzModalContent>
            <form nz-form [formGroup]="returnForm">
              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Sale Invoice</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please select sale invoice!">
                  <nz-select formControlName="saleId" nzPlaceHolder="Select Sale Invoice" (ngModelChange)="onSaleSelect()">
                    <nz-option *ngFor="let sale of sales" [nzValue]="sale.id" [nzLabel]="sale.invoiceNumber + ' - ' + (sale.customerName || 'Walk-in')"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Reason</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input return reason!">
                  <textarea nz-input formControlName="reason" placeholder="Reason for return" rows="3"></textarea>
                </nz-form-control>
              </nz-form-item>

              <div *ngIf="selectedSale">
                <h4 class="text-lg font-semibold mb-4">Select Items to Return</h4>
                <nz-table #itemsTable [nzData]="selectedSale.items" [nzShowPagination]="false">
                  <thead>
                    <tr>
                      <th class="text-left">Product</th>
                      <th class="text-center">Sold Qty</th>
                      <th class="text-center">Return Qty</th>
                      <th class="text-right">Unit Price</th>
                      <th class="text-right">Return Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of itemsTable.data; let i = index">
                      <td>{{ item.product.name }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-center">
                        <input 
                          nz-input 
                          type="number" 
                          [(ngModel)]="returnItems[i].quantity" 
                          [max]="item.quantity"
                          min="0"
                          (input)="calculateReturnTotal()"
                          class="w-20 text-center"
                        />
                      </td>
                      <td class="text-right">\${{ item.unitPrice | number:'1.2-2' }}</td>
                      <td class="text-right font-semibold">\${{ (returnItems[i].quantity * item.unitPrice) | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                </nz-table>

                <div class="flex justify-end mt-4">
                  <div class="text-right">
                    <div class="text-lg font-bold">Total Return Amount: \${{ returnTotal | number:'1.2-2' }}</div>
                  </div>
                </div>
              </div>
            </form>
          </ng-container>
        </nz-modal>
      </div>
    </div>
  `,
})
export class SaleReturnsComponent implements OnInit {
  returns: any[] = []
  sales: Sale[] = []
  loading = false
  processing = false
  isCreateReturnModalVisible = false
  selectedSale: Sale | null = null
  returnItems: { quantity: number }[] = []
  returnTotal = 0

  returnForm: FormGroup

  constructor(
    private saleService: SaleService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {
    this.returnForm = this.fb.group({
      saleId: ["", [Validators.required]],
      reason: ["", [Validators.required]],
    })
  }

  ngOnInit(): void {
    this.loadReturns()
    this.loadSales()
  }

  loadReturns(): void {
    this.loading = true
    this.saleService.getSaleReturns().subscribe({
      next: (returns) => {
        this.returns = returns
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load sale returns")
        this.loading = false
      },
    })
  }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (sales) => {
        this.sales = sales.filter((s) => s.status === "completed")
      },
      error: (error) => {
        this.message.error("Failed to load sales")
      },
    })
  }

  showCreateReturnModal(): void {
    this.isCreateReturnModalVisible = true
    this.returnForm.reset()
    this.selectedSale = null
    this.returnItems = []
    this.returnTotal = 0
  }

  onSaleSelect(): void {
    const saleId = this.returnForm.get("saleId")?.value
    this.selectedSale = this.sales.find((s) => s.id === saleId) || null

    if (this.selectedSale) {
      this.returnItems = this.selectedSale.items.map(() => ({ quantity: 0 }))
    }
  }

  calculateReturnTotal(): void {
    if (!this.selectedSale) return

    this.returnTotal = this.selectedSale.items.reduce((total, item, index) => {
      return total + (this.returnItems[index]?.quantity || 0) * item.unitPrice
    }, 0)
  }

  handleCreateReturnOk(): void {
    if (!this.returnForm.valid || !this.selectedSale) {
      this.message.error("Please fill in all required fields")
      return
    }

    const hasReturnItems = this.returnItems.some((item) => item.quantity > 0)
    if (!hasReturnItems) {
      this.message.error("Please select at least one item to return")
      return
    }

    this.processing = true

    const returnData = {
      saleId: this.returnForm.value.saleId,
      reason: this.returnForm.value.reason,
      items: this.selectedSale.items
        .map((item, index) => ({
          productId: item.product.id,
          quantity: this.returnItems[index].quantity,
          unitPrice: item.unitPrice,
        }))
        .filter((item) => item.quantity > 0),
    }

    this.saleService.createSaleReturn(returnData).subscribe({
      next: (returnRecord) => {
        this.message.success("Sale return created successfully")
        this.isCreateReturnModalVisible = false
        this.processing = false
        this.loadReturns()
      },
      error: (error) => {
        this.message.error("Failed to create sale return")
        this.processing = false
      },
    })
  }

  handleCreateReturnCancel(): void {
    this.isCreateReturnModalVisible = false
  }

  viewReturn(returnRecord: any): void {
    // Implement view return details
    console.log("View return:", returnRecord)
  }
}
