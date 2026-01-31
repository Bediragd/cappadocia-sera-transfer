import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { contactSchema } from '@/lib/validations'

export async function GET() {
  try {
    const messages = await sql`
      SELECT * FROM contact_messages ORDER BY created_at DESC
    `
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    const result = await sql`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (${validatedData.name}, ${validatedData.email}, ${validatedData.phone || null}, ${validatedData.subject}, ${validatedData.message})
      RETURNING *
    `

    return NextResponse.json({ message: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
