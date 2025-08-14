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

    // Get container status
    const dockerManager = DockerManager.getInstance()
    const status = await dockerManager.getContainerStatus(botId)

    return NextResponse.json({ status })
  } catch (error) {
    console.error("Error getting container status:", error)
    return NextResponse.json({ error: "Failed to get container status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { botId: string } }) {
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

    const { action } = await request.json()
    const { botId } = params

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

    const dockerManager = DockerManager.getInstance()

    switch (action) {
      case "start":
        await dockerManager.startContainer(botId)
        break
      case "stop":
        await dockerManager.stopContainer(botId)
        break
      case "restart":
        await dockerManager.restartContainer(botId)
        break
      case "remove":
        await dockerManager.removeContainer(botId)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Container action error:", error)
    return NextResponse.json({ error: error.message || "Container action failed" }, { status: 500 })
  }
}
