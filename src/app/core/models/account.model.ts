
export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  INCOME = 'income',
  EXPENSE = 'expense'
}
// export interface Account {
//   id: string
//   code: string
//   name: string
//   type: AccountType
//   description?: string
//   balance: number
//   isActive: boolean
//   createdAt: Date
//   updatedAt: Date
// }

// export interface CreateAccountDto {
//   code: string
//   name: string
//   type: AccountType
//   description?: string
// }



export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  description?: string
  balance: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateAccountDto {
  code: string
  name: string
  type: AccountType
  description?: string
  balance?: number
  isActive?: boolean
}

// export interface Account {
//   id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   createdAt?: Date;
// }