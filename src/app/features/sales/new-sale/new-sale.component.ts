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
import { SaleService } from "../../../core/services/sale.service"
import { Product } from "../../../core/models/product.model"
import { CreateSaleItemRequest } from "../../../core/models/sale.model"

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
  ],
  template: `
    <div class="new-sale">
      <h1>New Sale</h1>
      
      <div nz-row [nzGutter]="16">
        <!-- Product Search -->
        <div nz-col nzXs="24" nzLg="12">
          <nz-card nzTitle="Product Search" class="search-card">
            <div class="search-section">
              <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
                <input 
                  type="text" 
                  nz-input 
                  placeholder="Search by name, SKU, or barcode..." 
                  [(ngModel)]="searchText" 
                  (input)="onSearch()"
                  (keyup.enter)="onBarcodeSearch()"
                />
              </nz-input-group>
              <ng-template #suffixIconButton>
                <button nz-button nzType="primary" nzSearch (click)="onBarcodeSearch()">
                  <span nz-icon nzType="search"></span>
                </button>
              </ng-template>
            </div>

            <div class="product-list" *ngIf="filteredProducts.length > 0">
              <div 
                class="product-item" 
                *ngFor="let product of filteredProducts.slice(0, 10)"
                (click)="addToCart(product)"
              >
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-details">{{ product.sku }} | Stock: {{ product.stock }}</div>
                  <div class="product-price">\${{ product.price | number:'1.2-2' }}</div>
                </div>
                <button nz-button nzType="primary" nzSize="small">
                  <span nz-icon nzType="plus"></span>
                </button>
              </div>
            </div>
          </nz-card>
        </div>

        <!-- Customer & Sale Info -->
        <div nz-col nzXs="24" nzLg="12">
          <nz-card nzTitle="Sale Information">
            <form nz-form [formGroup]="saleForm">
              <nz-form-item>
                <nz-form-label [nzSpan]="8">Customer Name</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input nz-input formControlName="customerName" placeholder="Walk-in Customer" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="8">Customer Phone</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input nz-input formControlName="customerPhone" placeholder="Phone Number" />
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
          </nz-card>
        </div>
      </div>

      <!-- Shopping Cart -->
      <nz-card nzTitle="Shopping Cart" class="cart-card">
        <div *ngIf="cart.length === 0" class="empty-cart">
          <span nz-icon nzType="shopping-cart" class="empty-icon"></span>
          <p>No items in cart. Search and add products above.</p>
        </div>

        <nz-table #cartTable [nzData]="cart" [nzShowPagination]="false" *ngIf="cart.length > 0">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of cartTable.data; let i = index">
              <td>{{ item.product.name }}</td>
              <td>{{ item.product.sku }}</td>
              <td>\${{ item.unitPrice | number:'1.2-2' }}</td>
              <td>
                <input 
                  nz-input 
                  type="number" 
                  [(ngModel)]="item.quantity" 
                  min="1" 
                  [max]="item.product.stock"
                  (input)="updateCartItem(i)"
                  style="width: 80px;"
                />
              </td>
              <td>\${{ item.total | number:'1.2-2' }}</td>
              <td>
                <button nz-button nzType="link" nzSize="small" (click)="removeFromCart(i)">
                  <span nz-icon nzType="delete" class="text-danger"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </nz-table>

        <nz-divider></nz-divider>

        <!-- Totals -->
        <div class="totals-section" *ngIf="cart.length > 0">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>\${{ subtotal | number:'1.2-2' }}</span>
          </div>
          <div class="total-row" *ngIf="discountAmount > 0">
            <span>Discount ({{ saleForm.value.discount }}%):</span>
            <span class="discount">-\${{ discountAmount | number:'1.2-2' }}</span>
          </div>
          <div class="total-row">
            <span>Tax ({{ saleForm.value.tax }}%):</span>
            <span>\${{ taxAmount | number:'1.2-2' }}</span>
          </div>
          <div class="total-row total-final">
            <span><strong>Total:</strong></span>
            <span><strong>\${{ total | number:'1.2-2' }}</strong></span>
          </div>

          <nz-form-item>
            <nz-form-label [nzSpan]="8" nzRequired>Amount Paid</nz-form-label>
            <nz-form-control [nzSpan]="16">
              <input 
                nz-input 
                type="number" 
                formControlName="paid" 
                step="0.01"
                min="0"
                (input)="calculateChange()"
              />
            </nz-form-control>
          </nz-form-item>

          <div class="total-row" *ngIf="change >= 0">
            <span>Change:</span>
            <span>\${{ change | number:'1.2-2' }}</span>
          </div>

          <div class="action-buttons">
            <button nz-button (click)="clearCart()">Clear Cart</button>
            <button 
              nz-button 
              nzType="primary" 
              [nzLoading]="processing"
              [disabled]="cart.length === 0 || saleForm.value.paid < total"
              (click)="completeSale()"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
    .new-sale {
      padding: 0;
    }

    h1 {
      margin-bottom: 24px;
      color: #262626;
    }

    .search-card {
      height: 500px;
    }

    .search-section {
      margin-bottom: 16px;
    }

    .product-list {
      max-height: 350px;
      overflow-y: auto;
    }

    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .product-item:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    }

    .product-info {
      flex: 1;
    }

    .product-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .product-details {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .product-price {
      font-weight: 600;
      color: #1890ff;
    }

    .cart-card {
      margin-top: 24px;
    }

    .empty-cart {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }

    .totals-section {
      max-width: 400px;
      margin-left: auto;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 4px 0;
    }

    .total-final {
      border-top: 2px solid #f0f0f0;
      padding-top: 12px;
      margin-top: 12px;
      font-size: 16px;
    }

    .discount {
      color: #52c41a;
    }

    .action-buttons {
      margin-top: 24px;
      text-align: right;
    }

    .action-buttons button {
      margin-left: 8px;
    }

    .text-danger {
      color: #ff4d4f;
    }
  `,
  ],
})
export class NewSaleComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  cart: CartItem[] = []
  searchText = ""
  processing = false

  // Calculations
  subtotal = 0
  discountAmount = 0
  taxAmount = 0
  total = 0
  change = 0

  saleForm: FormGroup

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
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
    this.calculateTotals()
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter((p) => p.isActive && p.stock > 0)
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
        product.sku.toLowerCase().includes(this.searchText.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(this.searchText.toLowerCase()),
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
    this.cart.splice(index, 1)
    this.calculateTotals()
  }

  clearCart(): void {
    this.cart = []
    this.calculateTotals()
  }

  calculateTotals(): void {
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0)
    this.discountAmount = (this.subtotal * this.saleForm.value.discount) / 100
    this.taxAmount = ((this.subtotal - this.discountAmount) * this.saleForm.value.tax) / 100
    this.total = this.subtotal - this.discountAmount + this.taxAmount
    this.calculateChange()
  }

  calculateChange(): void {
    const paid = this.saleForm.value.paid || 0
    this.change = paid - this.total
  }

  completeSale(): void {
    if (this.cart.length === 0) {
      this.message.error("Cart is empty")
      return
    }

    if (this.saleForm.value.paid < this.total) {
      this.message.error("Insufficient payment amount")
      return
    }

    this.processing = true

    const saleItems: CreateSaleItemRequest[] = this.cart.map((item) => ({
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
    }

    this.saleService.createSale(saleData).subscribe({
      next: (sale) => {
        this.message.success(`Sale completed! Invoice: ${sale.invoiceNumber}`)
        this.router.navigate(["/sales"])
      },
      error: (error) => {
        this.message.error("Failed to complete sale")
        this.processing = false
      },
    })
  }
}
