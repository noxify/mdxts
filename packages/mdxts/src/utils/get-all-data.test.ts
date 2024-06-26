import { Project, InMemoryFileSystemHost } from 'ts-morph'
import { getAllData } from './get-all-data'

const workingDirectory = '/Users/username/Code/mdxts'
const mockModule = () => Promise.resolve({ default: () => {} })

jest.mock('./get-git-metadata', () => ({
  getGitMetadata: jest.fn().mockReturnValue({
    authors: [],
    createdAt: undefined,
    updatedAt: undefined,
  }),
}))

describe('getAllData', () => {
  beforeAll(() => {
    process.env.MDXTS_GIT_SOURCE = 'https://github.com/souporserious/mdxts'
    process.env.MDXTS_GIT_BRANCH = 'main'
    process.env.MDXTS_SITE_URL = 'https://mdxts.dev'
  })

  beforeEach(() => {
    jest.spyOn(process, 'cwd').mockReturnValue(workingDirectory)
    jest.resetModules()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize correctly with basic input', () => {
    const project = new Project({ useInMemoryFileSystem: true })

    project.createSourceFile(
      'components/Button.tsx',
      `/** Used for any type of user action, including navigation. */\nexport function Button() {}`
    )

    project.createSourceFile(
      'components/Button.mdx',
      `# Button\n\nButtons allow for users to take actions in your application.`
    )

    const allData = getAllData({
      project,
      allModules: {
        '/components/Button.mdx': () => Promise.resolve({ default: () => {} }),
      },
      globPattern: 'components/*.(ts|tsx)',
      baseDirectory: 'components',
    })

    expect(allData).toMatchSnapshot()
  })

  it('orders based on files and directories', () => {
    const project = new Project({ useInMemoryFileSystem: true })

    project.createSourceFile(
      'package/components/Button.tsx',
      `export function Button() {}`
    )

    project.createSourceFile(
      'package/components/Card.tsx',
      `export function Card() {}`
    )

    project.createSourceFile(
      'package/hooks/usePressable.ts',
      `export function usePressable() {}`
    )

    project.createSourceFile(
      'package/hooks/useFocus.ts',
      `export function useFocus() {}`
    )

    const allData = getAllData({
      project,
      allModules: {
        '/package/components/Button.tsx': mockModule,
        '/package/components/Card.tsx': mockModule,
        '/package/hooks/usePressable.ts': mockModule,
        '/package/hooks/useFocus.ts': mockModule,
      },
      globPattern: 'package/**/*.(ts|tsx)',
      baseDirectory: 'package',
    })

    expect(allData['/components/button'].order).toBe('01.01')
    expect(allData['/components/card'].order).toBe('01.02')
    expect(allData['/hooks/use-focus'].order).toBe('02.01')
    expect(allData['/hooks/use-pressable'].order).toBe('02.02')
  })

  it('parses order from file path', () => {
    const allData = getDocsData()

    expect(allData['/docs/getting-started'].order).toBe('01')
    expect(allData['/docs/routing'].order).toBe('02')
    expect(allData['/docs/examples/authoring'].order).toBe('03.01')
    expect(allData['/docs/examples/rendering'].order).toBe('03.02')
  })

  it('adds previous and next pathnames', () => {
    const allData = getDocsData()

    expect(allData['/docs/getting-started'].previous).toBeUndefined()
    expect(allData['/docs/getting-started'].next?.pathname).toBe(
      '/docs/routing'
    )
    expect(allData['/docs/routing'].previous?.pathname).toBe(
      '/docs/getting-started'
    )
    expect(allData['/docs/routing'].next?.pathname).toBe(
      '/docs/examples/authoring'
    )
    expect(allData['/docs/examples/authoring'].previous?.pathname).toBe(
      '/docs/routing'
    )
    expect(allData['/docs/examples/authoring'].next?.pathname).toBe(
      '/docs/examples/rendering'
    )
    expect(allData['/docs/examples/rendering'].previous?.pathname).toBe(
      '/docs/examples/authoring'
    )
    expect(allData['/docs/examples/rendering'].next).toBeUndefined()
  })

  it('includes only public files based on package.json exports', (done) => {
    jest.isolateModules(() => {
      jest.mock('read-pkg-up', () => ({
        sync: () => ({
          packageJson: {
            name: 'mdxts',
            exports: {
              './components': {
                types: './dist/components/index.d.ts',
                import: './dist/components/index.js',
                require: './dist/cjs/components/index.js',
              },
            },
          },
          path: `${workingDirectory}/package.json`,
        }),
      }))

      import('./get-all-data').then(({ getAllData }) => {
        const fileSystem = new InMemoryFileSystemHost()
        const files = [
          {
            path: 'components/Button.tsx',
            content: `export const Button = () => {};`,
          },
          {
            path: 'components/Button.examples.tsx',
            content: `import { Button } from './Button';\nexport const Basic = () => {};`,
          },
          {
            path: 'components/Card.tsx',
            content: `export const Card = () => {};`,
          },
          {
            path: 'components/PrivateComponent.tsx',
            content: `export const PrivateComponent = () => {};`,
          },
          {
            path: 'components/index.ts',
            content: `export { Button } from './Button'; export { Card } from './Card';`,
          },
          {
            path: 'hooks/usePressable.ts',
            content: `export const usePressable = () => {};`,
          },
          {
            path: 'hooks/useFocus.ts',
            content: `export const useFocus = () => {};`,
          },
          {
            path: 'hooks/index.ts',
            content: `export * from './usePressable';\nexport * from './useFocus';`,
          },
        ]

        files.forEach((file) => {
          fileSystem.writeFileSync(
            `${workingDirectory}/src/${file.path}`,
            file.content
          )
        })

        const project = new Project({ fileSystem })

        const allData = getAllData({
          project,
          allModules: {
            [`${workingDirectory}/src/components/Button.examples.tsx`]:
              mockModule,
          },
          globPattern: `${workingDirectory}/src/**/*.{ts,tsx}`,
          baseDirectory: 'src',
        })

        expect(allData['/components/button']).toBeDefined()
        expect(allData['/components/card']).toBeDefined()
        expect(allData['/components/private-component']).toBeUndefined()

        done()
      })
    })
  })

  it('includes files when no index file is present', () => {
    const fileSystem = new InMemoryFileSystemHost()
    const files = [
      {
        path: 'components/Button.tsx',
        content: `/** Used for any type of user action, including navigation. */\nexport function Button() {}`,
      },
      {
        path: 'components/Button.examples.tsx',
        content: `import { Button } from './Button';\nexport const Basic = () => {};`,
      },
    ]

    files.forEach((file) => {
      fileSystem.writeFileSync(
        `${workingDirectory}/src/${file.path}`,
        file.content
      )
    })

    const project = new Project({ fileSystem })

    const allData = getAllData({
      project,
      allModules: {
        [`${workingDirectory}/src/components/Button.examples.tsx`]: mockModule,
      },
      globPattern: '*.tsx',
      baseDirectory: 'src',
    })

    expect(allData['/components/button']).toBeDefined()
  })

  it('includes only public declarations based on index file exports', () => {
    const fileSystem = new InMemoryFileSystemHost()
    const files = [
      {
        path: 'components/Button.tsx',
        content: `export const Button = () => {};\n\nexport const PrivateComponent = () => {};`,
      },
      {
        path: 'components/index.ts',
        content: `export { Button } from './Button';`,
      },
    ]

    files.forEach((file) => {
      fileSystem.writeFileSync(
        `${workingDirectory}/src/${file.path}`,
        file.content
      )
    })

    const project = new Project({ fileSystem })

    const allData = getAllData({
      project,
      allModules: {},
      globPattern: `${workingDirectory}/src/**/*.{ts,tsx}`,
      baseDirectory: `src`,
    })
    const exportedTypes = allData['/components/button'].exportedTypes

    expect(
      exportedTypes.find((type) => type.name === 'PrivateComponent')
    ).toBeUndefined()
  })

  it('uses custom sort function if provided', () => {
    const fileSystem = new InMemoryFileSystemHost()
    const files = [
      {
        path: 'blog/codemods.mdx',
        content: `---\ndate: 2021-10-31\n---\n\n# Codemods`,
      },
      {
        path: 'blog/design-systems.mdx',
        content: `---\ndate: 2019-01-01\n---\n\n# Design Systems`,
      },
      {
        path: 'blog/hello-world.mdx',
        content: `---\ndate: 2021-04-20\n---\n\n# Hello World`,
      },
    ]

    files.forEach((file) => {
      fileSystem.writeFileSync(
        `${workingDirectory}/src/${file.path}`,
        file.content
      )
    })

    const allData = getAllData<{
      frontMatter: { date: Date }
    }>({
      project: new Project({ fileSystem }),
      allModules: {
        [`${workingDirectory}/src/blog/codemods.mdx`]: mockModule,
        [`${workingDirectory}/src/blog/design-systems.mdx`]: mockModule,
        [`${workingDirectory}/src/blog/hello-world.mdx`]: mockModule,
      },
      globPattern: `${workingDirectory}/src/blog/*.mdx`,
      baseDirectory: `src`,
      sort: (a, b) => {
        return a.frontMatter.date.getTime() - b.frontMatter.date.getTime()
      },
    })
    const dataPaths = Object.values(allData).map((data) => data.pathname)

    expect(dataPaths[0]).toBe('/blog/design-systems')
    expect(dataPaths[1]).toBe('/blog/hello-world')
    expect(dataPaths[2]).toBe('/blog/codemods')
  })
})

function getDocsData() {
  const project = new Project({ useInMemoryFileSystem: true })

  project.createSourceFile(
    'docs/01.getting-started.mdx',
    `# Getting Started\n\nStart here.`
  )

  project.createSourceFile(
    'docs/02.routing.mdx',
    `# Routing\n\nHelpers for routing.`
  )

  project.createSourceFile(
    'docs/03.examples/01.authoring.mdx',
    `# Authoring\n\nExamples can be written alongside source code.`
  )

  project.createSourceFile(
    'docs/03.examples/02.rendering.mdx',
    `# Rendering\n\nExamples can be rendered in the documentation using a bundler.`
  )

  return getAllData({
    project,
    allModules: {
      '/docs/01.getting-started.mdx': () =>
        Promise.resolve({ default: () => {} }),
      '/docs/02.routing.mdx': () => Promise.resolve({ default: () => {} }),
      '/docs/03.examples/01.authoring.mdx': () =>
        Promise.resolve({ default: () => {} }),
      '/docs/03.examples/02.rendering.mdx': () =>
        Promise.resolve({ default: () => {} }),
    },
    globPattern: '**/*.mdx',
  })
}
