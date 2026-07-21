export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
}

export interface Program {
  id: string
  title: string
  items: string[]
}

export interface Differentiator {
  id: string
  icon: string
  title: string
  desc: string
}

export interface NavItem {
  label: string
  href: string
}

export interface Step {
  icon: string
  title: string
  desc: string
}

export interface WhyHomePoint {
  icon: string
  title: string
  desc: string
}

export interface FAQItem {
  question: string
  answer: string
}
