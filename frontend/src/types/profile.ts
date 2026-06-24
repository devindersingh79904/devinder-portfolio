import type { EntityBase } from './common'

export interface Profile extends EntityBase {
  fullName: string
  headline: string
  summary?: string
  location?: string
  email: string
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  profileImageUrl?: string
  resumeUrl?: string
  resumeFileName?: string
  resumeUpdatedAt?: string
}
