# docs

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

From `apps/docs`, run the development server with the team's Vite+ script runner:

```bash
vpr dev
```

Open http://localhost:3000 with your browser to see the result.

## AI chat and site configuration

Copy `.env.example` to `.env.local` and set `OPENROUTER_API_KEY`.
`OPENROUTER_MODEL` selects the model explicitly; the chat endpoint requires both
values and does not select a paid model when configuration is missing.
The example uses `nvidia/nemotron-3-ultra-550b-a55b:free`.

Set `SITE_URL` to the site's actual URL in production so social preview images
resolve against the correct origin. Restart the development server after editing
environment variables. Keep `.env.local` out of Git.

From the monorepo root, run `vpr dev:docs` for development,
`bun run --filter docs check-types` for type checking, and
`bun run --filter docs build` for a production build.

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
