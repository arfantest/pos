import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { environment } from "../../../environments/environment"

export interface PurchaseReportData {
  purchases: any[]
  summary: {
    totalPurchases: number
    purchaseCount: number
    avgPurchaseValue: number
    totalItemsPurchased: number
  }
  chartData: {
    labels: string[]
    datasets: any[]
  }
}

export interface ReturnsReportData {
  saleReturns: any[]
  purchaseReturns: any[]
  summary: {
    totalSaleReturns: number
    totalPurchaseReturns: number
    saleReturnValue: number
    purchaseReturnValue: number
    returnRate: number
  }
  chartData: {
    labels: string[]
    datasets: any[]
  }
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`

  constructor(private http: HttpClient) {}

  getPurchaseReport(startDate: string, endDate: string): Observable<PurchaseReportData> {
    return this.http.get<PurchaseReportData>(`${this.apiUrl}/purchases`, {
      params: { startDate, endDate },
    })
  }

  getReturnsReport(startDate: string, endDate: string): Observable<ReturnsReportData> {
    return this.http.get<ReturnsReportData>(`${this.apiUrl}/returns`, {
      params: { startDate, endDate },
    })
  }

  getSalesReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales`, {
      params: { startDate, endDate },
    })
  }

  getStockReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stock`)
  }

  getProfitLossReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profit-loss`, {
      params: { startDate, endDate },
    })
  }
}
