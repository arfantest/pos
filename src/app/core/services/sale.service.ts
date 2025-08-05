import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { Sale} from "../models/sale.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`

  constructor(private http: HttpClient) {}

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl)
  }

  getSale(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`)
  }

  createSale(sale: any): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale)
  }

  updateSale(id: string, sale: Partial<Sale>): Observable<Sale> {
    return this.http.put<Sale>(`${this.apiUrl}/${id}`, sale)
  }

  deleteSale(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  // Sale Returns
  getSaleReturns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/returns`)
  }

  getSaleReturn(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/returns/${id}`)
  }

  createSaleReturn(returnData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/returns`, returnData)
  }

  updateSaleReturn(id: string, returnData: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/returns/${id}`, returnData)
  }
}
