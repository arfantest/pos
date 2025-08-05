export interface Sale {
  id: string
  invoiceNumber: string
  subtotal: number
  discount: number
  tax: number
  total: number
  paid: number
  change: number
  status: string
  customerName?: string
  customerPhone?: string
  items: SaleItem[]
  cashier: any
  createdAt: Date
  updatedAt: Date
}

export interface SaleItem {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: any
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[]
  discount: number
  tax: number
  paid: number
  customerName?: string
  customerPhone?: string
  accountId?: string // For account-based sales
}

export interface CreateSaleItemDto {
  productId: string
  quantity: number
  unitPrice: number
}
