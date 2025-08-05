import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { environment } from "../../../environments/environment"

export interface SalesReportData {
  sales: any[]
  summary: {
    totalSales: number
    salesCount: number
    avgOrderValue: number
    totalItemsSold: number
  }
}

export interface StockReportData {
  products: any[]
  summary: {
    totalProducts: number
    totalStockValue: number
    lowStockItems: number
    outOfStockItems: number
  }
}

export interface PurchaseReportData {
  purchases: any[]
  summary: {
    totalPurchases: number
    purchaseCount: number
    avgPurchaseValue: number
  }
}

export interface ProfitLossData {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossProfitMargin: number
  expenses: number
  netProfit: number
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`

  constructor(private http: HttpClient) {}

  getSalesReport(startDate: string, endDate: string): Observable<SalesReportData> {
    return this.http.get<SalesReportData>(`${this.apiUrl}/sales`, {
      params: { startDate, endDate },
    })
  }

  getStockReport(): Observable<StockReportData> {
    return this.http.get<StockReportData>(`${this.apiUrl}/stock`)
  }

  getPurchaseReport(startDate: string, endDate: string): Observable<PurchaseReportData> {
    return this.http.get<PurchaseReportData>(`${this.apiUrl}/purchases`, {
      params: { startDate, endDate },
    })
  }

  getProfitLossReport(startDate: string, endDate: string): Observable<ProfitLossData> {
    return this.http.get<ProfitLossData>(`${this.apiUrl}/profit-loss`, {
      params: { startDate, endDate },
    })
  }

  getReturnsReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/returns`, {
      params: { startDate, endDate },
    })
  }
}
