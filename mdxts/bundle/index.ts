import esbuild from 'esbuild'
import type { AsyncReturnType } from 'type-fest'
import type { FileData } from '../rehype'
import { rehypePlugin, getHighlighter } from '../rehype'
import { transformCode } from '../utils/transform-code'

let highlighter: AsyncReturnType<typeof getHighlighter>

/** Bundle a set of MDX files into a single JavaScript file. */
export async function bundle({
  entryPoints,
  workingDirectory,
  theme,
  external = [],
}: {
  /** An array of files that each serve as an input to the bundling algorithm. */
  entryPoints: string[]

  /** The working directory used for the build, defaulting to the current working directory. */
  workingDirectory?: string

  /** The name of the theme to use for syntax highlighting. */
  theme?: string

  /** An array of modules to exclude from the bundle. */
  external?: string[]
}) {
  /** Only load the shiki highlighter once. */
  if (highlighter === undefined) {
    highlighter = await getHighlighter({ theme })
  }

  const allFileData: FileData[] = []
  const mdxPlugin = (await import('@mdx-js/esbuild')).default
  const result = await esbuild.build({
    entryPoints: entryPoints,
    absWorkingDir: workingDirectory,
    target: 'esnext',
    format: 'cjs',
    jsxDev: process.env.NODE_ENV === 'development',
    jsx: 'automatic',
    outdir: 'dist',
    bundle: true,
    minify: true,
    write: false,
    plugins: [
      mdxPlugin({
        rehypePlugins: [
          [
            rehypePlugin,
            {
              highlighter,
              onFileData: (fileData: FileData) => {
                allFileData.push(fileData)
              },
            },
          ],
        ],
      }),
    ],
    external: ['react', 'react-dom', ...external],
  })
  /* Transpile JSX using SWC. For some reason this isn't working with Esbuild. */
  const transformedOutputFiles = await Promise.all(
    result.outputFiles.map((outputFile) => transformCode(outputFile.text))
  )

  return entryPoints.map((filePath, index) => {
    const findData = (fileData) => fileData.path === filePath
    const fileData = allFileData.find(findData) || {}

    return {
      code: transformedOutputFiles[index],
      ...fileData,
    } as {
      code: string
    } & FileData
  })
}