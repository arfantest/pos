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
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">New Sale</h1>
          <p class="text-gray-600">Create a new sale transaction</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Product Search & Account Info -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Account Selection -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span nz-icon nzType="bank" class="mr-2 text-blue-600"></span>
                Account Information
              </h3>
              
              <nz-form-item class="mb-4">
                <nz-form-label class="text-sm font-medium text-gray-700">Select Account</nz-form-label>
                <nz-form-control>
                  <nz-select 
                    [(ngModel)]="selectedAccountId" 
                    nzPlaceHolder="Choose account"
                    (ngModelChange)="onAccountChange()"
                    class="w-full"
                  >
                    <nz-option 
                      *ngFor="let account of accounts" 
                      [nzValue]="account.id" 
                      [nzLabel]="account.name"
                    >
                      <div class="flex justify-between items-center">
                        <span>{{ account.name }}</span>
                        <nz-tag [nzColor]="getAccountStatusColor(account.balance)">
                          {{ account.balance | number:'1.2-2' }}
                        </nz-tag>
                      </div>
                    </nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <!-- Account Status Display -->
              <div *ngIf="selectedAccount" class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4">
                  <nz-statistic 
                    nzTitle="Account Balance" 
                    [nzValue]="selectedAccount.balance" 
                    nzPrefix="$"
                    [nzValueStyle]="{ color: selectedAccount.balance >= 0 ? '#3f8600' : '#cf1322' }"
                  ></nz-statistic>
                  <nz-statistic 
                    nzTitle="Account Type" 
                    [nzValue]="selectedAccount.type | titlecase"
                  ></nz-statistic>
                </div>
                <div class="mt-3">
                  <span class="text-sm text-gray-600">Status: </span>
                  <nz-tag [nzColor]="selectedAccount.isActive ? 'green' : 'red'">
                    {{ selectedAccount.isActive ? 'Active' : 'Inactive' }}
                  </nz-tag>
                </div>
              </div>
            </div>

            <!-- Product Search -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span nz-icon nzType="search" class="mr-2 text-green-600"></span>
                Product Search
              </h3>
              
              <div class="space-y-4">
                <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
                  <input 
                    type="text" 
                    nz-input 
                    placeholder="Search by name, SKU, or barcode..." 
                    [(ngModel)]="searchText" 
                    (input)="onSearch()"
                    (keyup.enter)="onBarcodeSearch()"
                    class="rounded-md"
                  />
                </nz-input-group>
                <ng-template #suffixIconButton>
                  <button nz-button nzType="primary" nzSearch (click)="onBarcodeSearch()" class="rounded-md">
                    <span nz-icon nzType="search"></span>
                  </button>
                </ng-template>

                <!-- Product List -->
                <div class="max-h-96 overflow-y-auto space-y-2" *ngIf="filteredProducts.length > 0">
                  <div 
                    *ngFor="let product of filteredProducts.slice(0, 10)"
                    class="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
                    (click)="addToCart(product)"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900 text-sm">{{ product.name }}</h4>
                        <p class="text-xs text-gray-500 mt-1">{{ product.sku }} | Stock: {{ product.stock }}</p>
                        <p class="text-sm font-semibold text-blue-600 mt-1">{{ product.price | number:'1.2-2' }}</p>
                      </div>
                      <button nz-button nzType="primary" nzSize="small" class="rounded-md">
                        <span nz-icon nzType="plus"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="searchText && filteredProducts.length === 0" class="text-center py-8 text-gray-500">
                  <span nz-icon nzType="inbox" class="text-2xl block mb-2"></span>
                  No products found
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Cart & Sale Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Customer Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span nz-icon nzType="user" class="mr-2 text-purple-600"></span>
                Customer Information
              </h3>
              
              <form nz-form [formGroup]="saleForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <nz-form-item>
                  <nz-form-label class="text-sm font-medium text-gray-700">Customer Name</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="customerName" placeholder="Walk-in Customer" class="rounded-md" />
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label class="text-sm font-medium text-gray-700">Phone Number</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="customerPhone" placeholder="Phone Number" class="rounded-md" />
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label class="text-sm font-medium text-gray-700">Discount (%)</nz-form-label>
                  <nz-form-control>
                    <nz-input-number 
                      formControlName="discount" 
                      [nzMin]="0" 
                      [nzMax]="100" 
                      [nzStep]="0.1"
                      (ngModelChange)="calculateTotals()"
                      class="w-full rounded-md"
                    ></nz-input-number>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label class="text-sm font-medium text-gray-700">Tax (%)</nz-form-label>
                  <nz-form-control>
                    <nz-input-number 
                      formControlName="tax" 
                      [nzMin]="0" 
                      [nzStep]="0.1"
                      (ngModelChange)="calculateTotals()"
                      class="w-full rounded-md"
                    ></nz-input-number>
                  </nz-form-control>
                </nz-form-item>
              </form>
            </div>

            <!-- Shopping Cart -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span class="flex items-center">
                  <span nz-icon nzType="shopping-cart" class="mr-2 text-orange-600"></span>
                  Shopping Cart ({{ cart.length }} items)
                </span>
                <button 
                  nz-button 
                  nzType="default" 
                  nzSize="small" 
                  (click)="clearCart()" 
                  *ngIf="cart.length > 0"
                  class="rounded-md"
                >
                  <span nz-icon nzType="delete"></span>
                  Clear Cart
                </button>
              </h3>

              <!-- Empty Cart State -->
              <div *ngIf="cart.length === 0" class="text-center py-12 text-gray-500">
                <span nz-icon nzType="shopping-cart" class="text-4xl block mb-4 text-gray-300"></span>
                <p class="text-lg">Your cart is empty</p>
                <p class="text-sm">Search and add products to get started</p>
              </div>

              <!-- Cart Items -->
              <div *ngIf="cart.length > 0" class="space-y-4">
                <div 
                  *ngFor="let item of cart; let i = index" 
                  class="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ item.product.name }}</h4>
                      <p class="text-sm text-gray-500">{{ item.product.sku }}</p>
                      <p class="text-sm font-semibold text-blue-600">{{ item.unitPrice | number:'1.2-2' }} each</p>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                      <div class="flex flex-col items-end">
                        <label class="text-xs text-gray-500 mb-1">Quantity</label>
                        <nz-input-number 
                          [(ngModel)]="item.quantity" 
                          [nzMin]="1" 
                          [nzMax]="item.product.stock"
                          (ngModelChange)="updateCartItem(i)"
                          class="w-20"
                        ></nz-input-number>
                      </div>
                      
                      <div class="flex flex-col items-end">
                        <label class="text-xs text-gray-500 mb-1">Total</label>
                        <span class="text-lg font-bold text-green-600">{{ item.total | number:'1.2-2' }}</span>
                      </div>
                      
                      <button 
                        nz-button 
                        nzType="text" 
                        nzDanger 
                        (click)="removeFromCart(i)"
                        class="rounded-md"
                      >
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Totals Section -->
                <div class="border-t border-gray-200 pt-4 mt-6">
                  <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Subtotal:</span>
                      <span class="font-medium">{{ subtotal | number:'1.2-2' }}</span>
                    </div>
                    
                    <div class="flex justify-between text-sm" *ngIf="discountAmount > 0">
                      <span class="text-gray-600">Discount ({{ saleForm.value.discount }}%):</span>
                      <span class="font-medium text-red-600">-{{ discountAmount | number:'1.2-2' }}</span>
                    </div>
                    
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Tax ({{ saleForm.value.tax }}%):</span>
                      <span class="font-medium">{{ taxAmount | number:'1.2-2' }}</span>
                    </div>
                    
                    <div class="border-t border-gray-300 pt-3">
                      <div class="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span class="text-green-600">{{ total | number:'1.2-2' }}</span>
                      </div>
                    </div>

                    <!-- Payment Section -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300">
                      <nz-form-item class="mb-0">
                        <nz-form-label class="text-sm font-medium text-gray-700">Amount Paid</nz-form-label>
                        <nz-form-control>
                          <nz-input-number 
                            [(ngModel)]="paid" 
                            [nzMin]="0" 
                            [nzStep]="0.01"
                            (ngModelChange)="calculateChange()"
                            class="w-full rounded-md"
                            nzPlaceHolder="0.00"
                          ></nz-input-number>
                        </nz-form-control>
                      </nz-form-item>

                      <div class="flex flex-col justify-end">
                        <label class="text-sm font-medium text-gray-700 mb-1">Change:</label>
                        <div class="text-lg font-bold" [class]="change >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ change | number:'1.2-2' }}
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end space-x-3 pt-4">
                      <button 
                        nz-button 
                        nzType="default" 
                        (click)="clearCart()"
                        class="rounded-md"
                      >
                        Clear Cart
                      </button>
                      <button 
                        nz-button 
                        nzType="primary" 
                        nzSize="large"
                        [nzLoading]="processing"
                        [disabled]="!canCompleteSale()"
                        (click)="completeSale()"
                        class="rounded-md px-8"
                      >
                        <span nz-icon nzType="check-circle" class="mr-1"></span>
                        Complete Sale
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
      font-size: 18px;
    }

    .ant-input-number {
      width: 100%;
    }

    nz-form-item {
      margin-bottom: 16px;
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

  // Calculations
  subtotal = 0
  discountAmount = 0
  taxAmount = 0
  total = 0
  change = 0
  paid = 0;
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
      tax: [10, [Validators.min(0)]],
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
    this.calculateTotals()
    this.message.info("Cart cleared")
  }

  calculateTotals(): void {
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0)
    this.discountAmount = (this.subtotal * (this.saleForm.value.discount || 0)) / 100
    this.taxAmount = ((this.subtotal - this.discountAmount) * (this.saleForm.value.tax || 0)) / 100
    this.total = this.subtotal - this.discountAmount + this.taxAmount
    this.calculateChange()
  }

  calculateChange(): void {
    this.saleForm.value.paid = this.paid;
    const paid = this.saleForm.value.paid || 0
    this.change = paid - this.total
  }

  canCompleteSale(): boolean {
    return (
      this.cart.length > 0 &&
      this.saleForm.value.paid >= this.total &&
      !!this.selectedAccountId &&
      !this.processing
    );
  }

  completeSale(): void {
    if (!this.canCompleteSale()) {
      this.message.error("Please check all requirements before completing the sale")
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
      paid: this.saleForm.value.paid,
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
