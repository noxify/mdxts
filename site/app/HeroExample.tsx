import Link from 'next/link'
import { basename } from 'node:path'
import { GeistMono } from 'geist/font/mono'
import { getTheme } from 'mdxts'
import { CodeBlock, type CodeBlockProps } from 'mdxts/components'
import { allDocs } from 'data'

import styles from './HeroExample.module.css'

const docsPageSource = `
import { allDocs } from '../../data'

export default async function Page({ params }) {
  const { Content } = await allDocs.get(params.slug)
  return <Content />
}
`.trim()

const sidebarSource = `
import Link from 'next/link'
import { Navigation } from 'mdxts/components'
import { allDocs } from './data'

export function Sidebar() {
  return (
    <Navigation
      source={allDocs}
      renderList={props => (
        <ul>
          {props.children}
        </ul>
      )}
      renderItem={props => (
        <li key={props.label}>
          {props.depth === 0 ? (
            <div>{props.label}</div>
          ) : (
            <Link href={props.pathname}>{props.label}</Link>
          )}
          {props.children}
        </li>
      )}
    />
  )
}
`.trim()

const theme = getTheme()
const LINE_COLOR = theme.colors['panel.border']
const codeProps = {
  padding: '0.7rem',
  toolbar: false,
  style: {
    height: '100%',
    margin: 0,
    borderRadius: '0.5rem',
  },
} satisfies Partial<CodeBlockProps>

export function HeroExample() {
  const entries = Object.values(allDocs.all()).filter((doc) => doc.depth === 1)
  const lastEntriesIndex = entries.length - 1
  return (
    <div className={styles.container}>
      <Card title="docs" column="16 / span 12" row="2 / 9">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            boxShadow: `0 0 0 1px ${theme.colors['panel.border']}70`,
            borderRadius: '0.5rem',
          }}
        >
          {entries
            .filter((doc) => doc.depth === 1)
            .map((doc, index) => {
              const firstIndex = index === 0
              const lastIndex = index === lastEntriesIndex
              return (
                <Link
                  key={doc.pathname}
                  href={doc.pathname}
                  className={GeistMono.className}
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.4rem',
                    padding: '0.7rem',
                    backgroundColor: theme.colors['editor.background'],
                    boxShadow: firstIndex
                      ? undefined
                      : `inset 0 1px 0 0 ${theme.colors['panel.border']}70`,
                    borderTopLeftRadius: firstIndex ? '0.5rem' : undefined,
                    borderTopRightRadius: firstIndex ? '0.5rem' : undefined,
                    borderBottomLeftRadius: lastIndex ? '0.5rem' : undefined,
                    borderBottomRightRadius: lastIndex ? '0.5rem' : undefined,
                    color: 'white',
                  }}
                >
                  {basename(doc.mdxPath!)}
                </Link>
              )
            })}
        </div>
      </Card>

      <Card title="data.ts" column="32 / span 22" row="2 / 7">
        <CodeBlock
          value={`import { createSource } from 'mdxts'\n\nexport const allDocs = createSource('docs/*.mdx')`}
          filename="data.ts"
          {...codeProps}
        />
      </Card>

      <Card title="Sidebar.tsx" column="4 / span 24" row="14 / span 23">
        <CodeBlock
          value={sidebarSource}
          filename="Sidebar.tsx"
          {...codeProps}
        />
      </Card>

      <Card title="docs/[id]/page.tsx" column="34 / span 24" row="14 / span 8">
        <CodeBlock
          value={docsPageSource}
          filename="docs/[id]/page.tsx"
          {...codeProps}
        />
      </Card>

      <div
        style={{
          gridColumn: '20 / span 36',
          gridRow: '6 / 11',
          border: `1px solid ${LINE_COLOR}`,
          borderLeft: 'none',
          borderTopRightRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
        }}
      />
      <div
        style={{
          gridColumn: '32 / span 2',
          gridRow: '11 / span 5',
          border: `1px solid ${LINE_COLOR}`,
          borderRight: 'none',
          translate: '0 -1px',
          borderBottomLeftRadius: '0.5rem',
        }}
      />
      <div
        style={{
          gridColumn: '2 / span 18',
          gridRow: '11 / span 7',
          border: `1px solid ${LINE_COLOR}`,
          borderRight: 'none',
          translate: '0 -1px',
          borderBottomLeftRadius: '0.5rem',
        }}
      />
      <VerticalLine
        row="1 / 3"
        column="22"
        style={{
          height: '48rem',
          translate: '0 -90%',
        }}
      />
      <HorizontalLine
        row="11"
        column="2 / 20"
        style={{
          width: '60rem',
          translate: '-100% -1px',
        }}
      />
      <VerticalLine row="20 / span 32" column="45" />
    </div>
  )
}

function Card({
  title,
  column,
  row,
  children,
}: {
  title: string
  column: string
  row: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        gridColumn: column,
        gridRow: row,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <h2
        style={{
          alignSelf: 'start',
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: '1rem',
          padding: '0.1rem 0.25rem',
          backgroundColor: theme.colors['button.background'],
          color: theme.colors['button.foreground'],
          borderRadius: '0.25rem',
          translate: '0 -50%',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function HorizontalLine({
  row,
  column,
  align,
  style,
}: {
  row: string
  column: string
  align?: 'start' | 'center' | 'end'
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        alignSelf: align,
        gridColumn: column,
        gridRow: row,
        height: 1,
        backgroundColor: LINE_COLOR,
        ...style,
      }}
    />
  )
}

function VerticalLine({
  row,
  column,
  align,
  style,
}: {
  row: string
  column: string
  align?: 'start' | 'center' | 'end'
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        justifySelf: align,
        gridColumn: column,
        gridRow: row,
        width: 1,
        backgroundColor: LINE_COLOR,
        ...style,
      }}
    />
  )
}
