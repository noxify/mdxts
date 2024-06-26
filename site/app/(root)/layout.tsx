import { Sidebar } from 'components/Sidebar'
import { SiteLayout } from 'components/SiteLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout sidebar={<Sidebar />}>{children}</SiteLayout>
}
