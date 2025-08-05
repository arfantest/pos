import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`

  constructor(private http: HttpClient) {}

  getSalesReport(startDate: Date, endDate: Date): Observable<any> {
    const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    return this.http.get<any>(`${this.apiUrl}/sales${params}`)
  }

  getPurchaseReport(startDate: Date, endDate: Date): Observable<any> {
    const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    return this.http.get<any>(`${this.apiUrl}/purchases${params}`)
  }

  getStockReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock`)
  }

  getProfitLossStatement(startDate: Date, endDate: Date): Observable<any> {
    const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    return this.http.get<any>(`${this.apiUrl}/profit-loss${params}`)
  }

  getExpenseReport(startDate: Date, endDate: Date): Observable<any> {
    const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    return this.http.get<any>(`${this.apiUrl}/expenses${params}`)
  }

  getAccountBalanceReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account-balances`)
  }

  getGeneralLedger(startDate?: Date, endDate?: Date): Observable<any> {
    let params = ""
    if (startDate && endDate) {
      params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    }
    return this.http.get<any>(`${environment.apiUrl}/ledger/general${params}`)
  }
}
