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
  templateUrl: "./new-sale.component.html",
  styleUrls: ["./new-sale.component.scss"],
})
export class NewSaleComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  selectedAccountId: string = "";
  cart: CartItem[] = [];
  searchText = "";
  processing = false;

  // Discount settings
  discountType: 'percentage' | 'amount' = 'percentage';
  discountInput: number = 0;
  discountAmount: number = 0;
  discountPercentage: number = 0;

  // Calculations
  taxRate: number = 0; // Example tax rate 
  subtotal = 0;
  taxAmount = 0;
  total = 0;
  remainingTotal = 0;
  change = 0;
  paid: number = 0;
  saleForm: FormGroup;

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
      tax: [0, [Validators.min(0)]],
      paid: [0, [Validators.min(0)]],
    });
  }

  //  discount work 
  private discountChangeTimeout: any;

  handleRealTimeDiscountChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;

    if (this.discountChangeTimeout) {
      clearTimeout(this.discountChangeTimeout);
    }

    this.discountInput = rawValue === '' ? 0 : Number(rawValue);

    this.discountChangeTimeout = setTimeout(() => {
      this.calculateDiscount();
      this.discountChangeTimeout = null;
    }, 30); // 300ms delay
  }
  finalizeDiscountCalculation(): void {
    if (this.discountChangeTimeout) {
      clearTimeout(this.discountChangeTimeout);
      this.calculateDiscount();
    }
  }
  handleArrowChange(): void {
    if (this.discountChangeTimeout) {
      clearTimeout(this.discountChangeTimeout);
    }
    this.calculateDiscount();
  }
  calculateDiscount(): void {
    if (isNaN(this.discountInput)) {
      this.discountInput = 0;
    }

    if (this.discountType === 'percentage') {
      this.discountInput = Math.min(100, Math.max(0, this.discountInput));
      this.discountPercentage = this.discountInput;
      this.discountAmount = (this.subtotal * this.discountPercentage) / 100;
    } else {
      this.discountInput = Math.min(this.subtotal, Math.max(0, this.discountInput));
      this.discountAmount = this.discountInput;
      this.discountPercentage = this.subtotal > 0 ? (this.discountAmount / this.subtotal) * 100 : 0;
    }

    // Update totals
    this.calculateTotals();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadAccounts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter((p) => p.isActive && p.stock > 0);
        this.filteredProducts = [];
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.message.error("Failed to load products");
      },
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(a => a.isActive);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.message.error("Failed to load accounts");
      },
    });
  }

  onAccountChange(): void {
    this.selectedAccount = this.accounts.find(a => a.id === this.selectedAccountId) || null;
  }

  getAccountStatusColor(balance: number): string {
    if (balance > 1000) return 'green';
    if (balance > 0) return 'orange';
    return 'red';
  }

  onDiscountTypeChange(): void {
    // Reset discount values when type changes
    this.discountInput = 0;
    this.discountAmount = 0;
    this.discountPercentage = 0;
    this.calculateTotals();
  }

  onSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredProducts = [];
      return;
    }

    const searchTerm = this.searchText.toLowerCase();
    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.barcode?.toLowerCase().includes(searchTerm),
    );
  }

  onBarcodeSearch(): void {
    if (!this.searchText.trim()) return;

    const barcodeProduct = this.products.find((p) => p.barcode === this.searchText);
    if (barcodeProduct) {
      this.addToCart(barcodeProduct);
      this.searchText = "";
      this.filteredProducts = [];
      return;
    }

    this.onSearch();
  }

  addToCart(product: Product): void {
    const existingIndex = this.cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex >= 0) {
      const existingItem = this.cart[existingIndex];
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.unitPrice;
        this.message.success(`Added another ${product.name} to cart`);
      } else {
        this.message.warning("Cannot add more items. Stock limit reached.");
      }
    } else {
      const cartItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
      };
      this.cart.push(cartItem);
      this.message.success(`${product.name} added to cart`);
    }

    this.calculateTotals();
  }

  updateCartItem(index: number): void {
    const item = this.cart[index];
    if (item.quantity > item.product.stock) {
      item.quantity = item.product.stock;
      this.message.warning("Quantity adjusted to available stock");
    }
    item.total = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  removeFromCart(index: number): void {
    const item = this.cart[index];
    this.cart.splice(index, 1);
    this.message.info(`${item.product.name} removed from cart`);
    this.calculateTotals();
  }


  clearCart(): void {
    this.cart = [];
    this.discountInput = 0;
    this.discountAmount = 0;
    this.discountPercentage = 0;
    this.paid = 0;
    this.change = 0;
    this.message.info("Cart cleared");
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subtotal = this.cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    if (this.discountType === 'amount') {
      this.discountAmount = Math.min(this.subtotal, this.discountInput);
      this.discountPercentage = this.subtotal > 0 ? (this.discountAmount / this.subtotal) * 100 : 0;
    }

    const amountAfterDiscount = Math.max(0, this.subtotal - this.discountAmount);

    this.taxAmount = amountAfterDiscount * (this.taxRate / 100);

    this.total = amountAfterDiscount + this.taxAmount;

    this.remainingTotal = Math.max(0, this.total - (this.paid || 0));
    this.change = Math.max(0, (this.paid || 0) - this.total);
  }

  roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  canCompleteSale(): boolean {
    return this.cart.length > 0 && !!this.selectedAccountId && !this.processing;
  }

  completeSale(): void {
    if (!this.canCompleteSale()) {
      this.message.error("Please select an account and add items to cart");
      return;
    }

    this.processing = true;

    const saleItems = this.cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const saleData = {
      items: saleItems,
      discount: this.discountAmount,
      tax: this.taxAmount,
      paid: this.paid || 0,
      customerName: this.saleForm.value.customerName || undefined,
      customerPhone: this.saleForm.value.customerPhone || undefined,
      accountId: this.selectedAccountId,
    };

    this.saleService.createSale(saleData).subscribe({
      next: (sale) => {
        this.message.success(`Sale completed successfully! Invoice: ${sale.invoiceNumber}`);
        this.router.navigate(["/sales"]);
      },
      error: (error) => {
        console.error('Sale creation error:', error);
        this.message.error(error.error?.message || "Failed to complete sale");
        this.processing = false;
      },
    });
  }
}