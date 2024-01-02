import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { Code } from 'mdxts/components'
import { PageContainer } from 'components/PageContainer'
import { SiblingLinks } from 'components/SiblingLinks'
import { TableOfContents } from 'components/TableOfContents'
import { allPackages } from 'data'
import { getSiteMetadata } from 'utils/get-site-metadata'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return allPackages.paths().map((pathname) => ({ slug: pathname }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] }
}) {
  const data = await allPackages.get(params.slug)
  return getSiteMetadata({
    title: `${data?.title} - MDXTS`,
    description: data?.description,
  })
}

export default async function Page({ params }: { params: { slug: string } }) {
  const singlePackage = await allPackages.get(params.slug)

  if (singlePackage === undefined) {
    return notFound()
  }

  const {
    Content,
    title,
    description,
    headings,
    examples,
    exportedTypes,
    sourcePath,
    isServerOnly,
  } = singlePackage

  return (
    <PageContainer>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.4rem',
            gap: '1rem',
          }}
        >
          {title ? (
            <h1
              style={{
                // @ts-expect-error
                textWrap: 'balance',
                margin: 0,
              }}
            >
              {title}
            </h1>
          ) : null}
          {isServerOnly ? (
            <span
              style={{
                fontSize: 'var(--font-size-body-2)',
                padding: '0.25rem 0.8rem',
                border: '1px solid #3F687E',
                borderRadius: '1rem',
                flexShrink: 0,
              }}
            >
              Server Only
            </span>
          ) : null}
        </div>

        {description ? (
          <p
            style={{
              // @ts-expect-error
              textWrap: 'pretty',
            }}
          >
            {description}
          </p>
        ) : null}

        {Content ? <Content /> : null}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2.8rem',
          }}
        >
          {examples.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.6rem',
              }}
            >
              <h2 id="examples" style={{ margin: 0 }}>
                Examples
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
                  gap: '1rem',
                }}
              >
                {examples.map((example) => (
                  <div
                    key={example.slug}
                    id={example.slug}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      padding: '0.5rem',
                      gap: '0.5rem',
                      borderRadius: '0.25rem',
                      backgroundColor: 'var(--color-surface-2)',
                    }}
                  >
                    <h3 style={{ flexShrink: 0, margin: 0 }}>{example.name}</h3>
                    <div
                      style={{
                        height: '10rem',
                        padding: '1rem',
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-separator)',
                      }}
                    >
                      <div
                        style={{
                          [String('--scale')]: 0.4,
                          display: 'flex',
                          transformOrigin: 'top left',
                          scale: 'var(--scale)',
                          width: 'calc(100% / var(--scale))',
                          height: 'calc(100% / var(--scale))',
                        }}
                      >
                        <div style={{ margin: 'auto' }}>
                          <example.moduleExport />
                        </div>
                      </div>
                    </div>
                    <a
                      href={`/examples/${example.pathname}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {exportedTypes.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.6rem',
              }}
            >
              <h2 id="exports" style={{ margin: 0 }}>
                Exports
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem',
                }}
              >
                {exportedTypes.map((type) => {
                  const isActive = singlePackage.pathname === type.pathname
                  return (
                    <div
                      key={type.name}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem',
                          }}
                        >
                          {isActive ? (
                            <h3 id={type.slug} style={{ margin: 0 }}>
                              {type.name}
                            </h3>
                          ) : (
                            <a href={type.pathname}>
                              <h3 id={type.slug} style={{ margin: 0 }}>
                                {type.name}
                              </h3>
                            </a>
                          )}

                          {isActive && type.sourcePath && (
                            <a
                              href={type.sourcePath}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 'var(--font-size-body-2)' }}
                            >
                              View Source
                            </a>
                          )}
                        </div>
                        {!type.isMainExport && type.description ? (
                          <p style={{ margin: 0 }}>{type.description}</p>
                        ) : null}
                      </div>

                      {isActive && type.types.length > 0 ? (
                        <>
                          <h4 style={{ margin: '1rem 0 0' }}>
                            {type.isComponent ? 'Props' : 'Types'}
                          </h4>

                          <Props
                            props={type.types}
                            isComponent={type.isComponent}
                          />
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <SiblingLinks
          previous={singlePackage.previous}
          next={singlePackage.next}
        />
      </div>
      <TableOfContents headings={headings} sourcePath={sourcePath} />
    </PageContainer>
  )
}

function Props({
  props,
  isComponent,
}: {
  props: any[] | null
  isComponent: boolean
}) {
  return props?.map((propType, index) => {
    if (propType === null) {
      return null
    }

    if (
      isComponent &&
      propType.unionProperties &&
      propType.unionProperties.length > 0
    ) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '2rem',
            }}
          >
            <span>{propType.text}</span>
          </div>
          {propType.description && (
            <p style={{ margin: 0 }}>{propType.description}</p>
          )}
          <div>
            <h4>Union Props</h4>
            {propType.unionProperties.map((props: any, index: number) => (
              <Fragment key={index}>
                {index > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        height: 1,
                        backgroundColor: 'var(--color-separator)',
                      }}
                    />
                    <div style={{ height: 1 }}>
                      <span
                        style={{
                          fontSize: 'var(--font-size-body-2)',
                          padding: '0.1rem 1rem 0.25rem',
                          border: '1px solid var(--color-separator)',
                          borderRadius: '1rem',
                          color: '#ccc',
                          position: 'relative',
                          top: -16,
                          userSelect: 'none',
                        }}
                      >
                        or
                      </span>
                    </div>
                    <div
                      style={{
                        height: 1,
                        backgroundColor: 'var(--color-separator)',
                      }}
                    />
                  </div>
                ) : null}
                <Props props={props} isComponent={isComponent} />
              </Fragment>
            ))}
          </div>
          <div>
            <h4>Base Props</h4>
            <Props props={propType.properties} isComponent={isComponent} />
          </div>
        </div>
      )
    }

    if (propType.name === null) {
      return propType.properties ? (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Props props={propType.properties} isComponent={isComponent} />
        </div>
      ) : (
        propType.text
      )
    }

    return (
      <div
        key={propType.name}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 0',
          gap: '0.5rem',
          borderTop: index === 0 ? 'none' : '1px solid var(--color-separator)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <h4
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flexShrink: 0,
              margin: 0,
              fontWeight: 600,
            }}
          >
            {propType.name} {propType.required && '*'}
          </h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Code
              inline
              value={propType.text}
              language="typescript"
              paddingHorizontal="0.5rem"
              paddingVertical="0.2rem"
            />
            {propType.defaultValue ? (
              <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>
                = {propType.defaultValue}
              </span>
            ) : null}
          </div>
        </div>
        {propType.description && (
          <p style={{ margin: 0 }}>{propType.description}</p>
        )}

        {propType.properties && propType.properties.length > 0 ? (
          <Props props={propType.properties} isComponent={isComponent} />
        ) : null}
      </div>
    )
  })
}