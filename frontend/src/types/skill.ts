import type { EntityBase } from './common'

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface Skill extends EntityBase {
  name: string
  category: string
  proficiency?: SkillProficiency | string
  yearsOfExperience?: number
}
