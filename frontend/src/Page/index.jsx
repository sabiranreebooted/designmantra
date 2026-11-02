import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { assetUrl } from '../services/api.js'
import { useSiteContent } from '../context/SiteContentContext.jsx'

const imageUrl = (url, width = 900) => {
  if (/^photo-[\w-]+$/.test(url || '')) {
    return `https://images.unsplash.com/${url}?auto=format&fit=crop&w=${width}&q=85`
  }
  return assetUrl(url)
}

function Brand({ light = false }) {
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label="Lumière Interior Design home">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <path d="M5 19 21 5l16 14M10 17v19h22V17M17 36V24h8v12" />
      </svg>
      <span className="brand-copy">
        <strong>LUMIÈRE</strong>
        <small>INTERIOR DESIGN</small>
      </span>
    </Link>
  )
}

function Header({ active }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    ['Home', '/'],
    ['Gallery', '/gallery'],
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Admin', '/admin/login'],
  ]

  return (
    <header className="site-header">
      <Brand />
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>
      <nav className={`main-nav${menuOpen ? ' nav-open' : ''}`} aria-label="Main navigation">
        {links.map(([label, href]) => (
          <Link
            key={label}
            className={active === label ? 'nav-active' : ''}
            to={href}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link className="button button-dark nav-cta" to="/contact">Get in Touch</Link>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Brand />
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin/login">Admin</Link>
        </nav>
        <div className="social-links" aria-label="Social media">
          <a href="https://instagram.com" aria-label="Instagram">ig</a>
          <a href="https://facebook.com" aria-label="Facebook">f</a>
          <a href="https://pinterest.com" aria-label="Pinterest">p</a>
        </div>
      </div>
      <p className="copyright">© 2026 Lumière Interior Design. All rights reserved.</p>
    </footer>
  )
}

function ProjectCard({ project }) {
  return (
    <Link className="project-card" to={`/gallery/${project.slug}`}>
      <div className="project-image">
        <img src={imageUrl(project.image, 900)} alt={project.name} loading="lazy" />
        <span className="project-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="project-meta">
        <div>
          <h3>{project.name}</h3>
          <p>{project.type}<span>·</span>{project.location}</p>
        </div>
        <span className="meta-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}

function SectionHeading({ eyebrow, title, copy, link }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {copy && <p className="section-copy">{copy}</p>}
      </div>
      {link && <Link className="text-link" to={link.href}>{link.label}<span>→</span></Link>}
    </div>
  )
}

function Callout() {
  return (
    <section className="callout">
      <div>
        <h2>Let’s Create Something Beautiful</h2>
        <p>Have a project in mind? We’d love to hear from you.</p>
      </div>
      <Link className="button button-dark" to="/contact">Contact Us <span>→</span></Link>
    </section>
  )
}

export function HomePage() {
  const { pages, projects } = useSiteContent()
  const page = pages.home

  return (
    <>
      <Header active="Home" />
      <main>
        <section className="home-hero">
          <img
            className="hero-image"
            src={imageUrl(page.image)}
            alt="Interior design project"
          />
          <div className="hero-content">
            <p className="eyebrow eyebrow-light">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            <Link className="button button-outline" to="/gallery">View Our Work <span>→</span></Link>
          </div>
          <span className="hero-index">01 <i /> 03</span>
        </section>
        <section className="featured section-wrap">
          <SectionHeading
            eyebrow={page.sectionEyebrow}
            title={page.sectionTitle}
            copy={page.sectionDescription}
            link={{ label: 'View All Projects', href: '/gallery' }}
          />
          <div className="project-grid">
            {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </section>
        <Callout />
      </main>
      <Footer />
    </>
  )
}

function PageIntro({ eyebrow, title, copy, image }) {
  return (
    <section className="page-intro">
      {image && <img src={imageUrl(image, 1800)} alt="" />}
      <div className="page-intro-copy">
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  )
}

export function GalleryPage() {
  const { pages, projects } = useSiteContent()
  const page = pages.gallery
  const [filter, setFilter] = useState('All projects')
  const categories = ['All projects', ...new Set(projects.map((project) => project.category))]
  const visibleProjects = filter === 'All projects'
    ? projects
    : projects.filter((project) => project.category === filter)

  return (
    <>
      <Header active="Gallery" />
      <main>
        <PageIntro
          eyebrow={page.eyebrow}
          title={page.title}
          copy={page.description}
          image={page.image}
        />
        <section className="gallery-section section-wrap">
          <SectionHeading eyebrow={page.sectionEyebrow} title={page.sectionTitle} copy={page.sectionDescription} />
          <div className="filter-list" aria-label="Filter projects">
            {categories.map((category) => (
              <button
                key={category}
                className={filter === category ? 'filter-active' : ''}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={filter === category}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="project-grid gallery-grid">
            {visibleProjects.map((project) => (
              <article className="gallery-project" key={project.id || project.slug}>
                <ProjectCard project={project} />
                <p className="project-description">{project.description}</p>
              </article>
            ))}
          </div>
        </section>
        <Callout />
      </main>
      <Footer />
    </>
  )
}

export function ProjectDetailPage() {
  const { projectSlug } = useParams()
  const { projects } = useSiteContent()
  const project = projects.find((item) => item.slug === projectSlug)

  if (!project) return <NotFoundPage />

  const otherProjects = projects.filter((item) => item.slug !== project.slug).slice(0, 3)

  return (
    <>
      <Header active="Gallery" />
      <main>
        <section className="project-detail-hero">
          <img
            src={imageUrl(project.image)}
            alt={`${project.name} interior design project`}
          />
          <div className="project-detail-overlay">
            <Link className="project-back-link" to="/gallery">← Back to all projects</Link>
            <p className="eyebrow eyebrow-light">{project.type} · {project.location}</p>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
        </section>
        <section className="project-story section-wrap">
          <div className="project-overview">
            <p className="eyebrow">THE PROJECT</p>
            <h2>A space with its own story.</h2>
            <p>{project.overview}</p>
            <Link className="text-link" to="/contact">Have a similar project? <span>→</span></Link>
          </div>
          <dl className="project-facts">
            <div><dt>LOCATION</dt><dd>{project.location}, Nepal</dd></div>
            <div><dt>PROJECT TYPE</dt><dd>{project.type}</dd></div>
            <div><dt>DESIGN DIRECTION</dt><dd>{project.designFocus}</dd></div>
            <div><dt>AREA</dt><dd>{project.area}</dd></div>
            <div><dt>COMPLETED</dt><dd>{project.year}</dd></div>
          </dl>
        </section>
        <section className="project-gallery section-wrap" aria-label={`${project.name} project images`}>
          {project.gallery.map((image, index) => (
            <img
              key={`${project.slug}-${image}-${index}`}
              className={index === 0 ? 'project-gallery-image project-gallery-feature' : 'project-gallery-image'}
              src={imageUrl(image)}
              alt={`${project.name} interior detail ${index + 1}`}
              loading="lazy"
            />
          ))}
        </section>
        <section className="project-highlights">
          <div className="section-wrap">
            <p className="eyebrow">THE DETAILS</p>
            <h2>Thought through, down to the last detail.</h2>
            <ul>
              {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
          </div>
        </section>
        <section className="related-projects section-wrap">
          <SectionHeading eyebrow="KEEP EXPLORING" title="More of our work" link={{ label: 'View All Projects', href: '/gallery' }} />
          <div className="project-grid">
            {otherProjects.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </section>
        <Callout />
      </main>
      <Footer />
    </>
  )
}

export function AboutPage() {
  const { pages } = useSiteContent()
  const page = pages.about

  return (
    <>
      <Header active="About" />
      <main>
        <PageIntro
          eyebrow={page.eyebrow}
          title={page.title}
          copy={page.description}
          image={page.image}
        />
        <section className="story-section section-wrap">
          <div className="story-image">
            <img src={imageUrl(page.bodyImage || 'photo-1600210492486-724fe5c67fb0', 1200)} alt="A sunlit, thoughtfully designed living room" loading="lazy" />
            <span className="image-caption">A home designed to be lived in.</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">OUR APPROACH</p>
            <h2>{page.bodyTitle}</h2>
            <p>{page.bodyText}</p>
            <p>{page.bodyText2}</p>
            <Link className="text-link" to="/contact">Let’s talk about your space <span>→</span></Link>
          </div>
        </section>
        <section className="values-section">
          <div className="section-wrap">
            <SectionHeading eyebrow="WHAT MATTERS TO US" title="Design with intention." />
            <div className="values-grid">
              <article><span>01</span><h3>Made for living</h3><p>Beautiful rooms should work for real life, not just for the photographs.</p></article>
              <article><span>02</span><h3>Thoughtfully simple</h3><p>We edit carefully, choose materials with purpose, and let good details shine.</p></article>
              <article><span>03</span><h3>Always personal</h3><p>Your routines, your stories, your sense of home lead every design decision.</p></article>
            </div>
          </div>
        </section>
        <Callout />
      </main>
      <Footer />
    </>
  )
}

export function ContactPage() {
  const { pages } = useSiteContent()
  const page = pages.contact
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Header active="Contact" />
      <main>
        <PageIntro
          eyebrow={page.eyebrow}
          title={page.title}
          copy={page.description}
          image={page.image}
        />
        <section className="contact-section section-wrap">
          <div className="contact-details">
            <p className="eyebrow">GET IN TOUCH</p>
            <h2>We’re all ears.</h2>
            <p className="contact-lead">Tell us a little about your project and we’ll be in touch soon to talk through the possibilities.</p>
            <div className="contact-detail"><span className="detail-label">EMAIL</span><a href={`mailto:${page.contactEmail}`}>{page.contactEmail}</a></div>
            <div className="contact-detail"><span className="detail-label">STUDIO</span><p>{page.contactLocation}</p></div>
            <div className="contact-detail"><span className="detail-label">HOURS</span><p>{page.contactHours}</p></div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="form-success" role="status">
                <span>THANK YOU</span>
                <h3>Your note is on its way.</h3>
                <p>We appreciate you reaching out and look forward to learning about your project.</p>
                <button className="text-link" type="button" onClick={() => setSubmitted(false)}>Send another message <span>→</span></button>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <label>Your name<input name="name" type="text" placeholder="Jane Smith" autoComplete="name" required /></label>
                  <label>Email address<input name="email" type="email" placeholder="jane@example.com" autoComplete="email" required /></label>
                </div>
                <label>What kind of space?
                  <select name="project" defaultValue="" required>
                    <option value="" disabled>Select a project type</option>
                    <option>Residential interior</option>
                    <option>Commercial interior</option>
                    <option>Consultation</option>
                    <option>Something else</option>
                  </select>
                </label>
                <label>Tell us a little more<textarea name="message" rows="5" placeholder="A few details about your project, timeline, or ideas..." required /></label>
                <button className="button button-dark" type="submit">Send Your Message <span>→</span></button>
                <p className="form-note">We’ll only use your details to get back to you about your enquiry.</p>
              </>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="not-found section-wrap">
        <p className="eyebrow">404 · PAGE NOT FOUND</p>
        <h1>Looks like this space is empty.</h1>
        <p>The page you’re looking for may have moved. Let’s find your way back.</p>
        <Link className="button button-dark" to="/">Back to Home <span>→</span></Link>
      </main>
      <Footer />
    </>
  )
}