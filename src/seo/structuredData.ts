import { education, profile, site } from '../data/portfolio'
import { pageDescription, pageTitle, pageUrl } from './pages'
import type { Page } from './pages'

const websiteId = `${site.url}/#website`
const personId = `${site.url}/#person`

function website() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: `${site.url}/`,
    name: profile.name,
    inLanguage: 'en',
  }
}

function person() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    jobTitle: profile.title,
    description: site.personDescription,
    url: `${site.url}/`,
    image: `${site.url}${profile.photo}`,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: education.school },
    knowsLanguage: site.knowsLanguage,
    knowsAbout: site.knowsAbout,
    sameAs: [profile.github, profile.linkedin],
  }
}

/** The JSON-LD document for a page, as a plain object. */
export function buildStructuredData(page: Page) {
  if (page.kind === 'home') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        website(),
        {
          '@type': 'ProfilePage',
          '@id': `${pageUrl(page)}#profilepage`,
          url: pageUrl(page),
          name: pageTitle(page),
          dateModified: site.updated,
          isPartOf: { '@id': websiteId },
          mainEntity: { '@id': personId },
        },
        person(),
      ],
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl(page)}#webpage`,
        url: pageUrl(page),
        name: pageTitle(page),
        description: pageDescription(page),
        dateModified: site.updated,
        isPartOf: website(),
        author: { '@type': 'Person', '@id': personId, name: profile.name, url: `${site.url}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
          { '@type': 'ListItem', position: 2, name: page.project.org, item: pageUrl(page) },
        ],
      },
    ],
  }
}
