import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzMessageService } from "ng-zorro-antd/message"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzDividerModule } from "ng-zorro-antd/divider"
import { NzGridModule } from "ng-zorro-antd/grid"
import { ProductService } from "../../../core/services/product.service"
import { PurchaseService } from "../../../core/services/purchase.service"
import { Product } from "../../../core/models/product.model"
import { CreatePurchaseItemRequest } from "../../../core/models/purchase.model"

interface PurchaseCartItem {
  product: Product
  quantity: number
  unitCost: number
  total: number
}

@Component({
  selector: "app-new-purchase",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzTableModule,
    NzFormModule,
    NzSelectModule,
    NzIconModule,
    NzDividerModule,
    NzGridModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">New Purchase Order</h1>
            <p class="text-gray-600 mt-1">Create a new purchase order for your suppliers</p>
          </div>
          <button nz-button (click)="goBack()" class="bg-gray-600 hover:bg-gray-700 text-white">
            <span nz-icon nzType="arrow-left"></span>
            Back to List
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Product Search -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Products</h3>
            
            <div class="space-y-4">
              <div>
                <input 
                  nz-input 
                  placeholder="Search products..." 
                  [(ngModel)]="searchText" 
                  (input)="onSearch()"
                  class="w-full"
                />
              </div>

              <div class="max-h-96 overflow-y-auto space-y-2" *ngIf="filteredProducts.length > 0">
                <div 
                  *ngFor="let product of filteredProducts.slice(0, 10)"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  (click)="addToCart(product)"
                >
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">{{ product.sku }} | Stock: {{ product.stock }}</div>
                    <div class="text-sm font-semibold text-blue-600">Cost: \${{ product.cost | number:'1.2-2' }}</div>
                  </div>
                  <button nz-button nzType="primary" nzSize="small">
                    <span nz-icon nzType="plus"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Supplier Information -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
            
            <form nz-form [formGroup]="purchaseForm" class="space-y-4">
              <nz-form-item>
                <nz-form-label [nzSpan]="8" nzRequired>Supplier Name</nz-form-label>
                <nz-form-control [nzSpan]="16" nzErrorTip="Please input supplier name!">
                  <input nz-input formControlName="supplierName" placeholder="Supplier Name" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="8">Contact</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input nz-input formControlName="supplierContact" placeholder="Phone/Email" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="8">Discount (%)</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input 
                    nz-input 
                    type="number" 
                    formControlName="discount" 
                    min="0" 
                    max="100" 
                    (input)="calculateTotals()"
                  />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="8">Tax (%)</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input 
                    nz-input 
                    type="number" 
                    formControlName="tax" 
                    min="0" 
                    (input)="calculateTotals()"
                  />
                </nz-form-control>
              </nz-form-item>
            </form>
          </div>
        </div>

        <!-- Purchase Cart -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Purchase Items</h3>
          </div>
          
          <div class="p-6">
            <div *ngIf="cart.length === 0" class="text-center py-12">
              <span nz-icon nzType="shopping-cart" class="text-4xl text-gray-400 mb-4 block"></span>
              <p class="text-gray-500">No items added. Search and add products above.</p>
            </div>

            <nz-table #cartTable [nzData]="cart" [nzShowPagination]="false" *ngIf="cart.length > 0">
              <thead>
                <tr>
                  <th class="text-left">Product</th>
                  <th class="text-left">SKU</th>
                  <th class="text-right">Unit Cost</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-right">Total</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of cartTable.data; let i = index">
                  <td class="font-medium">{{ item.product.name }}</td>
                  <td class="text-gray-600">{{ item.product.sku }}</td>
                  <td class="text-right">
                    <input 
                      nz-input 
                      type="number" 
                      [(ngModel)]="item.unitCost" 
                      min="0" 
                      step="0.01"
                      (input)="updateCartItem(i)"
                      class="w-24 text-right"
                    />
                  </td>
                  <td class="text-center">
                    <input 
                      nz-input 
                      type="number" 
                      [(ngModel)]="item.quantity" 
                      min="1"
                      (input)="updateCartItem(i)"
                      class="w-20 text-center"
                    />
                  </td>
                  <td class="text-right font-semibold">\${{ item.total | number:'1.2-2' }}</td>
                  <td class="text-center">
                    <button nz-button nzType="link" nzSize="small" (click)="removeFromCart(i)">
                      <span nz-icon nzType="delete" class="text-red-500"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </nz-table>

            <!-- Totals -->
            <div *ngIf="cart.length > 0" class="mt-6 flex justify-end">
              <div class="w-80 space-y-2">
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-semibold">\${{ subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2" *ngIf="discountAmount > 0">
                  <span class="text-gray-600">Discount ({{ purchaseForm.value.discount }}%):</span>
                  <span class="text-green-600 font-semibold">-\${{ discountAmount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Tax ({{ purchaseForm.value.tax }}%):</span>
                  <span class="font-semibold">\${{ taxAmount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-3 border-t border-gray-200">
                  <span class="text-lg font-bold text-gray-900">Total:</span>
                  <span class="text-lg font-bold text-gray-900">\${{ total | number:'1.2-2' }}</span>
                </div>

                <div class="flex space-x-3 pt-4">
                  <button nz-button (click)="clearCart()" class="flex-1">
                    Clear Cart
                  </button>
                  <button 
                    nz-button 
                    nzType="primary" 
                    [nzLoading]="processing"
                    [disabled]="cart.length === 0 || !purchaseForm.valid"
                    (click)="createPurchase()"
                    class="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Create Purchase Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NewPurchaseComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  cart: PurchaseCartItem[] = []
  searchText = ""
  processing = false

  // Calculations
  subtotal = 0
  discountAmount = 0
  taxAmount = 0
  total = 0

  purchaseForm: FormGroup

  constructor(
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.purchaseForm = this.fb.group({
      supplierName: ["", [Validators.required]],
      supplierContact: [""],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      tax: [10, [Validators.min(0)]],
    })
  }

  ngOnInit(): void {
    this.loadProducts()
    this.calculateTotals()
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter((p) => p.isActive)
        this.filteredProducts = []
      },
      error: (error) => {
        this.message.error("Failed to load products")
      },
    })
  }

  onSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredProducts = []
      return
    }

    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchText.toLowerCase()),
    )
  }

  addToCart(product: Product): void {
    const existingIndex = this.cart.findIndex((item) => item.product.id === product.id)

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity++
      this.updateCartItem(existingIndex)
    } else {
      const cartItem: PurchaseCartItem = {
        product,
        quantity: 1,
        unitCost: product.cost,
        total: product.cost,
      }
      this.cart.push(cartItem)
      this.calculateTotals()
    }

    this.searchText = ""
    this.filteredProducts = []
  }

  updateCartItem(index: number): void {
    const item = this.cart[index]
    if (item.quantity <= 0) {
      this.removeFromCart(index)
      return
    }
    item.total = item.quantity * item.unitCost
    this.calculateTotals()
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1)
    this.calculateTotals()
  }

  clearCart(): void {
    this.cart = []
    this.calculateTotals()
  }

  calculateTotals(): void {
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0)
    this.discountAmount = (this.subtotal * this.purchaseForm.value.discount) / 100
    this.taxAmount = ((this.subtotal - this.discountAmount) * this.purchaseForm.value.tax) / 100
    this.total = this.subtotal - this.discountAmount + this.taxAmount
  }

  createPurchase(): void {
    if (this.cart.length === 0) {
      this.message.error("Cart is empty")
      return
    }

    if (!this.purchaseForm.valid) {
      this.message.error("Please fill in all required fields")
      return
    }

    this.processing = true

    const purchaseItems: CreatePurchaseItemRequest[] = this.cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitCost: item.unitCost,
    }))

    const purchaseData = {
      supplierName: this.purchaseForm.value.supplierName,
      supplierContact: this.purchaseForm.value.supplierContact || undefined,
      items: purchaseItems,
      discount: this.discountAmount,
      tax: this.taxAmount,
    }

    this.purchaseService.createPurchase(purchaseData).subscribe({
      next: (purchase) => {
        this.message.success(`Purchase order created! PO: ${purchase.purchaseOrderNumber}`)
        this.router.navigate(["/purchases"])
      },
      error: (error) => {
        this.message.error("Failed to create purchase order")
        this.processing = false
      },
    })
  }

  goBack(): void {
    this.router.navigate(["/purchases"])
  }
}
