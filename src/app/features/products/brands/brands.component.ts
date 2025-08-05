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
import { Brand } from "../../../core/models/product.model"

@Component({
  selector: "app-brands",
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
    <div class="brands">
      <div class="header">
        <h1>Brands</h1>
        <button nz-button nzType="primary" (click)="showAddModal()">
          <span nz-icon nzType="plus"></span>
          Add Brand
        </button>
      </div>

      <nz-table #basicTable [nzData]="brands" [nzLoading]="loading">
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
          <tr *ngFor="let brand of basicTable.data">
            <td>{{ brand.name }}</td>
            <td>{{ brand.description || '-' }}</td>
            <td>
              <nz-tag [nzColor]="brand.isActive ? 'green' : 'red'">
                {{ brand.isActive ? 'Active' : 'Inactive' }}
              </nz-tag>
            </td>
            <td>{{ brand.createdAt | date:'short' }}</td>
            <td>
              <button nz-button nzType="link" nzSize="small" (click)="editBrand(brand)">
                <span nz-icon nzType="edit"></span>
              </button>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small" 
                nz-popconfirm 
                nzPopconfirmTitle="Are you sure delete this brand?"
                (nzOnConfirm)="deleteBrand(brand.id)"
              >
                <span nz-icon nzType="delete" class="text-danger"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Add/Edit Brand Modal -->
      <nz-modal
        [(nzVisible)]="isModalVisible"
        [nzTitle]="modalTitle"
        (nzOnCancel)="handleCancel()"
        (nzOnOk)="handleOk()"
        [nzOkLoading]="modalLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="brandForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6" nzRequired>Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Please input brand name!">
                <input nz-input formControlName="name" placeholder="Brand Name" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="6">Description</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <textarea nz-input formControlName="description" placeholder="Brand Description" rows="3"></textarea>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [
    `
    .brands {
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
export class BrandsComponent implements OnInit {
  brands: Brand[] = []
  loading = false

  // Modal properties
  isModalVisible = false
  modalTitle = "Add Brand"
  modalLoading = false
  brandForm: FormGroup
  editingBrand: Brand | null = null

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {
    this.brandForm = this.fb.group({
      name: ["", [Validators.required]],
      description: [""],
    })
  }

  ngOnInit(): void {
    this.loadBrands()
  }

  loadBrands(): void {
    this.loading = true
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands
        this.loading = false
      },
      error: (error) => {
        this.message.error("Failed to load brands")
        this.loading = false
      },
    })
  }

  showAddModal(): void {
    this.modalTitle = "Add Brand"
    this.editingBrand = null
    this.brandForm.reset()
    this.isModalVisible = true
  }

  editBrand(brand: Brand): void {
    this.modalTitle = "Edit Brand"
    this.editingBrand = brand
    this.brandForm.patchValue(brand)
    this.isModalVisible = true
  }

  handleOk(): void {
    if (this.brandForm.valid) {
      this.modalLoading = true
      const formData = this.brandForm.value

      const request = this.editingBrand
        ? this.productService.updateBrand(this.editingBrand.id, formData)
        : this.productService.createBrand(formData)

      request.subscribe({
        next: () => {
          this.message.success(`Brand ${this.editingBrand ? "updated" : "created"} successfully`)
          this.isModalVisible = false
          this.modalLoading = false
          this.loadBrands()
        },
        error: (error) => {
          this.message.error(`Failed to ${this.editingBrand ? "update" : "create"} brand`)
          this.modalLoading = false
        },
      })
    }
  }

  handleCancel(): void {
    this.isModalVisible = false
  }

  deleteBrand(id: string): void {
    this.productService.deleteBrand(id).subscribe({
      next: () => {
        this.message.success("Brand deleted successfully")
        this.loadBrands()
      },
      error: (error) => {
        this.message.error("Failed to delete brand")
      },
    })
  }
}
