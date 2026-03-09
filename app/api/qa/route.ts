import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "1"
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 100)

    const rows = await sql`
      SELECT id, username, question, answer, rating, created_at, answered_at
      FROM qa_questions
      WHERE is_active = true
      ${all ? sql`` : sql`AND answer IS NOT NULL`}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({ questions: rows })
  } catch (error) {
    console.error("QA GET error:", error)
    return NextResponse.json({ error: "Sorular yüklenemedi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = (body.username || "").toString().trim()
    const question = (body.question || "").toString().trim()

    if (!username || !question) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve soru zorunludur" },
        { status: 400 }
      )
    }

    const [row] = await sql`
      INSERT INTO qa_questions (username, question)
      VALUES (${username}, ${question})
      RETURNING id, username, question, answer, rating, created_at, answered_at
    `

    return NextResponse.json({ question: row }, { status: 201 })
  } catch (error) {
    console.error("QA POST error:", error)
    return NextResponse.json({ error: "Soru kaydedilemedi" }, { status: 500 })
  }
}

