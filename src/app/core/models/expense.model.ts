export interface Expense {
  id: string
  description: string
  amount: number
  date: Date
  category: string
  accountId: string
  account?: any
  receiptNumber?: string
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExpenseDto {
  description: string
  amount: number
  date: Date
  category: string
  accountId: string
  receiptNumber?: string
  notes?: string
}
