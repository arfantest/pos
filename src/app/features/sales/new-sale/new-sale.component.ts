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
import { NzInputNumberModule } from "ng-zorro-antd/input-number"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzStatisticModule } from "ng-zorro-antd/statistic"
import { NzRadioModule } from "ng-zorro-antd/radio"
import { ProductService } from "../../../core/services/product.service"
import { SaleService } from "../../../core/services/sale.service"
import { AccountService } from "../../../core/services/account.service"
import { Product } from "../../../core/models/product.model"
import { Account } from "../../../core/models/account.model"

interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

@Component({
  selector: "app-new-sale",
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
    NzInputNumberModule,
    NzTagModule,
    NzStatisticModule,
    NzRadioModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b sticky top-0 z-10 px-4 py-3">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-2xl font-bold text-gray-900">New Sale</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto p-4 pb-32">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <!-- Left Column - Account, Customer, Product Search -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Account Selection -->
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <span nz-icon nzType="bank" class="mr-2 text-blue-600"></span>
                Account
              </h3>
              
              <nz-select 
                [(ngModel)]="selectedAccountId" 
                nzPlaceHolder="Choose account"
                (ngModelChange)="onAccountChange()"
                class="w-full"
                nzSize="small"
              >
                <nz-option 
                  *ngFor="let account of accounts" 
                  [nzValue]="account.id" 
                  [nzLabel]="account.name"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-sm">{{ account.name }}</span>
                    <nz-tag [nzColor]="getAccountStatusColor(account.balance)" nzSize="small">
                      {{ account.balance | number:'1.2-2' }}
                    </nz-tag>
                  </div>
                </nz-option>
              </nz-select>

              <!-- Compact Account Info -->
              <div *ngIf="selectedAccount" class="bg-gray-50 rounded p-3 mt-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600">Balance:</span>
                  <span class="font-semibold" [class]="selectedAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ selectedAccount.balance | number:'1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-sm mt-1">
                  <span class="text-gray-600">Status:</span>
                  <nz-tag [nzColor]="selectedAccount.isActive ? 'green' : 'red'" nzSize="small">
                    {{ selectedAccount.isActive ? 'Active' : 'Inactive' }}
                  </nz-tag>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <span nz-icon nzType="user" class="mr-2 text-purple-600"></span>
                Customer
              </h3>
              
              <form nz-form [formGroup]="saleForm" class="space-y-3">
                <nz-form-item class="mb-2">
                  <nz-form-control>
                    <input nz-input formControlName="customerName" placeholder="Customer Name (Optional)" nzSize="small" />
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item class="mb-2">
                  <nz-form-control>
                    <input nz-input formControlName="customerPhone" placeholder="Phone (Optional)" nzSize="small" />
                  </nz-form-control>
                </nz-form-item>

                <!-- Enhanced Discount Section -->
                <div class="space-y-3 border-t pt-3">
                  <h4 class="text-sm font-medium text-gray-700">Discount</h4>
                  
                  <!-- Discount Type Selection -->
                  <nz-form-item class="mb-2">
                    <nz-form-label class="text-xs text-gray-600">Discount Type</nz-form-label>
                    <nz-form-control>
                      <nz-radio-group [(ngModel)]="discountType" (ngModelChange)="onDiscountTypeChange()" nzSize="small">
                        <label nz-radio nzValue="percentage">Percentage (%)</label>
                        <label nz-radio nzValue="amount">Amount</label>
                      </nz-radio-group>
                    </nz-form-control>
                  </nz-form-item>

                  <!-- Discount Input -->
                  <nz-form-item class="mb-2">
                    <nz-form-label class="text-xs text-gray-600">
                      {{ discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount' }}
                    </nz-form-label>
                    <nz-form-control>
                      <nz-input-number 
                        [(ngModel)]="discountInput"
                        [nzMin]="0" 
                        [nzMax]="discountType === 'percentage' ? 100 : subtotal"
                        [nzStep]="discountType === 'percentage' ? 0.1 : 0.01"
                        [nzPrecision]="2"
                        (ngModelChange)="onDiscountInputChange()"
                        class="w-full"
                        nzSize="small"
                        nzPlaceHolder="0"
                      ></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>

                  <!-- Discount Display -->
                  <div *ngIf="discountAmount > 0" class="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div class="text-xs space-y-1">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Discount Percentage:</span>
                        <span class="font-medium text-yellow-700">{{ discountPercentage | number:'1.1-1' }}%</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Discount Amount:</span>
                        <span class="font-medium text-red-600">{{ discountAmount | number:'1.2-2' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Product Search -->
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <span nz-icon nzType="search" class="mr-2 text-green-600"></span>
                Search Products
              </h3>
              
              <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton" class="mb-3">
                <input 
                  type="text" 
                  nz-input 
                  placeholder="Search products..." 
                  [(ngModel)]="searchText" 
                  (input)="onSearch()"
                  (keyup.enter)="onBarcodeSearch()"
                  nzSize="small"
                />
              </nz-input-group>
              <ng-template #suffixIconButton>
                <button nz-button nzType="primary" nzSearch (click)="onBarcodeSearch()" nzSize="small">
                  <span nz-icon nzType="search"></span>
                </button>
              </ng-template>

              <!-- Improved Product List -->
              <div class="max-h-80 overflow-y-auto space-y-2" *ngIf="filteredProducts.length > 0">
                <div 
                  *ngFor="let product of filteredProducts.slice(0, 15)"
                  class="group border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-white"
                  (click)="addToCart(product)"
                >
                  <div class="flex justify-between items-center">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0 pr-2">
                          <h4 class="font-medium text-gray-900 text-sm truncate">{{ product.name }}</h4>
                          <div class="flex items-center space-x-2 mt-1">
                            <span class="text-xs text-gray-500">{{ product.sku }}</span>
                            <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              Stock: {{ product.stock }}
                            </span>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-bold text-blue-600">{{ product.price | number:'1.2-2' }}</p>
                          <button 
                            nz-button 
                            nzType="primary" 
                            nzSize="small" 
                            class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span nz-icon nzType="plus"></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="searchText && filteredProducts.length === 0" class="text-center py-6 text-gray-500">
                <span nz-icon nzType="inbox" class="text-xl block mb-2"></span>
                <span class="text-sm">No products found</span>
              </div>
            </div>
          </div>

          <!-- Right Column - Cart -->
          <div class="lg:col-span-3">
            <!-- Shopping Cart -->
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <span nz-icon nzType="shopping-cart" class="mr-2 text-orange-600"></span>
                  Cart ({{ cart.length }} items)
                </h3>
                <button 
                  nz-button 
                  nzType="text" 
                  nzSize="small" 
                  (click)="clearCart()" 
                  *ngIf="cart.length > 0"
                  nzDanger
                >
                  <span nz-icon nzType="delete"></span>
                  Clear
                </button>
              </div>

              <!-- Empty Cart State -->
              <div *ngIf="cart.length === 0" class="text-center py-16 text-gray-500">
                <span nz-icon nzType="shopping-cart" class="text-4xl block mb-4 text-gray-300"></span>
                <p class="text-lg font-medium">Cart is empty</p>
                <p class="text-sm">Search and add products to get started</p>
              </div>

              <!-- Enhanced Cart Items -->
              <div *ngIf="cart.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
                <div 
                  *ngFor="let item of cart; let i = index" 
                  class="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow"
                >
                  <div class="grid grid-cols-12 gap-3 items-center">
                    <!-- Product Info (6 columns) -->
                    <div class="col-span-6">
                      <h4 class="font-semibold text-gray-900 text-sm mb-1">{{ item.product.name }}</h4>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{{ item.product.sku }}</span>
                        <span class="text-xs font-medium text-blue-600">{{ item.unitPrice | number:'1.2-2' }} each</span>
                      </div>
                    </div>
                    
                    <!-- Quantity (2 columns) -->
                    <div class="col-span-2 text-center">
                      <div class="text-xs text-gray-500 mb-1 font-medium">Qty</div>
                      <nz-input-number 
                        [(ngModel)]="item.quantity" 
                        [nzMin]="1" 
                        [nzMax]="item.product.stock"
                        (ngModelChange)="updateCartItem(i)"
                        class="w-full"
                        nzSize="small"
                      ></nz-input-number>
                    </div>
                    
                    <!-- Total (3 columns) -->
                    <div class="col-span-3 text-center">
                      <div class="text-xs text-gray-500 mb-1 font-medium">Total</div>
                      <span class="text-base font-bold text-green-600 ml-2">{{ item.total | number:'1.2-2' }}</span>
                    </div>
                    
                    <!-- Remove Button (1 column) -->
                    <div class="col-span-1 text-center">
                      <button 
                        nz-button 
                        nzType="text" 
                        nzDanger 
                        (click)="removeFromCart(i)"
                        nzSize="small"
                        class="hover:bg-red-50"
                      >
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Fixed Bottom Section -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-20" *ngIf="cart.length > 0">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 items-center">
            <!-- Payment Input (4 columns) -->
            <div class="lg:col-span-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="text-sm font-semibold text-gray-700 block mb-2">
                  <span nz-icon nzType="wallet" class="mr-1"></span>
                  Amount Paid (Optional)
                </label>
                <nz-input-number 
                  [(ngModel)]="paid" 
                  [nzMin]="0" 
                  [nzStep]="0.01"
                  [nzPrecision]="2"
                  (ngModelChange)="calculateChange()"
                  class="w-full"
                  nzPlaceHolder="0.00"
                  nzSize="large"
                ></nz-input-number>
                <div class="text-sm mt-2 font-medium" [class]="change >= 0 ? 'text-green-600' : 'text-red-600'" *ngIf="paid && paid > 0">
                  <span nz-icon [nzType]="change >= 0 ? 'arrow-up' : 'arrow-down'" class="mr-1"></span>
                  Change: {{ change | number:'1.2-2' }}
                </div>
              </div>
            </div>

            <!-- Totals Summary (4 columns) -->
            <div class="lg:col-span-4">
              <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span class="font-medium ml-4">{{ subtotal | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-sm text-gray-600" *ngIf="discountAmount > 0">
                    <span>Discount ({{ discountPercentage | number:'1.1-1' }}%):</span>
                    <span class="text-red-600 font-medium ml-4">-{{ discountAmount | number:'1.2-2' }}</span>
                  </div>
                  <div class="border-t border-gray-300 pt-2">
                    <div class="flex justify-between text-xl font-bold">
                      <span class="text-gray-800">Total:</span>
                      <span class="text-green-600 ml-4">{{ total | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons (4 columns) -->
            <div class="lg:col-span-4 flex justify-end space-x-3">
              <button 
                nz-button 
                nzType="default" 
                (click)="clearCart()"
                nzSize="large"
                class="flex items-center"
              >
                <span nz-icon nzType="delete" class="mr-1"></span>
                Clear Cart
              </button>
              <button 
                nz-button 
                nzType="primary" 
                nzSize="large"
                [nzLoading]="processing"
                [disabled]="!canCompleteSale()"
                (click)="completeSale()"
                class="px-8 flex items-center bg-green-600 border-green-600 hover:bg-green-700"
              >
                <span nz-icon nzType="check-circle" class="mr-2"></span>
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
    }

    .ant-statistic-content {
      font-size: 16px;
    }

    .ant-input-number {
      width: 100%;
    }

    nz-form-item {
      margin-bottom: 8px;
    }

    .ant-card {
      border-radius: 8px;
    }

    .ant-btn {
      border-radius: 6px;
    }

    .ant-input {
      border-radius: 6px;
    }

    .ant-select {
      border-radius: 6px;
    }

    /* Enhanced fixed bottom section */
    .fixed.bottom-0 {
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    }

    /* Improved hover effects */
    .group:hover .opacity-0 {
      opacity: 1;
    }

    /* Better scrollbar styling */
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Grid alignment improvements */
    .grid.grid-cols-12 .col-span-2 .ant-input-number,
    .grid.grid-cols-12 .col-span-3,
    .grid.grid-cols-12 .col-span-1 {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Enhanced cart item styling */
    .bg-gradient-to-r.from-gray-50.to-white {
      border-left: 3px solid #e5e7eb;
    }

    .bg-gradient-to-r.from-gray-50.to-white:hover {
      border-left-color: #3b82f6;
    }

    /* Additional spacing for totals */
    .ml-4 {
      margin-left: 1rem;
    }
  `,
  ],
})
export class NewSaleComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  accounts: Account[] = []
  selectedAccount: Account | null = null
  selectedAccountId: string = ""
  cart: CartItem[] = []
  searchText = ""
  processing = false

  // Enhanced discount settings
  discountType: 'percentage' | 'amount' = 'percentage'
  discountInput: number = 0
  discountAmount: number = 0
  discountPercentage: number = 0

  // Calculations
  subtotal = 0
  taxAmount = 0
  total = 0
  change = 0
  paid: number = 0
  saleForm: FormGroup

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private accountService: AccountService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.saleForm = this.fb.group({
      customerName: [""],
      customerPhone: [""],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      tax: [0, [Validators.min(0)]], // Set to 0 by default and hidden
      paid: [0, [Validators.min(0)]],
    })
  }

  ngOnInit(): void {
    this.loadProducts()
    this.loadAccounts()
    this.calculateTotals()
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter((p) => p.isActive && p.stock > 0)
        this.filteredProducts = []
      },
      error: (error) => {
        console.error('Error loading products:', error)
        this.message.error("Failed to load products")
      },
    })
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(a => a.isActive)
      },
      error: (error) => {
        console.error('Error loading accounts:', error)
        this.message.error("Failed to load accounts")
      },
    })
  }

  onAccountChange(): void {
    this.selectedAccount = this.accounts.find(a => a.id === this.selectedAccountId) || null
  }

  getAccountStatusColor(balance: number): string {
    if (balance > 1000) return 'green'
    if (balance > 0) return 'orange'
    return 'red'
  }

  onDiscountTypeChange(): void {
    this.discountInput = 0
    this.discountAmount = 0
    this.discountPercentage = 0
    this.calculateTotals()
  }

  onDiscountInputChange(): void {
    if (!this.discountInput || this.discountInput <= 0) {
      this.discountAmount = 0
      this.discountPercentage = 0
      this.calculateTotals()
      return
    }

    if (this.discountType === 'percentage') {
      // User entered percentage, calculate amount
      this.discountPercentage = this.discountInput
      this.discountAmount = (this.subtotal * this.discountInput) / 100
    } else {
      // User entered amount, calculate percentage
      this.discountAmount = Math.min(this.discountInput, this.subtotal)
      this.discountPercentage = this.subtotal > 0 ? (this.discountAmount / this.subtotal) * 100 : 0
    }

    this.calculateTotals()
  }

  onSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredProducts = []
      return
    }

    const searchTerm = this.searchText.toLowerCase()
    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.barcode?.toLowerCase().includes(searchTerm),
    )
  }

  onBarcodeSearch(): void {
    if (!this.searchText.trim()) return

    // Try to find by exact barcode match first
    const barcodeProduct = this.products.find((p) => p.barcode === this.searchText)
    if (barcodeProduct) {
      this.addToCart(barcodeProduct)
      this.searchText = ""
      this.filteredProducts = []
      return
    }

    // If no exact barcode match, perform regular search
    this.onSearch()
  }

  addToCart(product: Product): void {
    const existingIndex = this.cart.findIndex((item) => item.product.id === product.id)

    if (existingIndex >= 0) {
      // Product already in cart, increase quantity
      const existingItem = this.cart[existingIndex]
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++
        this.updateCartItem(existingIndex)
        this.message.success(`Added another ${product.name} to cart`)
      } else {
        this.message.warning("Cannot add more items. Stock limit reached.")
      }
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
      }
      this.cart.push(cartItem)
      this.calculateTotals()
      this.message.success(`${product.name} added to cart`)
    }

    this.searchText = ""
    this.filteredProducts = []
  }

  updateCartItem(index: number): void {
    const item = this.cart[index]
    if (item.quantity > item.product.stock) {
      item.quantity = item.product.stock
      this.message.warning("Quantity adjusted to available stock")
    }
    if (item.quantity <= 0) {
      this.removeFromCart(index)
      return
    }
    item.total = item.quantity * item.unitPrice
    this.calculateTotals()
  }

  removeFromCart(index: number): void {
    const item = this.cart[index]
    this.cart.splice(index, 1)
    this.calculateTotals()
    this.message.info(`${item.product.name} removed from cart`)
  }

  clearCart(): void {
    this.cart = []
    this.discountInput = 0
    this.discountAmount = 0
    this.discountPercentage = 0
    this.calculateTotals()
    this.paid = 0
    this.message.info("Cart cleared")
  }

  calculateTotals(): void {
    // Calculate subtotal
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0)
    
    // Recalculate discount if we have discount input
    if (this.discountInput > 0) {
      this.onDiscountInputChange()
    } else {
      this.discountAmount = 0
      this.discountPercentage = 0
    }
    
    // Calculate final total (tax is 0)
    this.taxAmount = 0
    this.total = Math.max(0, this.subtotal - this.discountAmount + this.taxAmount)
    
    // Recalculate change
    this.calculateChange()
  }

  calculateChange(): void {
    this.change = (this.paid || 0) - this.total
  }

  canCompleteSale(): boolean {
    return (
      this.cart.length > 0 &&
      !!this.selectedAccountId &&
      !this.processing
    )
  }

  completeSale(): void {
    if (!this.canCompleteSale()) {
      this.message.error("Please select an account and add items to cart")
      return
    }

    this.processing = true

    const saleItems = this.cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))

    const saleData = {
      items: saleItems,
      discount: this.discountAmount,
      tax: this.taxAmount,
      paid: this.paid || 0,
      customerName: this.saleForm.value.customerName || undefined,
      customerPhone: this.saleForm.value.customerPhone || undefined,
      accountId: this.selectedAccountId,
    }

    console.log('Submitting sale data:', saleData)

    this.saleService.createSale(saleData).subscribe({
      next: (sale) => {
        this.message.success(`Sale completed successfully! Invoice: ${sale.invoiceNumber}`)
        this.router.navigate(["/sales"])
      },
      error: (error) => {
        console.error('Sale creation error:', error)
        this.message.error(error.error?.message || "Failed to complete sale")
        this.processing = false
      },
    })
  }
}