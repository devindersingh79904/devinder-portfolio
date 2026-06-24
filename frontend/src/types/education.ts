import type { EntityBase } from './common'

export interface Education extends EntityBase {
  institutionName: string
  degree: string
  fieldOfStudy?: string
  startYear?: number
  endYear?: number
  grade?: string
  description?: string
}
