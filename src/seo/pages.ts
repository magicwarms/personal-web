import { profile, projects, site } from '../data/portfolio'
import type { CaseStudy, Project } from '../data/portfolio'

/** A project that has written case-study copy, and so gets its own page. */
export type CaseProject = Project & { caseStudy: CaseStudy }

export type Page =
  | { kind: 'home'; path: '/' }
  | { kind: 'case'; path: string; project: CaseProject }

export const homePage: Page = { kind: 'home', path: '/' }

const hasCaseStudy = (project: Project): project is CaseProject => project.caseStudy !== undefined

/** The home page, then one case page per project with a `caseStudy`. */
export function getPages(list: readonly Project[] = projects): Page[] {
  const cases = list.filter(hasCaseStudy).map(
    (project): Page => ({ kind: 'case', path: `/work/${project.id}`, project }),
  )
  return [homePage, ...cases]
}

/**
 * The page for a request path. Anything unmatched gets home: the server
 * answers unknown paths with the home HTML (and a 404), so the client has to
 * hydrate home for them or the markup would mismatch.
 */
export function resolvePage(path: string, list: readonly Project[] = projects): Page {
  return getPages(list).find((page) => page.path === path) ?? homePage
}

export function pageUrl(page: Page): string {
  return `${site.url}${page.path}`
}

export function pageTitle(page: Page): string {
  return page.kind === 'home' ? site.title : `${page.project.org} case study | ${profile.name}`
}

export function pageDescription(page: Page): string {
  return page.kind === 'home' ? site.description : page.project.caseStudy.description
}
