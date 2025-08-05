import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder,  FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import  { Router } from "@angular/router"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzCardModule } from "ng-zorro-antd/card"
import  { NzMessageService } from "ng-zorro-antd/message"
import  { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzCardModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to POS System
          </h2>
        </div>
        <nz-card>
          <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <nz-form-item>
              <nz-form-label [nzSpan]="24" nzRequired>Username</nz-form-label>
              <nz-form-control [nzSpan]="24" nzErrorTip="Please input your username!">
                <input
                  nz-input
                  formControlName="username"
                  type="text"
                  placeholder="Enter your username"
                  class="w-full"
                />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="24" nzRequired>Password</nz-form-label>
              <nz-form-control [nzSpan]="24" nzErrorTip="Please input your password!">
                <input
                  nz-input
                  formControlName="password"
                  type="password"
                  placeholder="Enter your password"
                  class="w-full"
                />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <button
                nz-button
                nzType="primary"
                nzSize="large"
                [nzLoading]="loading"
                [disabled]="!loginForm.valid"
                class="w-full"
              >
                Sign In
              </button>
            </nz-form-item>
          </form>
        </nz-card>
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
      username: ["", [Validators.required]],
      password: ["", [Validators.required]],
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.message.success("Login successful!")
          this.router.navigate(["/dashboard"])
        },
        error: (error) => {
          this.message.error("Login failed. Please check your credentials.")
          this.loading = false
        },
        complete: () => {
          this.loading = false
        },
      })
    }
  }
}
