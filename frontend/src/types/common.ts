// Shared API envelope + pagination types matching the backend response wrapper.

export interface ApiError {
  field?: string
  message: string
  code: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  errors: ApiError[]
  timestamp: string
  correlationId: string
}

export interface PaginationData<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface EntityBase {
  id: string
  displayOrder?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}
