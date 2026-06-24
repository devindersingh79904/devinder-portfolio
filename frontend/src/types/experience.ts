import type { EntityBase } from './common'

export interface Experience extends EntityBase {
  companyName: string
  role: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  summary?: string
  techStack?: string[]
  achievements?: string[]
}
