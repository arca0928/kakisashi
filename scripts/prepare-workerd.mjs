import { execFileSync } from 'node:child_process'
import {
  chmodSync,
  closeSync,
  globSync,
  linkSync,
  mkdtempSync,
  openSync,
  readSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const loader = process.env.WORKERD_NIX_LOADER
if (process.platform !== 'linux' || !loader) process.exit(0)

const store = fileURLToPath(new URL('../node_modules/.pnpm/', import.meta.url))
const binaries = globSync([
  '@cloudflare+workerd-linux-*/node_modules/@cloudflare/workerd-linux-*/bin/workerd',
  'workerd@*/node_modules/workerd/bin/workerd',
], { cwd: store })

function isElf(binary) {
  const fd = openSync(binary, 'r')
  try {
    const magic = Buffer.alloc(4)
    return readSync(fd, magic) === 4 && magic.toString('ascii') === '\x7fELF'
  } finally {
    closeSync(fd)
  }
}

// Miniflare runs the platform binary directly. The standalone CLI may be a
// JS launcher or a hard link to that binary, depending on its install script.
const patched = new Map()
for (const entry of binaries) {
  const binary = join(store, entry)
  if (!isElf(binary)) continue

  const { dev, ino, mode } = statSync(binary)
  const id = `${dev}:${ino}`
  const existing = patched.get(id)
  if (!existing) {
    const interpreter = execFileSync('patchelf', ['--print-interpreter', binary], {
      encoding: 'utf8',
    }).trim()
    if (interpreter === loader) continue
  }

  // Replace the file rather than editing an inode shared with pnpm's store.
  const tempDir = mkdtempSync(join(dirname(binary), '.workerd-nix-'))
  const output = join(tempDir, 'workerd')
  try {
    if (existing) {
      linkSync(existing, output)
    } else {
      execFileSync('patchelf', ['--set-interpreter', loader, '--output', output, binary])
      chmodSync(output, mode & 0o777)
    }
    renameSync(output, binary)
    patched.set(id, binary)
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}
