import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

type Params = { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10)
    if (!id) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 })
    }

    const body = await request.json()
    const answer = body.answer?.toString().trim() || null
    let rating: number | null = null
    if (body.rating != null) {
      const num = Number(body.rating)
      if (!Number.isNaN(num) && num >= 1 && num <= 5) {
        rating = Math.round(num)
      }
    }

    const [row] = await sql`
      UPDATE qa_questions
      SET
        answer = ${answer},
        rating = ${rating},
        answered_at = CASE WHEN ${answer} IS NOT NULL THEN NOW() ELSE answered_at END
      WHERE id = ${id}
      RETURNING id, username, question, answer, rating, created_at, answered_at
    `

    if (!row) {
      return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({ question: row })
  } catch (error) {
    console.error("QA PATCH error:", error)
    return NextResponse.json({ error: "Soru güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id, 10)
    if (!id) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 })
    }

    await sql`
      UPDATE qa_questions
      SET is_active = false
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("QA DELETE error:", error)
    return NextResponse.json({ error: "Soru silinemedi" }, { status: 500 })
  }
}

