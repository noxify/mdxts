import { Navigation } from 'mdxts/components'
import { allDocs, allComponents } from 'data'
import { Text } from 'components/Text'
import { Logo } from 'components/Logo'
import { SidebarLink } from './SidebarLink'

export function Sidebar() {
  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '6rem 2rem 2rem',
        gap: '2.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <a href="/" style={{ display: 'block' }}>
          <h1 style={{ lineHeight: 0 }}>
            <Logo />
          </h1>
        </a>

        <a
          href="https://github.com/souporserious/mdxts/"
          style={{ display: 'block', height: 20 }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="#fff">
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
        </a>
      </div>

      <Navigation
        source={allDocs}
        renderList={(props) => (
          <ul
            style={{
              paddingLeft: props.order * 0.8 + 'rem',
              listStyle: 'none',
            }}
          >
            {props.children}
          </ul>
        )}
        renderItem={(props) => (
          <li
            key={props.title}
            style={{ color: props.children ? 'grey' : 'white' }}
          >
            {props.children ? (
              <div style={{ padding: '0.25rem 0', cursor: 'default' }}>
                <Text>{props.title}</Text>
              </div>
            ) : (
              <SidebarLink pathname={props.pathname} name={props.title} />
            )}
            {props.children}
          </li>
        )}
      />

      <Navigation
        source={allComponents}
        renderList={(props) => (
          <ul
            style={{
              paddingLeft: props.order * 0.8 + 'rem',
              listStyle: 'none',
            }}
          >
            {props.children}
          </ul>
        )}
        renderItem={(props) => (
          <li
            key={props.title}
            style={{ color: props.children ? 'grey' : 'white' }}
          >
            {props.children ? (
              <div style={{ padding: '0.25rem 0', cursor: 'default' }}>
                <Text>{props.title}</Text>
              </div>
            ) : (
              <SidebarLink pathname={props.pathname} name={props.title} />
            )}
            {props.children}
          </li>
        )}
      />
    </aside>
  )
}
