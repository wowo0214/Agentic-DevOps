import { defineConfig } from 'fumadocs-mdx/config';

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      // Keep GitHub syntax highlighting in both color modes.
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
});
