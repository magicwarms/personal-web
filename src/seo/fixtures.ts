import type { Project } from '../data/portfolio'
import type { CaseProject } from './pages'

/** A project with a case study, for tests that must not depend on real copy. */
export const withCase: CaseProject = {
  id: 'alpha',
  index: '01',
  org: 'Alpha Co',
  period: '2026',
  role: 'Lead',
  title: 'A test project',
  summary: 'Summary.',
  caseStudy: {
    description: 'How Alpha Co shipped a thing.',
    context: ['Before.'],
    approach: ['During.'],
  },
}

export const withoutCase: Project = {
  id: 'beta',
  index: '02',
  org: 'Beta Co',
  period: '2025',
  role: 'Dev',
  title: 'Another project',
  summary: 'Summary.',
}
