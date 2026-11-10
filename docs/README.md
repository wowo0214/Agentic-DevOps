# docs

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

From the monorepo root, build the shared dependencies and start Docs:

```bash
pnpm --filter @repo/http-contract build
pnpm --filter docs dev
```

Open http://localhost:3002 with your browser to see the result. The optional
`docker/Caddyfile` exposes the same service at http://docs.localhost.

## AI chat and site configuration

Copy `docs/.env.example` to `docs/.env.local` and set `AI_GATEWAY_API_KEY`.
The chat endpoint uses Vercel AI Gateway with
`nvidia/nemotron-3.5-lightning-free` and searches the local documentation.

Set `SITE_URL` to the site's actual URL in production so social preview images
resolve against the correct origin. Restart the development server after editing
environment variables. Keep `.env.local` out of Git.

From the monorepo root, run `pnpm exec turbo run build --filter=docs` for a
production build, including shared dependencies and Next.js type checking.
The root lint/format configuration currently excludes Docs.

Turbopack development filesystem caching is disabled to work around the
Next.js 16.4 HMR reload loop; production build caching remains unchanged.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

Collections are defined with the [Macro API](https://fumadocs.dev/docs/mdx/macro) in `lib/source.ts`.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
