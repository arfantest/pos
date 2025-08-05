import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzModalModule } from "ng-zorro-antd/modal"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzMessageService } from "ng-zorro-antd/message"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzPopconfirmModule } from "ng-zorro-antd/popconfirm"
import { ProductService } from "../../../core/services/product.service"
import { Product, Category, Brand } from "../../../core/models/product.model"

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  template: `
    <div class="product-list">
      <div class="header">
        <h1>Products</h1>
        <button nz-button nzType="primary" (click)="showAddModal()">
          <span nz-icon nzType="plus"></span>
          Add Product
        </button>
      </div>

      <div class="search-bar">
        <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
          <input type="text" nz-input placeholder="Search products..." [(ngModel)]="searchText" (input)="onSearch()" />
        </nz-input-group>
        <ng-template #suffixIconButton>
          <button nz-button nzType="primary" nzSearch>
            <span nz-icon nzType="search"></span>
          </button>
        </ng-template>
      </div>

      <nz-table #basicTable [nzData]="filteredProducts" [nzLoading]="loading">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of basicTable.data">
            <td>{{ product.sku }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.category.name }}</td>
            <td>{{ product.brand.name }}</td>
            <td>\${{ product.price | number:'1.2-2' }}</td>
            <td>
              <span [class]="product.stock <= product.minStock ? 'low-stock' : ''">
                {{ product.stock }}
              </span>
              <nz-tag nzColor="red" *ngIf="product.stock === 0">Out of Stock</nz-tag>
              <nz-tag nzColor="orange" *ngIf="product.stock > 0 && product.stock <= product.minStock">Low Stock</nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="product.isActive ? 'green' : 'red'">
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </nz-tag>
            </td>
            <td>
              <button nz-button nzType="link" nzSize="small" (click)="editProduct(product)">
                <span nz-icon nzType="edit"></span>
              </button>
              <button nz-button nzType="link" nzSize="small" (click)="showStockModal(product)">
                <span nz-icon nzType="plus-circle"></span>
              </button>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small" 
                nz-popconfirm 
                nzPopconfirmTitle="Are you sure delete this product?"
                (nzOnConfirm)="deleteProduct(product.id)"
              >
                <span nz-icon nzType="delete" class="text-danger"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Add/Edit Product Modal -->
      <nz-modal
        [(nzVisible)]="isModalVisible"
        [nzTitle]="modalTitle"
        (nzOnCancel)="handleCancel()"
        (nzOnOk)="handleOk()"
        [nzOkLoading]="modalLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="productForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>SKU</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input SKU!">
                <input nz-input formControlName="sku" placeholder="Product SKU" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input product name!">
                <input nz-input formControlName="name" placeholder="Product Name" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6">Description</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <textarea nz-input formControlName="description" placeholder="Product Description" rows="3"></textarea>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6">Barcode</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <input nz-input formControlName="barcode" placeholder="Barcode" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Category</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please select category!">
                <nz-select formControlName="categoryId" nzPlaceHolder="Select Category">
                  <nz-option *ngFor="let category of categories" [nzValue]="category.id" [nzLabel]="category.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Brand</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please select brand!">
                <nz-select formControlName="brandId" nzPlaceHolder="Select Brand">
                  <nz-option *ngFor="let brand of brands" [nzValue]="brand.id" [nzLabel]="brand.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Price</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input price!">
                <input nz-input type="number" formControlName="price" placeholder="0.00" step="0.01" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Cost</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input cost!">
                <input nz-input type="number" formControlName="cost" placeholder="0.00" step="0.01" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Stock</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input stock!">
                <input nz-input type="number" formControlName="stock" placeholder="0" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Min Stock</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input minimum stock!">
                <input nz-input type="number" formControlName="minStock" placeholder="0" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Stock Adjustment Modal -->
      <nz-modal
        [(nzVisible)]="isStockModalVisible"
        nzTitle="Adjust Stock"
        (nzOnCancel)="handleStockCancel()"
        (nzOnOk)="handleStockOk()"
        [nzOkLoading]="stockModalLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="stockForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Product</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <input nz-input [value]="selectedProduct?.name" readonly />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6">Current Stock</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <input nz-input [value]="selectedProduct?.stock" readonly />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Adjustment</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input adjustment quantity!">
                <input nz-input type="number" formControlName="quantity" placeholder="Enter positive or negative number" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [
    `
    .product-list {
      padding: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .search-bar {
      margin-bottom: 16px;
      max-width: 400px;
    }

    .low-stock {
      color: #ff4d4f;
      font-weight: 500;
    }

    .text-danger {
      color: #ff4d4f;
    }

    h1 {
      margin: 0;
      color: #262626;
    }
  `,
  ],
})
export class ProductListComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  categories: Category[] = []
  brands: Brand[] = []
  loading = false
  searchText = ""

  // Modal properties
  isModalVisible = false
  modalTitle = "Add Product"
  modalLoading = false
  productForm: FormGroup
  editingProduct: Product | null = null

  // Stock modal properties
  isStockModalVisible = false
  stockModalLoading = false
  stockForm: FormGroup
  selectedProduct: Product | null = null

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {
    this.productForm = this.fb.group({
      sku: ["", [Validators.required]],
      name: ["", [Validators.required]],
      description: [""],
      barcode: [""],
      categoryId: ["", [Validators.required]],
      brandId: ["", [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
    })

    this.stockForm = this.fb.group({
      quantity: [0, [Validators.required]],
    })
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData(): void {
    this.loading = true
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products
        this.filteredProducts = products
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load products")
        this.loading = false
      },
    })

    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories
      },
    })

    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands
      },
    })
  }

  onSearch(): void {
    if (!this.searchText) {
      this.filteredProducts = this.products
    } else {
      this.filteredProducts = this.products.filter(
        (product) =>
          product.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(this.searchText.toLowerCase()) ||
          product.category?.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          product.brand?.name.toLowerCase().includes(this.searchText.toLowerCase()),
      )
    }
  }

  showAddModal(): void {
    this.modalTitle = "Add Product"
    this.editingProduct = null
    this.productForm.reset()
    this.isModalVisible = true
  }

  editProduct(product: Product): void {
    this.modalTitle = "Edit Product"
    this.editingProduct = product
    this.productForm.patchValue(product)
    this.isModalVisible = true
  }

  handleOk(): void {
    if (this.productForm.valid) {
      this.modalLoading = true
      const formData = this.productForm.value

      const request = this.editingProduct
        ? this.productService.updateProduct(this.editingProduct.id, formData)
        : this.productService.createProduct(formData)

      request.subscribe({
        next: () => {
          this.message.success(`Product ${this.editingProduct ? "updated" : "created"} successfully`)
          this.isModalVisible = false
          this.modalLoading = false
          this.loadData()
        },
        error: (error) => {
          this.message.error(`Failed to ${this.editingProduct ? "update" : "create"} product`)
          this.modalLoading = false
        },
      })
    }
  }

  handleCancel(): void {
    this.isModalVisible = false
  }

  showStockModal(product: Product): void {
    this.selectedProduct = product
    this.stockForm.reset()
    this.isStockModalVisible = true
  }

  handleStockOk(): void {
    if (this.stockForm.valid && this.selectedProduct) {
      this.stockModalLoading = true
      const quantity = this.stockForm.value.quantity

      this.productService.updateStock(this.selectedProduct.id, quantity).subscribe({
        next: () => {
          this.message.success("Stock updated successfully")
          this.isStockModalVisible = false
          this.stockModalLoading = false
          this.loadData()
        },
        error: (error) => {
          this.message.error("Failed to update stock")
          this.stockModalLoading = false
        },
      })
    }
  }

  handleStockCancel(): void {
    this.isStockModalVisible = false
  }

  deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.message.success("Product deleted successfully")
        this.loadData()
      },
      error: (error) => {
        this.message.error("Failed to delete product")
      },
    })
  }
}
