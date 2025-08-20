import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"
// import { DockerManager } from "@/lib/docker-manager"

export async function GET(request: NextRequest, { params }: { params: { botId: string } }) {
  return NextResponse.json({ logs: [] })
}
