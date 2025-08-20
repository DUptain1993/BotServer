import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { botId: string } }) {
  return NextResponse.json({ files: [] })
}

export async function DELETE(request: NextRequest, { params }: { params: { botId: string } }) {
  return NextResponse.json({ success: true })
}
