import { profile, roles, site } from '../data/portfolio'
import type { Role } from '../data/portfolio'
import { pageUrl } from './pages'
import type { Page } from './pages'

/**
 * llms.txt in the llmstxt.org shape: an H1, a blockquote summary, then
 * sections of links. Every URL is absolute.
 */
export function buildLlmsTxt(pages: readonly Page[], experience: readonly Role[] = roles): string {
  const lines = [
    `# ${profile.name}`,
    '',
    `> ${site.personDescription}`,
    '',
    `${profile.availability}: ${profile.workModes}.`,
  ]

  const cases = pages.filter((page) => page.kind === 'case')
  if (cases.length > 0) {
    lines.push('', '## Case studies', '')
    for (const page of cases) {
      lines.push(
        `- [${page.project.org}: ${page.project.title}](${pageUrl(page)}): ${page.project.caseStudy.description}`,
      )
    }
  }

  lines.push('', '## Experience', '')
  for (const role of experience) {
    lines.push(`- ${role.title}, ${role.company}, ${role.period}`)
  }

  lines.push(
    '',
    '## Contact',
    '',
    `- Email: ${profile.email}`,
    '',
    '## Optional',
    '',
    `- [Home page](${site.url}/)`,
    `- [CV (PDF)](${site.url}${profile.cv})`,
    `- [GitHub](${profile.github})`,
    `- [LinkedIn](${profile.linkedin})`,
  )

  return `${lines.join('\n')}\n`
}
