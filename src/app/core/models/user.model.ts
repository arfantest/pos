export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}
