import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getPublicContent } from '../services/api.js'
import { defaultPages, defaultProjects } from '../data/defaultContent.js'

const SiteContentContext = createContext(null)

export function SiteContentProvider({ children }) {
  const [pages, setPages] = useState(defaultPages)
  const [projects, setProjects] = useState(defaultProjects)
  const [connectionError, setConnectionError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const content = await getPublicContent()
      setPages({ ...defaultPages, ...content.pages })
      setProjects(content.projects)
      setConnectionError('')
    } catch (error) {
      setConnectionError(error.message)
      throw error
    }
  }, [])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const value = useMemo(
    () => ({ pages, projects, connectionError, refresh }),
    [pages, projects, connectionError, refresh],
  )

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const context = useContext(SiteContentContext)
  if (!context) throw new Error('useSiteContent must be used inside SiteContentProvider.')
  return context
}
