import type { Product } from "./product.model"
import type { User } from "./user.model"

export interface Purchase {
  id: string
  purchaseOrderNumber: string
  supplierName: string
  supplierContact?: string
  items: PurchaseItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: "pending" | "received" | "cancelled"
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface PurchaseItem {
  id: string
  product: Product
  quantity: number
  unitCost: number
  total: number
}

export interface CreatePurchaseRequest {
  supplierName: string
  supplierContact?: string
  items: CreatePurchaseItemRequest[]
  discount?: number
  tax?: number
}

export interface CreatePurchaseItemRequest {
  productId: string
  quantity: number
  unitCost: number
}

export interface PurchaseReturn {
  id: string
  returnNumber: string
  purchase: Purchase
  items: PurchaseReturnItem[]
  reason: string
  total: number
  status: "pending" | "approved" | "rejected"
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface PurchaseReturnItem {
  id: string
  product: Product
  quantity: number
  unitCost: number
  total: number
}

export interface CreatePurchaseReturnRequest {
  purchaseId: string
  reason: string
  items: CreatePurchaseReturnItemRequest[]
}

export interface CreatePurchaseReturnItemRequest {
  productId: string
  quantity: number
  unitCost: number
}
