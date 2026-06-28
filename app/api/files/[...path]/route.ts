import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFile, stat } from 'fs/promises'

export const runtime = 'nodejs'

const UPLOAD_ROOT = path.resolve(process.cwd(), 'public', 'uploads')

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

function resolveUploadPath(segments: string[]): string | null {
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    return null
  }

  const filePath = path.resolve(UPLOAD_ROOT, ...segments)
  if (filePath !== UPLOAD_ROOT && !filePath.startsWith(`${UPLOAD_ROOT}${path.sep}`)) {
    return null
  }

  return filePath
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params
  const filePath = resolveUploadPath(segments ?? [])
  if (!filePath) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const info = await stat(filePath)
    if (!info.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()

    return new NextResponse(data, {
      headers: {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Content-Length': String(info.size),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
