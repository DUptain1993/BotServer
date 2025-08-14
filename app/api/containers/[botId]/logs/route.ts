import { createServerClient } from "@/lib/supabase/server"
import { DockerManager } from "@/lib/docker-manager"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { botId } = params
    const { searchParams } = new URL(request.url)
    const lines = Number.parseInt(searchParams.get("lines") || "100")

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("id", botId)
      .eq("user_id", user.id)
      .single()

    if (botError || !bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Get container logs
    const dockerManager = DockerManager.getInstance()
    const logs = await dockerManager.getContainerLogs(botId, lines)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error getting container logs:", error)
    return NextResponse.json({ error: "Failed to get container logs" }, { status: 500 })
  }
}
