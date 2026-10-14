import { readdir } from "node:fs/promises"

const sourceUrl = new URL("../src/", import.meta.url)

function isSourceFile(name) {
  return /\.(ts|tsx)$/.test(name) &&
    !/\.d\.ts$|\.(test|spec|stories)\.(ts|tsx)$/.test(name)
}

/** Build public files, module indexes and shared hooks without publishing module internals. */
export async function getEntryPoints() {
  const entries = new Set()

  function addEntry(name) {
    if (entries.has(name)) {
      throw new Error(`Duplicate UI entry: ${name}. Keep either a file or a module directory.`)
    }
    entries.add(name)
  }

  const sourceEntries = await readdir(sourceUrl, { withFileTypes: true })
  for (const entry of sourceEntries) {
    if (entry.isFile() && isSourceFile(entry.name)) {
      const name = entry.name.replace(/\.(ts|tsx)$/, "")
      if (name !== "index") addEntry(`./${name}`)
    } else if (entry.isDirectory() && !["hooks", "lib", "styles"].includes(entry.name)) {
      const files = await readdir(new URL(`${entry.name}/`, sourceUrl), { withFileTypes: true })
      const indexes = files.filter((file) => file.isFile() && /^index\.(ts|tsx)$/.test(file.name))
      if (indexes.length > 1) throw new Error(`Multiple index files in src/${entry.name}`)
      if (indexes.length === 1) addEntry(`./${entry.name}`)
    }
  }

  // shadcn hooks are shared dependencies; Auth's own hooks remain inside its module.
  const hooks = sourceEntries.find((entry) => entry.name === "hooks" && entry.isDirectory())
  if (hooks) {
    for (const file of await readdir(new URL("hooks/", sourceUrl), { withFileTypes: true })) {
      if (file.isFile() && isSourceFile(file.name)) {
        addEntry(`./hooks/${file.name.replace(/\.(ts|tsx)$/, "")}`)
      }
    }
  }

  return [...entries].sort()
}
