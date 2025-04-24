// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable' // v2以降は直接インポート
import fs from 'fs'
import path from 'path'

// Next.js の組み込みボディパーサーを無効化
export const config = { api: { bodyParser: false } }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    multiples: false,
  })

  form.parse(req, (err, _fields, files) => {
    if (err) {
      console.error('Upload error:', err)
      return res.status(500).json({ error: err.message })
    }
    const fileField = files.image as File | File[] | undefined
    const file = Array.isArray(fileField) ? fileField[0] : fileField
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const filename = path.basename(file.filepath)
    const url = `/uploads/${filename}`
    return res.status(200).json({ url })
  })
}
