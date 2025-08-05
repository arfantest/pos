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
import { PurchaseService } from "../../../core/services/purchase.service"
import { Purchase, PurchaseReturn } from "../../../core/models/purchase.model"

@Component({
  selector: "app-purchase-returns",
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
            <h1 class="text-3xl font-bold text-gray-900">Purchase Returns</h1>
            <p class="text-gray-600 mt-1">Manage returns to suppliers</p>
          </div>
          <button nz-button nzType="primary" (click)="showCreateReturnModal()" class="bg-blue-600 hover:bg-blue-700">
            <span nz-icon nzType="plus"></span>
            New Return
          </button>
        </div>

        <!-- Returns Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Purchase Returns</h3>
          </div>
          
          <nz-table #returnsTable [nzData]="returns" [nzLoading]="loading">
            <thead>
              <tr>
                <th class="text-left">Return #</th>
                <th class="text-left">Original PO</th>
                <th class="text-left">Supplier</th>
                <th class="text-right">Return Amount</th>
                <th class="text-center">Status</th>
                <th class="text-left">Return Date</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let return of returnsTable.data">
                <td class="font-medium text-blue-600">{{ return.returnNumber }}</td>
                <td>{{ return.purchase.purchaseOrderNumber }}</td>
                <td>{{ return.purchase.supplierName }}</td>
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
          nzTitle="Create Purchase Return"
          (nzOnCancel)="handleCreateReturnCancel()"
          (nzOnOk)="handleCreateReturnOk()"
          [nzOkLoading]="processing"
          nzWidth="800px"
        >
          <ng-container *nzModalContent>
            <form nz-form [formGroup]="returnForm">
              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Purchase Order</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please select purchase order!">
                  <nz-select formControlName="purchaseId" nzPlaceHolder="Select Purchase Order" (ngModelChange)="onPurchaseSelect()">
                    <nz-option *ngFor="let purchase of purchases" [nzValue]="purchase.id" [nzLabel]="purchase.purchaseOrderNumber + ' - ' + purchase.supplierName"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Reason</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input return reason!">
                  <textarea nz-input formControlName="reason" placeholder="Reason for return" rows="3"></textarea>
                </nz-form-control>
              </nz-form-item>

              <div *ngIf="selectedPurchase">
                <h4 class="text-lg font-semibold mb-4">Select Items to Return</h4>
                <nz-table #itemsTable [nzData]="selectedPurchase.items" [nzShowPagination]="false">
                  <thead>
                    <tr>
                      <th class="text-left">Product</th>
                      <th class="text-center">Purchased Qty</th>
                      <th class="text-center">Return Qty</th>
                      <th class="text-right">Unit Cost</th>
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
                      <td class="text-right">\${{ item.unitCost | number:'1.2-2' }}</td>
                      <td class="text-right font-semibold">\${{ (returnItems[i].quantity * item.unitCost) | number:'1.2-2' }}</td>
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
export class PurchaseReturnsComponent implements OnInit {
  returns: PurchaseReturn[] = []
  purchases: Purchase[] = []
  loading = false
  processing = false
  isCreateReturnModalVisible = false
  selectedPurchase: Purchase | null = null
  returnItems: { quantity: number }[] = []
  returnTotal = 0

  returnForm: FormGroup

  constructor(
    private purchaseService: PurchaseService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {
    this.returnForm = this.fb.group({
      purchaseId: ["", [Validators.required]],
      reason: ["", [Validators.required]],
    })
  }

  ngOnInit(): void {
    this.loadReturns()
    this.loadPurchases()
  }

  loadReturns(): void {
    this.loading = true
    this.purchaseService.getPurchaseReturns().subscribe({
      next: (returns) => {
        this.returns = returns
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load purchase returns")
        this.loading = false
      },
    })
  }

  loadPurchases(): void {
    this.purchaseService.getPurchases().subscribe({
      next: (purchases) => {
        this.purchases = purchases.filter((p) => p.status === "received")
      },
      error: (error) => {
        this.message.error("Failed to load purchases")
      },
    })
  }

  showCreateReturnModal(): void {
    this.isCreateReturnModalVisible = true
    this.returnForm.reset()
    this.selectedPurchase = null
    this.returnItems = []
    this.returnTotal = 0
  }

  onPurchaseSelect(): void {
    const purchaseId = this.returnForm.get("purchaseId")?.value
    this.selectedPurchase = this.purchases.find((p) => p.id === purchaseId) || null

    if (this.selectedPurchase) {
      this.returnItems = this.selectedPurchase.items.map(() => ({ quantity: 0 }))
    }
  }

  calculateReturnTotal(): void {
    if (!this.selectedPurchase) return

    this.returnTotal = this.selectedPurchase.items.reduce((total, item, index) => {
      return total + (this.returnItems[index]?.quantity || 0) * item.unitCost
    }, 0)
  }

  handleCreateReturnOk(): void {
    if (!this.returnForm.valid || !this.selectedPurchase) {
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
      purchaseId: this.returnForm.value.purchaseId,
      reason: this.returnForm.value.reason,
      items: this.selectedPurchase.items
        .map((item, index) => ({
          productId: item.product.id,
          quantity: this.returnItems[index].quantity,
          unitCost: item.unitCost,
        }))
        .filter((item) => item.quantity > 0),
    }

    this.purchaseService.createPurchaseReturn(returnData).subscribe({
      next: (returnRecord) => {
        this.message.success("Purchase return created successfully")
        this.isCreateReturnModalVisible = false
        this.processing = false
        this.loadReturns()
      },
      error: (error) => {
        this.message.error("Failed to create purchase return")
        this.processing = false
      },
    })
  }

  handleCreateReturnCancel(): void {
    this.isCreateReturnModalVisible = false
  }

  viewReturn(returnRecord: PurchaseReturn): void {
    // Implement view return details
    console.log("View return:", returnRecord)
  }
}
