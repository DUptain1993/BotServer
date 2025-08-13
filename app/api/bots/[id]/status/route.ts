import { type NextRequest, NextResponse } from "next/server"

interface BotStatus {
  id: string
  status: "deploying" | "running" | "stopped" | "error"
  progress: number
  logs: string[]
  url?: string
  error?: string
}

// Mock deployment statuses
const mockStatuses: Record<string, BotStatus> = {}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get or create mock status
    if (!mockStatuses[id]) {
      mockStatuses[id] = {
        id,
        status: "deploying",
        progress: 25,
        logs: ["Deployment started", "Uploading files..."],
      }
    }

    // Simulate progress
    const status = mockStatuses[id]
    if (status.status === "deploying" && status.progress < 100) {
      status.progress = Math.min(100, status.progress + 25)
      status.logs.push(`Progress: ${status.progress}%`)

      if (status.progress === 100) {
        status.status = "running"
        status.url = `https://t.me/${id.toLowerCase()}_bot`
        status.logs.push("Deployment completed successfully!")
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: "Failed to get bot status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { action } = await request.json()

    if (!mockStatuses[id]) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    const status = mockStatuses[id]

    switch (action) {
      case "stop":
        status.status = "stopped"
        status.logs.push("Bot stopped by user")
        break
      case "start":
        status.status = "running"
        status.logs.push("Bot restarted by user")
        break
      case "restart":
        status.status = "running"
        status.logs.push("Bot restarted by user")
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Bot action error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
