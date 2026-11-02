# Design Mantra backend

## Run locally

1. If `.env` does not exist, copy `.env.example` to `.env`. Otherwise, add the admin settings from `.env.example` to the existing file without replacing its other settings.
2. Set a private admin email and password, and replace `ADMIN_TOKEN_SECRET` with a random secret of at least 32 characters. Do not commit `.env`.
3. From this directory, run `npm install` and `npm run dev`.
4. Run the frontend with `npm run dev` from `frontend`. Vite forwards `/api` and `/uploads` requests to `http://localhost:5000`.
5. Open `/admin/login` on the frontend and sign in with the configured admin email and password.

The admin API returns a signed, eight-hour bearer token. Admin endpoints require that token. The frontend keeps it in session storage and removes it when you sign out.

## Admin features and storage

- Create, edit, and remove portfolio projects. Project descriptions, project details, and project images appear on the public gallery and project detail routes.
- Update the intro heading, title, description, and hero image on Home, Gallery, About, and Contact.
- Uploaded JPG, PNG, GIF, and WebP images are limited to 5 MB per file.
- Website content is stored in `data/site-content.json`. Uploaded images are stored in `uploads/` and served from `/uploads/`.
- The first public content request creates the data file with the sample portfolio and page content. Back up `data/` and `uploads/` together.

This storage is local to the backend host. For multi-instance or production deployments, use durable shared storage and configure `FRONTEND_URL` to the exact frontend origin. The existing Supabase variables are only used by the legacy `/api/users` routes; admin site content is not stored in Supabase.

## Content API

- `GET /api/content` — public page content and projects.
- `POST /api/admin/login` — admin sign-in.
- `GET /api/admin/content` — read content (admin token required).
- `PUT /api/admin/pages/:pageId` — update `home`, `gallery`, `about`, or `contact`.
- `POST /api/admin/projects` — create a project.
- `PUT /api/admin/projects/:projectId` — update a project.
- `DELETE /api/admin/projects/:projectId` — delete a project.
- `POST /api/admin/uploads` — upload one or more images as multipart field `images`.
