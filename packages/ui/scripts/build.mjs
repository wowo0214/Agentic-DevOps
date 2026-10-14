import { watch } from "node:fs"
import { copyFile, mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { bundle } from "bunchee"
import { getEntryPoints } from "./entry-points.mjs"

const cwd = fileURLToPath(new URL("../", import.meta.url))
const watchMode = process.argv.includes("--watch")
const componentEntries = await getEntryPoints()

async function copyStyles() {
  await mkdir(new URL("../dist/", import.meta.url), { recursive: true })
  await copyFile(
    new URL("../src/styles.css", import.meta.url),
    new URL("../dist/styles.css", import.meta.url)
  )
}

await bundle("", {
  cwd,
  clean: true,
  watch: watchMode,
  _entryFilter: componentEntries,
  onSuccess: copyStyles
})

if (watchMode) {
  watch(new URL("../src/styles.css", import.meta.url), () => {
    copyStyles().catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
  })
}
