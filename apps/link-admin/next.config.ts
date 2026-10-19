import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  /* config options here */
  agentRules: true,
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
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
