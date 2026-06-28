import path from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { randomBytes } from 'crypto'

export type SavedDocument = {
  key: string
  label: string
  path: string
  filename: string
}

const DOC_LABELS: Record<string, string> = {
  ehliyetOn: 'Ehliyet On',
  ehliyetArka: 'Ehliyet Arka',
  aracOn: 'Arac On',
  aracArka: 'Arac Arka',
  aracSag: 'Arac Sag',
  aracSol: 'Arac Sol',
  aracIc: 'Arac Ic',
  srcBelgesi: 'SRC Belgesi',
  adliSicil: 'Adli Sicil',
  psikoteknik: 'Psikoteknik',
}

export const REQUIRED_DOC_KEYS = Object.keys(DOC_LABELS)

function safeExt(name: string): string {
  const ext = path.extname(name).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) return ext
  return '.jpg'
}

export async function saveApplicationDocuments(
  applicationId: number,
  files: Record<string, File>
): Promise<SavedDocument[]> {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'applications', String(applicationId))
  await mkdir(dir, { recursive: true })

  const saved: SavedDocument[] = []

  for (const key of REQUIRED_DOC_KEYS) {
    const file = files[key]
    if (!file || !(file instanceof File) || file.size === 0) continue

    const ext = safeExt(file.name)
    const filename = `${key}-${randomBytes(4).toString('hex')}${ext}`
    const diskPath = path.join(dir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(diskPath, buffer)

    saved.push({
      key,
      label: DOC_LABELS[key] || key,
      path: `/uploads/applications/${applicationId}/${filename}`,
      filename: file.name,
    })
  }

  return saved
}

export function validateRequiredDocuments(files: Record<string, File | null | undefined>): string | null {
  for (const key of REQUIRED_DOC_KEYS) {
    const file = files[key]
    if (!file || file.size === 0) {
      return `${DOC_LABELS[key] || key} zorunludur`
    }
    if (file.size > 5 * 1024 * 1024) {
      return `${DOC_LABELS[key] || key} en fazla 5 MB olabilir`
    }
  }
  return null
}
