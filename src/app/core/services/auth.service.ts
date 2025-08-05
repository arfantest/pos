import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject,  Observable, of } from "rxjs"
import { tap } from "rxjs/operators"
import { environment } from "../../../environments/environment"
import {  User, UserRole } from "../models/user.model"

interface LoginResponse {
  access_token: string
  user: User
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user))
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    // Mock login for demo purposes
    return of({
      access_token: "mock-jwt-token",
      user: {
        id: "1",
        username,
        email: `${username}@pos.com`,
        firstName: username === "admin" ? "System" : username === "manager" ? "Store" : "John",
        lastName: username === "admin" ? "Administrator" : username === "manager" ? "Manager" : "Doe",
        role: username === "admin" ? UserRole.ADMIN : username === "manager" ? UserRole.MANAGER : UserRole.CASHIER,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).pipe(
      tap((response) => {
        localStorage.setItem("token", response.access_token)
        localStorage.setItem("user", JSON.stringify(response.user))
        this.currentUserSubject.next(response.user)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.currentUserSubject.next(null)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token")
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }
}
