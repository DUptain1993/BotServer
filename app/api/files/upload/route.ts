import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true })
}
