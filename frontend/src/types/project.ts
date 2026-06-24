import type { EntityBase } from './common'

export interface Project extends EntityBase {
  title: string
  shortDescription?: string
  detailedDescription?: string
  problemSolved?: string
  techStack?: string[]
  features?: string[]
  githubUrl?: string
  liveUrl?: string
  demoUrl?: string
  architectureUrl?: string
  isFeatured?: boolean
}
