import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { Expense, CreateExpenseDto } from "../models/expense.model"

@Injectable({
  providedIn: "root",
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl)
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`)
  }

  createExpense(expense: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense)
  }

  updateExpense(id: string, expense: CreateExpenseDto): Observable<Expense> {
    return this.http.patch<Expense>(`${this.apiUrl}/${id}`, expense)
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  getExpensesByDateRange(startDate: Date, endDate: Date): Observable<Expense[]> {
    const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    return this.http.get<Expense[]>(`${this.apiUrl}/date-range${params}`)
  }

  getExpensesByCategory(category: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/category/${category}`)
  }
}
