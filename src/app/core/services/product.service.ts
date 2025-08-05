import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { Product, Category, Brand, CreateProductRequest } from "../models/product.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}`

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`)
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`)
  }

  getProductByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/barcode?code=${barcode}`)
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, product)
  }

  updateProduct(id: string, product: CreateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}`, product)
  }

  updateStock(id: string, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}/stock`, { quantity })
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/products/${id}`)
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/categories`)
  }

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(`${this.API_URL}/categories`, category)
  }

  updateCategory(id: string, category: { name: string; description?: string }): Observable<Category> {
    return this.http.patch<Category>(`${this.API_URL}/categories/${id}`, category)
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/categories/${id}`)
  }

  // Brands
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.API_URL}/brands`)
  }

  createBrand(brand: { name: string; description?: string }): Observable<Brand> {
    return this.http.post<Brand>(`${this.API_URL}/brands`, brand)
  }

  updateBrand(id: string, brand: { name: string; description?: string }): Observable<Brand> {
    return this.http.patch<Brand>(`${this.API_URL}/brands/${id}`, brand)
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/brands/${id}`)
  }
}
