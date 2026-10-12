import { readFile, writeFile } from 'node:fs/promises'

const path = new URL('../app/prisma/contract.prisma', import.meta.url)
const source = await readFile(path, 'utf8')
// Tokenize strings and comments separately so their contents are never renamed.
const tokens = [...source.matchAll(/\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|[A-Za-z_][A-Za-z_0-9]*|[^\s]/g)]
  .filter(([text]) => !text.startsWith('//') && !text.startsWith('/*'))
const models = []
const names = new Map()
const edits = []
const newline = source.includes('\r\n') ? '\r\n' : '\n'

for (let i = 0; i < tokens.length; i++) {
  if (tokens[i][0] !== 'model' || tokens[i + 2]?.[0] !== '{') continue
  const name = tokens[i + 1][0]
  const lower = name[0].toLowerCase() + name.slice(1)
  // Fail before writing if names across namespaces cannot be resolved unambiguously.
  if (names.has(name) || [...names.values()].includes(lower)) {
    throw new Error(`Ambiguous model name: ${name}. Contract was not changed.`)
  }
  names.set(name, lower)
  let end = i + 3
  let depth = 1
  for (; end < tokens.length; end++) {
    if (tokens[end][0] === '{') depth++
    if (tokens[end][0] === '}' && --depth === 0) break
    // Only closing braces decrement the nesting level.
  }
  if (end === tokens.length) throw new Error(`Unclosed model: ${name}`)
  models.push({ name, lower, start: i, end })
  i = end
}

function rename(token) {
  const replacement = names.get(token[0])
  if (replacement && replacement !== token[0]) {
    edits.push({ start: token.index, end: token.index + token[0].length, text: replacement })
  }
}

for (const model of models) {
  rename(tokens[model.start + 1])
  let hasMap = false
  for (let i = model.start + 3; i < model.end; i++) {
    const token = tokens[i]
    if (token[0] === '@' && tokens[i + 1]?.[0] === '@' && tokens[i + 2]?.[0] === 'map') hasMap = true
    // A field declaration starts on its own line: fieldName ModelType[]?.
    const previous = tokens[i - 1]
    const gap = source.slice(previous.index + previous[0].length, token.index)
    if (!/[\r\n]/.test(gap) || !/^[A-Za-z_]\w*$/.test(token[0])) continue
    let typeIndex = i + 1
    if (tokens[typeIndex + 1]?.[0] === '.') typeIndex += 2
    if (tokens[typeIndex]) rename(tokens[typeIndex])
  }
  // Without an explicit mapping, renaming a model would change its table name.
  if (!hasMap && model.name !== model.lower) {
    const end = tokens[model.end].index
    edits.push({ start: end, end, text: `  @@map(${JSON.stringify(model.name)})${newline}` })
  }
}

// Policies refer to their model through a target assignment.
for (let i = 0; i < tokens.length; i++) {
  if (tokens[i][0] !== 'target' || tokens[i + 1]?.[0] !== '=') continue
  let target = i + 2
  if (tokens[target + 1]?.[0] === '.') target += 2
  if (tokens[target]) rename(tokens[target])
}

let output = source
for (const edit of edits.sort((a, b) => b.start - a.start)) {
  output = output.slice(0, edit.start) + edit.text + output.slice(edit.end)
}
if (output !== source) await writeFile(path, output)
const changed = models.filter(({ name, lower }) => name !== lower)
console.log(changed.length
  ? `Prisma models renamed: ${changed.map(({ name, lower }) => `${name} -> ${lower}`).join(', ')}`
  : 'Prisma model names already start with lowercase letters.')
