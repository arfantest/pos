import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import  {
  Purchase,
  CreatePurchaseRequest,
  PurchaseReturn,
  CreatePurchaseReturnRequest,
} from "../models/purchase.model"

@Injectable({
  providedIn: "root",
})
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/purchases`

  constructor(private http: HttpClient) {}

  getPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(this.apiUrl)
  }

  getPurchase(id: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.apiUrl}/${id}`)
  }

  createPurchase(purchase: CreatePurchaseRequest): Observable<Purchase> {
    return this.http.post<Purchase>(this.apiUrl, purchase)
  }

  updatePurchase(id: string, purchase: Partial<Purchase>): Observable<Purchase> {
    return this.http.put<Purchase>(`${this.apiUrl}/${id}`, purchase)
  }

  deletePurchase(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  receivePurchase(id: string): Observable<Purchase> {
    return this.http.patch<Purchase>(`${this.apiUrl}/${id}/receive`, {})
  }

  // Purchase Returns
  getPurchaseReturns(): Observable<PurchaseReturn[]> {
    return this.http.get<PurchaseReturn[]>(`${this.apiUrl}/returns`)
  }

  getPurchaseReturn(id: string): Observable<PurchaseReturn> {
    return this.http.get<PurchaseReturn>(`${this.apiUrl}/returns/${id}`)
  }

  createPurchaseReturn(returnData: CreatePurchaseReturnRequest): Observable<PurchaseReturn> {
    return this.http.post<PurchaseReturn>(`${this.apiUrl}/returns`, returnData)
  }

  updatePurchaseReturn(id: string, returnData: Partial<PurchaseReturn>): Observable<PurchaseReturn> {
    return this.http.put<PurchaseReturn>(`${this.apiUrl}/returns/${id}`, returnData)
  }
}
