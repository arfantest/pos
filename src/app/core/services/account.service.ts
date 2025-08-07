import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { Account, CreateAccountDto } from "../models/account.model"

@Injectable({
  providedIn: "root",
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/accounts`

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl)
  }

  getAccount(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`)
  }

  createAccount(account: CreateAccountDto): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, account)
  }

  updateAccount(id: string, account: CreateAccountDto): Observable<Account> {
    return this.http.patch<Account>(`${this.apiUrl}/${id}`, account)
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  getAccountLedger(accountId: string, startDate?: Date, endDate?: Date): Observable<any[]> {
    let params = ""
    if (startDate && endDate) {
      params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    }
    return this.http.get<any[]>(`${environment.apiUrl}/ledger/account/${accountId}${params}`)
  }
  getJournalEntries(params:any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/accounting/journal-entries`,{ params })
  }
}
