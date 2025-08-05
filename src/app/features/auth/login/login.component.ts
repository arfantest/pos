import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzCheckboxModule } from "ng-zorro-antd/checkbox"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzCardModule } from "ng-zorro-antd/card"
import  { NzMessageService } from "ng-zorro-antd/message"
import  { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzCardModule,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span nz-icon nz="shop" class="text-white text-2xl"></span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">POS System</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <nz-form-item>
              <nz-form-label [nzSpan]="24" nzRequired>Username</nz-form-label>
              <nz-form-control [nzSpan]="24" nzErrorTip="Please input your username!">
                <input 
                  nz-input 
                  formControlName="username" 
                  placeholder="Enter your username"
                  class="h-12"
                />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="24" nzRequired>Password</nz-form-label>
              <nz-form-control [nzSpan]="24" nzErrorTip="Please input your password!">
                <input 
                  nz-input 
                  ="password" 
                  formControlName="password" 
                  placeholder="Enter your password"
                  class="h-12"
                />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control [nzSpan]="24">
                <label nz-checkbox formControlName="remember">
                  <span class="text-gray-600">Remember me</span>
                </label>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control [nzSpan]="24">
                <button 
                  nz-button 
                  nz="primary" 
                  nzSize="large"
                  [nzLoading]="loading"
                  [disabled]="!loginForm.valid"
                  class="w-full h-12 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                >
                  Sign In
                </button>
              </nz-form-control>
            </nz-form-item>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <div class="space-y-1 text-sm text-gray-600">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Manager:</strong> manager / manager123</p>
              <p><strong>Cashier:</strong> cashier / cashier123</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; 2024 POS System. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup
  loading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService,
  ) {
    this.loginForm = this.fb.group({
      username: ["admin", [Validators.required]],
      password: ["admin123", [Validators.required]],
      remember: [true],
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true
      const { username, password } = this.loginForm.value

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.message.success("Login successful!")
          this.router.navigate(["/dashboard"])
        },
        error: (error) => {
          this.message.error("Invalid username or password")
          this.loading = false
        },
      })
    }
  }
}
