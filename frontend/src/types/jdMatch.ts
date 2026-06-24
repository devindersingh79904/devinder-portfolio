export interface JDMatchResult {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  weakSkills: string[]
  relevantProjects: { id: string; title: string; reason?: string }[]
  relevantExperience: { id: string; companyName: string; role: string; reason?: string }[]
  summary: string
}

export interface JDQuery {
  id: string
  hrName?: string
  hrEmail?: string
  companyName?: string
  roleTitle?: string
  jdText: string
  matchScore: number
  createdAt: string
}
