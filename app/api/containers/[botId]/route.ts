import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"
// import { DockerManager } from "@/lib/docker-manager"

export async function GET(request: NextRequest, { params }: { params: { botId: string } }) {
  return NextResponse.json({ status: "stopped" })
}

export async function POST(request: NextRequest, { params }: { params: { botId: string } }) {
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { botId: string } }) {
  return NextResponse.json({ success: true })
}
