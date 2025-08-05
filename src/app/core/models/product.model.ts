export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  barcode?: string
  price: number
  cost: number
  stock: number
  minStock: number
  isActive: boolean
  categoryId: string
  brandId: string
  category: Category
  brand: Brand
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  sku: string
  name: string
  description?: string
  barcode?: string
  price: number
  cost: number
  stock: number
  minStock: number
  categoryId: string
  brandId: string
}
