import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  deleteProject,
  getAdminContent,
  loginAdmin,
  savePage,
  saveProject,
  uploadImages,
  assetUrl,
} from '../services/api.js'
import { useSiteContent } from '../context/SiteContentContext.jsx'
import './AdminPages.css'

const emptyProject = {
  name: '',
  slug: '',
  type: 'Residential',
  location: '',
  category: 'Living',
  image: '',
  description: '',
  overview: '',
  designFocus: '',
  area: '',
  year: new Date().getFullYear().toString(),
  highlights: [],
  gallery: [],
}

const pages = [
  ['home', 'Home'],
  ['gallery', 'Gallery'],
  ['about', 'About'],
  ['contact', 'Contact'],
]

function useFilePreview(file) {
  const preview = useMemo(() => file ? URL.createObjectURL(file) : '', [file])

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  return preview
}

function AdminBrand() {
  return (
    <Link className="admin-brand" to="/">
      <span className="admin-brand-mark">L</span>
      <span><strong>LUMIÈRE</strong><small>STUDIO ADMIN</small></span>
    </Link>
  )
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('adminToken')) navigate('/admin', { replace: true })
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const session = await loginAdmin(email, password)
      sessionStorage.setItem('adminToken', session.token)
      sessionStorage.setItem('adminEmail', session.email)
      navigate('/admin', { replace: true })
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <AdminBrand />
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Studio sign in</h1>
        <p className="admin-login-intro">Sign in to update your projects and website content.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>Email address
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="admin-message admin-error" role="alert">{error}</p>}
          <button className="button button-dark" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'} <span>→</span>
          </button>
        </form>
        <Link className="admin-back-link" to="/">← Back to website</Link>
      </section>
    </main>
  )
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { refresh: refreshPublicContent } = useSiteContent()
  const token = sessionStorage.getItem('adminToken')
  const [content, setContent] = useState(null)
  const [activeTab, setActiveTab] = useState('projects')
  const [selectedPage, setSelectedPage] = useState('home')
  const [pageForm, setPageForm] = useState(null)
  const [pageImageFile, setPageImageFile] = useState(null)
  const [pageBodyImageFile, setPageBodyImageFile] = useState(null)
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [projectImageFile, setProjectImageFile] = useState(null)
  const [galleryImageFiles, setGalleryImageFiles] = useState([])
  const [editingId, setEditingId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const pageImagePreview = useFilePreview(pageImageFile)
  const pageBodyImagePreview = useFilePreview(pageBodyImageFile)
  const projectImagePreview = useFilePreview(projectImageFile)

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    getAdminContent(token)
      .then(setContent)
      .catch((loadError) => {
        setError(loadError.message)
        if (loadError.status === 401) {
          sessionStorage.removeItem('adminToken')
          sessionStorage.removeItem('adminEmail')
          navigate('/admin/login', { replace: true })
        }
      })
  }, [token, navigate])

  useEffect(() => {
    if (content?.pages?.[selectedPage]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageForm(content.pages[selectedPage])
      setPageImageFile(null)
      setPageBodyImageFile(null)
    }
  }, [content, selectedPage])

  async function reloadContent() {
    const updated = await getAdminContent(token)
    setContent(updated)
  }

  function signOut() {
    sessionStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminEmail')
    navigate('/admin/login', { replace: true })
  }

  async function submitPage(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const updatedPage = { ...pageForm }
      const files = [pageImageFile, pageBodyImageFile].filter(Boolean)
      if (files.length) {
        const uploaded = await uploadImages(token, files)
        let nextIndex = 0
        if (pageImageFile) updatedPage.image = uploaded[nextIndex++].url
        if (pageBodyImageFile) updatedPage.bodyImage = uploaded[nextIndex].url
      }
      await savePage(token, selectedPage, updatedPage)
      await reloadContent()
      await refreshPublicContent()
      setMessage(`${pages.find(([id]) => id === selectedPage)?.[1]} page updated.`)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  function startNewProject() {
    setEditingId('')
    setProjectForm(emptyProject)
    setProjectImageFile(null)
    setGalleryImageFiles([])
    setMessage('')
    setError('')
  }

  function editProject(project) {
    setActiveTab('projects')
    setEditingId(project.id)
    setProjectForm({ ...project })
    setProjectImageFile(null)
    setGalleryImageFiles([])
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateProjectField(field, value) {
    setProjectForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'name' && !editingId
        ? { slug: value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
        : {}),
    }))
  }

  async function submitProject(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      let image = projectForm.image
      let gallery = projectForm.gallery
      const files = [projectImageFile, ...galleryImageFiles].filter(Boolean)

      if (files.length) {
        const uploaded = await uploadImages(token, files)
        let nextIndex = 0
        if (projectImageFile) image = uploaded[nextIndex++].url
        if (galleryImageFiles.length) {
          gallery = [...gallery, ...uploaded.slice(nextIndex).map((file) => file.url)]
        }
      }

      await saveProject(token, {
        ...projectForm,
        image,
        gallery,
        highlights: Array.isArray(projectForm.highlights)
          ? projectForm.highlights
          : projectForm.highlights.split(',').map((item) => item.trim()).filter(Boolean),
      }, editingId)
      await reloadContent()
      await refreshPublicContent()
      const confirmation = editingId ? 'Project updated.' : 'Project created.'
      startNewProject()
      setMessage(confirmation)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  async function removeProject(project) {
    if (!window.confirm(`Delete "${project.name}" from the portfolio?`)) return
    setError('')
    setMessage('')
    try {
      await deleteProject(token, project.id)
      await reloadContent()
      await refreshPublicContent()
      if (editingId === project.id) startNewProject()
      setMessage('Project deleted.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  if (!token) return null

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <AdminBrand />
        <div className="admin-top-actions">
          <Link to="/">View website ↗</Link>
          <span>{sessionStorage.getItem('adminEmail')}</span>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="eyebrow">CONTENT MANAGER</p>
          <h1>Your website,<br />your way.</h1>
          <p>Update your project portfolio and the words and imagery visitors see on each page.</p>
          <button className={activeTab === 'projects' ? 'admin-side-link selected' : 'admin-side-link'} type="button" onClick={() => setActiveTab('projects')}>
            <span>01</span> Our projects
          </button>
          <button className={activeTab === 'pages' ? 'admin-side-link selected' : 'admin-side-link'} type="button" onClick={() => setActiveTab('pages')}>
            <span>02</span> Page content
          </button>
          <div className="admin-storage-note">Changes are saved to the website content service.</div>
        </aside>
        <section className="admin-workspace">
          <div className="admin-page-heading">
            <div>
              <p className="eyebrow">{activeTab === 'projects' ? 'PORTFOLIO' : 'WEBSITE COPY & IMAGERY'}</p>
              <h2>{activeTab === 'projects' ? 'Our projects' : 'Page content'}</h2>
            </div>
            {activeTab === 'projects' && (
              <button className="button button-dark" type="button" onClick={startNewProject}>+ New project</button>
            )}
          </div>

          {error && <p className="admin-message admin-error" role="alert">{error}</p>}
          {message && <p className="admin-message admin-success" role="status">{message}</p>}
          {!content ? (
            <div className="admin-loading">{error ? 'Your saved content could not be loaded. Sign in again or check that the backend is running.' : 'Loading your saved content…'}</div>
          ) : activeTab === 'pages' ? (
            <form className="admin-panel admin-form" onSubmit={submitPage}>
              <label>Choose a page
                <select value={selectedPage} onChange={(event) => setSelectedPage(event.target.value)}>
                  {pages.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
                </select>
              </label>
              {pageForm && (
                <>
                  <label>Small heading<input value={pageForm.eyebrow || ''} onChange={(event) => setPageForm({ ...pageForm, eyebrow: event.target.value })} required /></label>
                  <label>Page title<input value={pageForm.title || ''} onChange={(event) => setPageForm({ ...pageForm, title: event.target.value })} required /></label>
                  <label>Intro text<textarea rows="4" value={pageForm.description || ''} onChange={(event) => setPageForm({ ...pageForm, description: event.target.value })} required /></label>
                  <label>Replace hero image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setPageImageFile(event.target.files?.[0] || null)} /></label>
                  <p className="admin-help">Images up to 5 MB. JPG, PNG, GIF, or WebP.</p>
                  {(pageImageFile || pageForm.image) && (
                    <img className="admin-image-preview" src={pageImagePreview || assetUrl(pageForm.image)} alt="Page hero preview" />
                  )}
                  {selectedPage === 'home' || selectedPage === 'gallery' ? (
                    <>
                      <label>Section heading<input value={pageForm.sectionEyebrow || ''} onChange={(event) => setPageForm({ ...pageForm, sectionEyebrow: event.target.value })} /></label>
                      <label>Section title<input value={pageForm.sectionTitle || ''} onChange={(event) => setPageForm({ ...pageForm, sectionTitle: event.target.value })} /></label>
                      <label>Section description<textarea rows="3" value={pageForm.sectionDescription || ''} onChange={(event) => setPageForm({ ...pageForm, sectionDescription: event.target.value })} /></label>
                    </>
                  ) : null}
                  {selectedPage === 'about' ? (
                    <>
                      <label>About story heading<input value={pageForm.bodyTitle || ''} onChange={(event) => setPageForm({ ...pageForm, bodyTitle: event.target.value })} /></label>
                      <label>About story<textarea rows="4" value={pageForm.bodyText || ''} onChange={(event) => setPageForm({ ...pageForm, bodyText: event.target.value })} /></label>
                      <label>About story continuation<textarea rows="4" value={pageForm.bodyText2 || ''} onChange={(event) => setPageForm({ ...pageForm, bodyText2: event.target.value })} /></label>
                      <label>Replace about story image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setPageBodyImageFile(event.target.files?.[0] || null)} /></label>
                      {(pageBodyImageFile || pageForm.bodyImage) && (
                        <img className="admin-image-preview" src={pageBodyImagePreview || assetUrl(pageForm.bodyImage)} alt="About story preview" />
                      )}
                    </>
                  ) : null}
                  {selectedPage === 'contact' ? (
                    <>
                      <label>Contact email<input type="email" value={pageForm.contactEmail || ''} onChange={(event) => setPageForm({ ...pageForm, contactEmail: event.target.value })} /></label>
                      <label>Studio location<input value={pageForm.contactLocation || ''} onChange={(event) => setPageForm({ ...pageForm, contactLocation: event.target.value })} /></label>
                      <label>Studio hours<input value={pageForm.contactHours || ''} onChange={(event) => setPageForm({ ...pageForm, contactHours: event.target.value })} /></label>
                    </>
                  ) : null}
                  <button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save page changes'}</button>
                </>
              )}
            </form>
          ) : (
            <>
              <form className="admin-panel admin-form" onSubmit={submitProject}>
                <div className="admin-form-heading">
                  <div>
                    <p className="eyebrow">{editingId ? 'EDIT PROJECT' : 'ADD TO YOUR PORTFOLIO'}</p>
                    <h3>{editingId ? 'Update project details' : 'Create a project'}</h3>
                  </div>
                  {editingId && <button className="admin-text-button" type="button" onClick={startNewProject}>Cancel edit</button>}
                </div>
                <div className="admin-fields-grid">
                  <label>Project name<input value={projectForm.name} onChange={(event) => updateProjectField('name', event.target.value)} required /></label>
                  <label>Project URL<input value={projectForm.slug} onChange={(event) => updateProjectField('slug', event.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label>
                  <label>Project type<select value={projectForm.type} onChange={(event) => updateProjectField('type', event.target.value)}><option>Residential</option><option>Commercial</option></select></label>
                  <label>Category<input value={projectForm.category} onChange={(event) => updateProjectField('category', event.target.value)} required /></label>
                  <label>Location<input value={projectForm.location} onChange={(event) => updateProjectField('location', event.target.value)} required /></label>
                  <label>Area<input value={projectForm.area} onChange={(event) => updateProjectField('area', event.target.value)} required /></label>
                  <label>Year completed<input value={projectForm.year} onChange={(event) => updateProjectField('year', event.target.value)} required /></label>
                  <label>Design direction<input value={projectForm.designFocus} onChange={(event) => updateProjectField('designFocus', event.target.value)} required /></label>
                </div>
                <label>Short description<textarea rows="2" value={projectForm.description} onChange={(event) => updateProjectField('description', event.target.value)} required /></label>
                <label>Project story<textarea rows="4" value={projectForm.overview} onChange={(event) => updateProjectField('overview', event.target.value)} required /></label>
                <label>Highlights <span className="admin-label-note">Separate each highlight with a comma</span><input value={Array.isArray(projectForm.highlights) ? projectForm.highlights.join(', ') : projectForm.highlights} onChange={(event) => updateProjectField('highlights', event.target.value)} required /></label>
                <div className="admin-fields-grid">
                  <label>Cover image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setProjectImageFile(event.target.files?.[0] || null)} required={!editingId && !projectForm.image} /></label>
                  <label>Additional gallery images<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setGalleryImageFiles(Array.from(event.target.files || []))} /></label>
                </div>
                <p className="admin-help">Images up to 5 MB each. JPG, PNG, GIF, or WebP.</p>
                {(projectImageFile || projectForm.image) && (
                  <img className="admin-image-preview admin-project-preview" src={projectImagePreview || assetUrl(projectForm.image)} alt="Project cover preview" />
                )}
                <button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save project' : 'Create project'}</button>
              </form>

              <section className="admin-project-list">
                <div className="admin-list-heading"><h3>Published projects</h3><span>{content.projects.length} total</span></div>
                {content.projects.map((project) => (
                  <article className="admin-project-row" key={project.id}>
                    <img src={assetUrl(project.image)} alt="" />
                    <div className="admin-project-row-copy"><strong>{project.name}</strong><span>{project.category} · {project.location}</span></div>
                    <button className="admin-text-button" type="button" onClick={() => editProject(project)}>Edit</button>
                    <button className="admin-delete-button" type="button" onClick={() => removeProject(project)} aria-label={`Delete ${project.name}`}>Delete</button>
                  </article>
                ))}
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
