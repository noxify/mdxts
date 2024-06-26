import type { Metadata } from 'next'
import { BASE_URL } from './constants'

const url = 'https://mdxts.dev/'

export function getSiteMetadata({
  title = 'MDXTS - The Content & Documentation SDK for React',
  description = `Build type-safe content and generate documentation using MDX, TypeScript, and React.`,
  keywords = 'react, mdx, typescript, content, documentation, components, design, systems',
  ...rest
}: { title?: string; description?: string } & Omit<
  Metadata,
  'title' | 'description'
> = {}) {
  return {
    metadataBase: new URL(url),
    title,
    description,
    keywords,
    ...rest,
    openGraph: {
      title: title!,
      description: description!,
      url,
      siteName: 'MDXTS',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og/default.png`,
          width: 1200,
          height: 630,
          type: 'image/png',
        },
      ],
      ...rest.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@souporserious',
      ...rest.twitter,
    },
  } satisfies Metadata
}
