import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzSwitchModule } from "ng-zorro-antd/switch"
import { NzTabsModule } from "ng-zorro-antd/tabs"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzModalModule } from "ng-zorro-antd/modal"
import { NzPopconfirmModule } from "ng-zorro-antd/popconfirm"
import { NzMessageService } from "ng-zorro-antd/message"
import { AuthService } from "../../core/services/auth.service"
import { User, UserRole } from "../../core/models/user.model"

interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  website: string
  taxNumber: string
  currency: string
  currencySymbol: string
  defaultTaxRate: number
}

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzSwitchModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzModalModule,
    NzPopconfirmModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-600 mt-1">Manage your system settings and preferences</p>
        </div>

        <nz-tabset nzType="card" class="bg-white rounded-lg shadow-sm">
          <!-- Company Settings Tab -->
          <nz-tab nzTitle="Company Settings">
            <div class="p-6">
              <div class="max-w-2xl">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
                
                <form nz-form [formGroup]="companyForm" (ngSubmit)="saveCompanySettings()">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <nz-form-item>
                      <nz-form-label [nzSpan]="24" nzRequired>Company Name</nz-form-label>
                      <nz-form-control [nzSpan]="24" nzErrorTip="Please input company name!">
                        <input nz-input formControlName="companyName" placeholder="Company Name" />
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Tax Number</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <input nz-input formControlName="taxNumber" placeholder="Tax Number" />
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item class="md:col-span-2">
                      <nz-form-label [nzSpan]="24">Address</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <textarea nz-input formControlName="address" placeholder="Company Address" rows="3"></textarea>
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Phone</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <input nz-input formControlName="phone" placeholder="Phone Number" />
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Email</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <input nz-input type="email" formControlName="email" placeholder="Email Address" />
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Website</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <input nz-input formControlName="website" placeholder="Website URL" />
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Currency</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <nz-select formControlName="currency">
                          <nz-option nzValue="USD" nzLabel="USD - US Dollar"></nz-option>
                          <nz-option nzValue="EUR" nzLabel="EUR - Euro"></nz-option>
                          <nz-option nzValue="GBP" nzLabel="GBP - British Pound"></nz-option>
                          <nz-option nzValue="CAD" nzLabel="CAD - Canadian Dollar"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Currency Symbol</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <input nz-input formControlName="currencySymbol" placeholder="$" />
                      </nz-form-control>
                    </nz-form-item>

                    <nz-form-item>
                      <nz-form-label [nzSpan]="24">Default Tax Rate (%)</nz-form-label>
                      <nz-form-control [nzSpan]="24">
                        <input nz-input type="number" formControlName="defaultTaxRate" min="0" max="100" step="0.01" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>

                  <div class="flex justify-end mt-8">
                    <button nz-button nzType="primary" [nzLoading]="savingCompany" class="bg-blue-600 hover:bg-blue-700">
                      Save Company Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </nz-tab>

          <!-- User Management Tab -->
          <nz-tab nzTitle="User Management">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-900">System Users</h3>
                <button nz-button nzType="primary" (click)="showAddUserModal()" class="bg-blue-600 hover:bg-blue-700">
                  <span nz-icon nzType="plus"></span>
                  Add User
                </button>
              </div>

              <div class="bg-white rounded-lg border border-gray-200">
                <nz-table #userTable [nzData]="users" [nzLoading]="loadingUsers">
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Username</th>
                      <th class="text-left">Email</th>
                      <th class="text-center">Role</th>
                      <th class="text-center">Status</th>
                      <th class="text-left">Created</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of userTable.data">
                      <td class="font-medium">{{ user.firstName }} {{ user.lastName }}</td>
                      <td>{{ user.username }}</td>
                      <td>{{ user.email }}</td>
                      <td class="text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-red-100 text-red-800': user.role === 'admin',
                                'bg-blue-100 text-blue-800': user.role === 'manager',
                                'bg-green-100 text-green-800': user.role === 'cashier'
                              }">
                          {{ user.role | titlecase }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-green-100 text-green-800': user.isActive,
                                'bg-gray-100 text-gray-800': !user.isActive
                              }">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>{{ user.createdAt | date:'short' }}</td>
                      <td class="text-center">
                        <div class="flex justify-center space-x-2">
                          <button nz-button nzType="link" nzSize="small" (click)="editUser(user)">
                            <span nz-icon nzType="edit" class="text-blue-600"></span>
                          </button>
                          <button 
                            nz-button 
                            nzType="link" 
                            nzSize="small" 
                            nz-popconfirm 
                            nzPopconfirmTitle="Are you sure delete this user?"
                            (nzOnConfirm)="deleteUser(user.id)"
                          >
                            <span nz-icon nzType="delete" class="text-red-600"></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </nz-table>
              </div>
            </div>
          </nz-tab>

          <!-- System Preferences Tab -->
          <nz-tab nzTitle="System Preferences">
            <div class="p-6">
              <div class="max-w-2xl space-y-8">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-6">General Preferences</h3>
                  
                  <div class="space-y-6">
                    <div class="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">Auto-backup</h4>
                        <p class="text-sm text-gray-500">Automatically backup data daily</p>
                      </div>
                      <nz-switch [(ngModel)]="preferences.autoBackup" (ngModelChange)="savePreferences()"></nz-switch>
                    </div>

                    <div class="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p class="text-sm text-gray-500">Send email notifications for important events</p>
                      </div>
                      <nz-switch [(ngModel)]="preferences.emailNotifications" (ngModelChange)="savePreferences()"></nz-switch>
                    </div>

                    <div class="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">Low Stock Alerts</h4>
                        <p class="text-sm text-gray-500">Alert when products are running low</p>
                      </div>
                      <nz-switch [(ngModel)]="preferences.lowStockAlerts" (ngModelChange)="savePreferences()"></nz-switch>
                    </div>

                    <div class="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">Print Receipts</h4>
                        <p class="text-sm text-gray-500">Automatically print receipts after sales</p>
                      </div>
                      <nz-switch [(ngModel)]="preferences.autoPrintReceipts" (ngModelChange)="savePreferences()"></nz-switch>
                    </div>

                    <div class="py-4">
                      <label class="block text-sm font-medium text-gray-900 mb-2">Receipt Footer Message</label>
                      <textarea 
                        nz-input 
                        [(ngModel)]="preferences.receiptFooter" 
                        (ngModelChange)="savePreferences()"
                        placeholder="Thank you for your business!"
                        rows="3"
                        class="w-full"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nz-tab>
        </nz-tabset>

        <!-- Add/Edit User Modal -->
        <nz-modal
          [(nzVisible)]="isUserModalVisible"
          [nzTitle]="userModalTitle"
          (nzOnCancel)="handleUserModalCancel()"
          (nzOnOk)="handleUserModalOk()"
          [nzOkLoading]="savingUser"
        >
          <ng-container *nzModalContent>
            <form nz-form [formGroup]="userForm">
              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>First Name</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input first name!">
                  <input nz-input formControlName="firstName" placeholder="First Name" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Last Name</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input last name!">
                  <input nz-input formControlName="lastName" placeholder="Last Name" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Username</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input username!">
                  <input nz-input formControlName="username" placeholder="Username" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Email</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input valid email!">
                  <input nz-input type="email" formControlName="email" placeholder="Email" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item *ngIf="!editingUser">
                <nz-form-label [nzSpan]="6" nzRequired>Password</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input password!">
                  <input nz-input type="password" formControlName="password" placeholder="Password" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Role</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please select role!">
                  <nz-select formControlName="role" nzPlaceHolder="Select Role">
                    <nz-option nzValue="admin" nzLabel="Admin"></nz-option>
                    <nz-option nzValue="manager" nzLabel="Manager"></nz-option>
                    <nz-option nzValue="cashier" nzLabel="Cashier"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </form>
          </ng-container>
        </nz-modal>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  companyForm: FormGroup
  userForm: FormGroup
  users: User[] = []
  loadingUsers = false
  savingCompany = false
  savingUser = false

  // User modal
  isUserModalVisible = false
  userModalTitle = "Add User"
  editingUser: User | null = null

  // Preferences
  preferences = {
    autoBackup: true,
    emailNotifications: true,
    lowStockAlerts: true,
    autoPrintReceipts: false,
    receiptFooter: "Thank you for your business!",
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
  ) {
    this.companyForm = this.fb.group({
      companyName: ["My POS System", [Validators.required]],
      address: [""],
      phone: [""],
      email: [""],
      website: [""],
      taxNumber: [""],
      currency: ["USD", [Validators.required]],
      currencySymbol: ["$", [Validators.required]],
      defaultTaxRate: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    })

    this.userForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      username: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      role: ["cashier", [Validators.required]],
    })
  }

  ngOnInit(): void {
    this.loadUsers()
    this.loadCompanySettings()
  }

  loadUsers(): void {
    this.loadingUsers = true
    // Mock users data - replace with actual API call
    setTimeout(() => {
      this.users = [
        {
          id: "1",
          username: "admin",
          email: "admin@pos.com",
          firstName: "System",
          lastName: "Administrator",
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          username: "manager",
          email: "manager@pos.com",
          firstName: "Store",
          lastName: "Manager",
          role: UserRole.MANAGER,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      this.loadingUsers = false
    }, 1000)
  }

  loadCompanySettings(): void {
    // Mock company settings - replace with actual API call
    const mockSettings = {
      companyName: "My POS System",
      address: "123 Business Street, City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "info@mypos.com",
      website: "https://mypos.com",
      taxNumber: "TAX123456789",
      currency: "USD",
      currencySymbol: "$",
      defaultTaxRate: 10,
    }

    this.companyForm.patchValue(mockSettings)
  }

  saveCompanySettings(): void {
    if (this.companyForm.valid) {
      this.savingCompany = true

      // Mock API call - replace with actual service
      setTimeout(() => {
        this.message.success("Company settings saved successfully")
        this.savingCompany = false
      }, 1000)
    }
  }

  savePreferences(): void {
    // Mock API call - replace with actual service
    this.message.success("Preferences updated")
  }

  showAddUserModal(): void {
    this.userModalTitle = "Add User"
    this.editingUser = null
    this.userForm.reset()
    this.userForm.get("role")?.setValue("cashier")
    this.userForm.get("password")?.setValidators([Validators.required, Validators.minLength(6)])
    this.isUserModalVisible = true
  }

  editUser(user: User): void {
    this.userModalTitle = "Edit User"
    this.editingUser = user
    this.userForm.patchValue(user)
    this.userForm.get("password")?.clearValidators()
    this.userForm.get("password")?.updateValueAndValidity()
    this.isUserModalVisible = true
  }

  handleUserModalOk(): void {
    if (this.userForm.valid) {
      this.savingUser = true

      // Mock API call - replace with actual service
      setTimeout(() => {
        this.message.success(`User ${this.editingUser ? "updated" : "created"} successfully`)
        this.isUserModalVisible = false
        this.savingUser = false
        this.loadUsers()
      }, 1000)
    }
  }

  handleUserModalCancel(): void {
    this.isUserModalVisible = false
  }

  deleteUser(id: string): void {
    // Mock API call - replace with actual service
    this.message.success("User deleted successfully")
    this.loadUsers()
  }
}
