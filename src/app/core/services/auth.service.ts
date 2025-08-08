// auth.service.ts
import { Injectable, Injector } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable } from "rxjs"
import { tap } from "rxjs/operators"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  private httpClient!: HttpClient

  constructor(private injector: Injector) {
    // Don't validate token in constructor to avoid circular dependency
    // Call this method after app initialization
    this.initializeAuth()
  }

  private initializeAuth(): void {
    // Delay HttpClient injection to avoid circular dependency
    setTimeout(() => {
      this.httpClient = this.injector.get(HttpClient)
      const token = localStorage.getItem("token")
      if (token) {
        // Validate token and set user
        this.validateToken().subscribe()
      }
    })
  }

  private getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = this.injector.get(HttpClient)
    }
    return this.httpClient
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.getHttpClient().post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem("token", response.access_token)
        this.currentUserSubject.next(response.user)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    window.location.reload()
    this.currentUserSubject.next(null)
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  validateToken(): Observable<any> {
    return this.getHttpClient().post<any>(`${environment.apiUrl}/auth/validate`, {}).pipe(
      tap((response) => {
        this.currentUserSubject.next(response.user)
      }),
    )
  }
}