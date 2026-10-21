import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  /* config options here */
  agentRules: true,
  // Bundle pg to avoid Bun resolving Turbopack's generated pg-<hash> externals.
  transpilePackages: ['pg'],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  allowedDevOrigins: ['127.0.0.1'],
  // basePath: '/admin',
  // 307 Relocation
  redirects() {
    return [
      // {
      //   source: "/",
      //   destination: "/auth/sign-in",
      //   permanent: false,
      // },
    ]
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
