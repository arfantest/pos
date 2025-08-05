import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzModalModule } from "ng-zorro-antd/modal"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzMessageService } from "ng-zorro-antd/message"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzPopconfirmModule } from "ng-zorro-antd/popconfirm"
import { ProductService } from "../../../core/services/product.service"
import { Category } from "../../../core/models/product.model"

@Component({
  selector: "app-categories",
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
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  template: `
    <div class="categories">
      <div class="header">
        <h1>Categories</h1>
        <button nz-button nzType="primary" (click)="showAddModal()">
          <span nz-icon nzType="plus"></span>
          Add Category
        </button>
      </div>

      <nz-table #basicTable [nzData]="categories" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let category of basicTable.data">
            <td>{{ category.name }}</td>
            <td>{{ category.description || '-' }}</td>
            <td>
              <nz-tag [nzColor]="category.isActive ? 'green' : 'red'">
                {{ category.isActive ? 'Active' : 'Inactive' }}
              </nz-tag>
            </td>
            <td>{{ category.createdAt | date:'short' }}</td>
            <td>
              <button nz-button nzType="link" nzSize="small" (click)="editCategory(category)">
                <span nz-icon nzType="edit"></span>
              </button>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small" 
                nz-popconfirm 
                nzPopconfirmTitle="Are you sure delete this category?"
                (nzOnConfirm)="deleteCategory(category.id)"
              >
                <span nz-icon nzType="delete" class="text-danger"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Add/Edit Category Modal -->
      <nz-modal
        [(nzVisible)]="isModalVisible"
        [nzTitle]="modalTitle"
        (nzOnCancel)="handleCancel()"
        (nzOnOk)="handleOk()"
        [nzOkLoading]="modalLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="categoryForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input category name!">
                <input nz-input formControlName="name" placeholder="Category Name" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6">Description</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <textarea nz-input formControlName="description" placeholder="Category Description" rows="3"></textarea>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [
    `
    .categories {
      padding: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
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
export class CategoriesComponent implements OnInit {
  categories: Category[] = []
  loading = false

  // Modal properties
  isModalVisible = false
  modalTitle = "Add Category"
  modalLoading = false
  categoryForm: FormGroup
  editingCategory: Category | null = null

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {
    this.categoryForm = this.fb.group({
      name: ["", [Validators.required]],
      description: [""],
    })
  }

  ngOnInit(): void {
    this.loadCategories()
  }

  loadCategories(): void {
    this.loading = true
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load categories")
        this.loading = false
      },
    })
  }

  showAddModal(): void {
    this.modalTitle = "Add Category"
    this.editingCategory = null
    this.categoryForm.reset()
    this.isModalVisible = true
  }

  editCategory(category: Category): void {
    this.modalTitle = "Edit Category"
    this.editingCategory = category
    this.categoryForm.patchValue(category)
    this.isModalVisible = true
  }

  handleOk(): void {
    if (this.categoryForm.valid) {
      this.modalLoading = true
      const formData = this.categoryForm.value

      const request = this.editingCategory
        ? this.productService.updateCategory(this.editingCategory.id, formData)
        : this.productService.createCategory(formData)

      request.subscribe({
        next: () => {
          this.message.success(`Category ${this.editingCategory ? "updated" : "created"} successfully`)
          this.isModalVisible = false
          this.modalLoading = false
          this.loadCategories()
        },
        error: (error) => {
          this.message.error(`Failed to ${this.editingCategory ? "update" : "create"} category`)
          this.modalLoading = false
        },
      })
    }
  }

  handleCancel(): void {
    this.isModalVisible = false
  }

  deleteCategory(id: string): void {
    this.productService.deleteCategory(id).subscribe({
      next: () => {
        this.message.success("Category deleted successfully")
        this.loadCategories()
      },
      error: (error) => {
        this.message.error("Failed to delete category")
      },
    })
  }
}
