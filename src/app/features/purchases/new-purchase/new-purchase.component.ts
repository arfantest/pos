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
import { PurchaseService } from "../../../core/services/purchase.service"
import { AccountService } from "../../../core/services/account.service"
import { Product } from "../../../core/models/product.model"
import { Account } from "../../../core/models/account.model"
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
    NzInputNumberModule,
    NzTagModule,
    NzStatisticModule,
  ],
  templateUrl: "./new-purchase.component.html",
  styleUrls: ["./new-purchase.component.scss"],
})
export class NewPurchaseComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  selectedAccountId: string = "";
  cart: PurchaseCartItem[] = [];
  searchText = "";
  processing = false;

  // Separate discount inputs
  discountAmountInput: number = 0;
  discountPercentageInput: number = 0;
  
  // Calculated values
  discountAmount: number = 0;
  discountPercentage: number = 0;
  
  // Flag to prevent circular updates
  private isUpdatingDiscount = false;

  // Calculations
  taxRate: number = 10; // Default tax rate 
  subtotal = 0;
  taxAmount = 0;
  total = 0;
  remainingTotal = 0;
  change = 0;
  paid: number = 0;
  purchaseForm: FormGroup;

  constructor(
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private accountService: AccountService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.purchaseForm = this.fb.group({
      supplierName: ["", [Validators.required]],
      supplierContact: [""],
      supplierAddress: [""],
      tax: [10, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadAccounts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter((p) => p.isActive);
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

  // Discount handling methods
  onDiscountAmountChange(): void {
    if (this.isUpdatingDiscount) return;
    
    this.isUpdatingDiscount = true;
    
    // Ensure the amount doesn't exceed subtotal
    this.discountAmountInput = Math.min(this.subtotal, Math.max(0, this.discountAmountInput || 0));
    
    // Set the actual discount amount
    this.discountAmount = this.discountAmountInput;
    
    // Calculate and update percentage
    this.discountPercentage = this.subtotal > 0 ? (this.discountAmount / this.subtotal) * 100 : 0;
    this.discountPercentageInput = Math.round(this.discountPercentage * 10) / 10; // Round to 1 decimal
    
    this.calculateTotals();
    this.isUpdatingDiscount = false;
  }

  onDiscountPercentageChange(): void {
    if (this.isUpdatingDiscount) return;
    
    this.isUpdatingDiscount = true;
    
    // Ensure percentage is between 0 and 100
    this.discountPercentageInput = Math.min(100, Math.max(0, this.discountPercentageInput || 0));
    
    // Set the actual discount percentage
    this.discountPercentage = this.discountPercentageInput;
    
    // Calculate and update amount
    this.discountAmount = (this.subtotal * this.discountPercentage) / 100;
    this.discountAmountInput = Math.round(this.discountAmount * 100) / 100; // Round to 2 decimals
    
    this.calculateTotals();
    this.isUpdatingDiscount = false;
  }

  setQuickDiscount(percentage: number): void {
    this.discountPercentageInput = percentage;
    this.onDiscountPercentageChange();
  }

  clearDiscount(): void {
    this.isUpdatingDiscount = true;
    this.discountAmountInput = 0;
    this.discountPercentageInput = 0;
    this.discountAmount = 0;
    this.discountPercentage = 0;
    this.calculateTotals();
    this.isUpdatingDiscount = false;
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
      existingItem.quantity++;
      existingItem.total = existingItem.quantity * existingItem.unitCost;
      this.message.success(`Added another ${product.name} to cart`);
    } else {
      const cartItem: PurchaseCartItem = {
        product,
        quantity: 1,
        unitCost: product.cost,
        total: product.cost,
      };
      this.cart.push(cartItem);
      this.message.success(`${product.name} added to cart`);
    }

    this.calculateTotals();
  }

  updateCartItem(index: number): void {
    const item = this.cart[index];
    if (item.quantity <= 0) {
      this.removeFromCart(index);
      return;
    }
    item.total = item.quantity * item.unitCost;
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
    this.clearDiscount();
    this.paid = 0;
    this.change = 0;
    this.message.info("Cart cleared");
    this.calculateTotals();
  }

  calculateTotals(): void {
    // Calculate subtotal
    this.subtotal = this.cart.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    // If discount amount exceeds subtotal, adjust it
    if (this.discountAmount > this.subtotal) {
      this.discountAmount = this.subtotal;
      this.discountAmountInput = this.discountAmount;
      this.discountPercentage = 100;
      this.discountPercentageInput = 100;
    }

    // Calculate amount after discount
    const amountAfterDiscount = Math.max(0, this.subtotal - this.discountAmount);

    // Get tax rate from form or use default
    this.taxRate = this.purchaseForm.value.tax || 0;

    // Calculate tax on discounted amount
    this.taxAmount = amountAfterDiscount * (this.taxRate / 100);

    // Calculate final total
    this.total = amountAfterDiscount + this.taxAmount;

    // Calculate remaining balance and change
    this.remainingTotal = Math.max(0, this.total - (this.paid || 0));
    this.change = Math.max(0, (this.paid || 0) - this.total);
  }

  roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  canCreatePurchase(): boolean {
    return this.cart.length > 0 && !!this.selectedAccountId && this.purchaseForm.valid && !this.processing;
  }

  createPurchase(): void {
    if (!this.canCreatePurchase()) {
      this.message.error("Please select an account, fill supplier information, and add items to cart");
      return;
    }

    this.processing = true;

    const purchaseItems: CreatePurchaseItemRequest[] = this.cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitCost: item.unitCost,
    }));

    const purchaseData = {
      supplierName: this.purchaseForm.value.supplierName,
      supplierContact: this.purchaseForm.value.supplierContact || undefined,
      supplierAddress: this.purchaseForm.value.supplierAddress || undefined,
      items: purchaseItems,
      discount: this.discountAmount,
      tax: this.taxAmount,
      paid: this.paid || 0,
      accountId: this.selectedAccountId,
    };

    this.purchaseService.createPurchase(purchaseData).subscribe({
      next: (purchase) => {
        this.message.success(`Purchase order created successfully! PO: ${purchase.purchaseOrderNumber}`);
        this.router.navigate(["/purchases"]);
      },
      error: (error) => {
        console.error('Purchase creation error:', error);
        this.message.error(error.error?.message || "Failed to create purchase order");
        this.processing = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/purchases"]);
  }
}