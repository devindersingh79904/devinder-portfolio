export interface ContactForm {
  name: string
  email: string
  company?: string
  subject: string
  message: string
}

export interface ContactLead extends ContactForm {
  id: string
  createdAt: string
  source?: string
}
