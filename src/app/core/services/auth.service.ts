import { Injectable } from "@angular/core"
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

  constructor(private http: HttpClient) {
    const token = localStorage.getItem("token")
    if (token) {
      // Validate token and set user
      this.validateToken().subscribe()
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem("token", response.access_token)
        this.currentUserSubject.next(response.user)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    this.currentUserSubject.next(null)
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  validateToken(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/validate`, {}).pipe(
      tap((response) => {
        this.currentUserSubject.next(response.user)
      }),
    )
  }
}
