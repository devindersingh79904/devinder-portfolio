import type { EntityBase } from './common'

export interface Certification extends EntityBase {
  title: string
  issuer: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  skills?: string[]
  status?: string
}
