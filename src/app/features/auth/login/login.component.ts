import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { NzMessageService } from "ng-zorro-antd/message"
import { AuthService } from "../../../core/services/auth.service"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzDividerModule } from "ng-zorro-antd/divider"


@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, 
    NzButtonModule, NzCardModule,NzDividerModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
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

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/dashboard"])
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.message.success("Login successful")
          this.router.navigate(["/dashboard"])
        },
        error: (error) => {
          console.error("Login error:", error)
          this.message.error("Invalid username or password")
          this.loading = false
        },
      })
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }
}
