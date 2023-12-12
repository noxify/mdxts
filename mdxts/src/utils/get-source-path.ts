import { findRootSync } from '@manypkg/find-root'
import { getEditorPath } from './get-editor-path'
import { getGitFileUrl } from './get-git-file-url'

let rootDirectory = null

/**
 * Returns a constructed source path for the local IDE in development or a git link in production.
 */
export function getSourcePath(path: string, line?: number, column?: number) {
  if (process.env.NODE_ENV === 'development') {
    return getEditorPath({ path, line, column })
  }
  if (rootDirectory === null) {
    rootDirectory = findRootSync(process.cwd()).rootDir
  }
  return getGitFileUrl(path.replace(`${rootDirectory}/`, ''), line, column)
}
