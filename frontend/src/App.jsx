import { BrowserRouter, Route, Routes } from 'react-router'
import { AboutPage, ContactPage, GalleryPage, HomePage, NotFoundPage, ProjectDetailPage } from './Page/index.jsx'
import { AdminDashboardPage, AdminLoginPage } from './Page/AdminPages.jsx'
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext.jsx'

function RoutedApp() {
  const { connectionError } = useSiteContent()

  return (
    <>
      {connectionError && (
        <div className="api-notice" role="status">
          Content service unavailable. Showing saved defaults; admin changes need the backend online.
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery/:projectSlug" element={<ProjectDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <SiteContentProvider>
      <BrowserRouter>
        <RoutedApp />
      </BrowserRouter>
    </SiteContentProvider>
  )
}

export default App
