import type { Product } from "./product.model"
import type { User } from "./user.model"

export interface Sale {
  id: string
  invoiceNumber: string
  customerName?: string
  customerPhone?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paid: number
  change: number
  status: "pending" | "completed" | "cancelled"
  cashier: User
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

export interface CreateSaleRequest {
  customerName?: string
  customerPhone?: string
  items: CreateSaleItemRequest[]
  discount?: number
  tax?: number
  paid: number
}

export interface CreateSaleItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}

export interface SaleReturn {
  id: string
  returnNumber: string
  sale: Sale
  items: SaleReturnItem[]
  reason: string
  total: number
  status: "pending" | "approved" | "rejected"
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface SaleReturnItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

export interface CreateSaleReturnRequest {
  saleId: string
  reason: string
  items: CreateSaleReturnItemRequest[]
}

export interface CreateSaleReturnItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}
