import { defineConfig } from 'oxlint'
import base from '@repo/vite-config/oxlint'

export default defineConfig({
  ...base,
  options: {
    typeAware: true,
    typeCheck: true,
  },
})
