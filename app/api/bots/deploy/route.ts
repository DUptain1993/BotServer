import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { DockerManager } from "@/lib/docker-manager"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

interface DeployRequest {
  botName: string
  description?: string
  botToken: string
  botFile: string // base64 encoded file content
  requirementsFile?: string // base64 encoded file content
  platform?: "linux" | "android" | "windows"
  resources?: {
    memory?: string
    cpu?: string
    storage?: string
  }
}

interface DeploymentResponse {
  botId: string
  deploymentId: string
  status: "deploying" | "success" | "failed"
  message: string
  containerId?: string
}

export async function POST(request: NextRequest) {
  try {
    const { 
      botName, 
      description, 
      botToken, 
      botFile, 
      requirementsFile, 
      platform = "linux",
      resources 
    }: DeployRequest = await request.json()

    // Validate input
    if (!botName || !botToken || !botFile) {
      return NextResponse.json({ 
        error: "Bot name, token, and bot file are required" 
      }, { status: 400 })
    }

    // Validate bot token format
    if (!botToken.match(/^\d+:[A-Za-z0-9_-]{35}$/)) {
      return NextResponse.json({ 
        error: "Invalid Telegram bot token format" 
      }, { status: 400 })
    }

    // Validate platform
    if (!["linux", "android", "windows"].includes(platform)) {
      return NextResponse.json({ 
        error: "Invalid platform. Must be linux, android, or windows" 
      }, { status: 400 })
    }

    // Get user from session
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Check if user has reached bot limit
    const { data: existingBots } = await supabase
      .from("bots")
      .select("id")
      .eq("user_id", user.id)

    if (existingBots && existingBots.length >= 3) {
      return NextResponse.json({ 
        error: "Maximum number of bots (3) reached" 
      }, { status: 403 })
    }

    // Generate bot ID and deployment ID
    const botId = uuidv4()
    const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create bot directory
    const botDir = join(process.cwd(), "bot-containers", botId)
    await mkdir(botDir, { recursive: true })

    // Save bot file
    const botFilePath = join(botDir, "bot.py")
    const botContent = Buffer.from(botFile, "base64").toString("utf-8")
    await writeFile(botFilePath, botContent)

    // Save requirements file if provided
    let requirementsPath: string | undefined
    if (requirementsFile) {
      requirementsPath = join(botDir, "requirements.txt")
      const requirementsContent = Buffer.from(requirementsFile, "base64").toString("utf-8")
      await writeFile(requirementsPath, requirementsContent)
    }

    // Create bot record in database
    const { error: dbError } = await supabase
      .from("bots")
      .insert({
        id: botId,
        user_id: user.id,
        name: botName,
        description: description || "",
        bot_token: botToken,
        status: "deploying",
        file_path: botFilePath,
        requirements_path: requirementsPath,
        platform: platform,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ 
        error: "Failed to create bot record" 
      }, { status: 500 })
    }

    // Create deployment record
    await supabase
      .from("deployments")
      .insert({
        bot_id: botId,
        status: "building",
        started_at: new Date().toISOString()
      })

    // Deploy bot using Docker manager
    const dockerManager = DockerManager.getInstance()
    
    try {
      const containerId = await dockerManager.createContainer({
        botId,
        userId: user.id,
        botFilePath,
        requirementsPath,
        platform,
        resources,
        environmentVars: {
          BOT_TOKEN: botToken,
          BOT_NAME: botName,
          PLATFORM: platform
        }
      })

      // Update deployment status
      await supabase
        .from("deployments")
        .update({
          status: "running",
          completed_at: new Date().toISOString()
        })
        .eq("bot_id", botId)

      // Update bot status
      await supabase
        .from("bots")
        .update({
          status: "running",
          container_id: containerId,
          updated_at: new Date().toISOString()
        })
        .eq("id", botId)

      const response: DeploymentResponse = {
        botId,
        deploymentId,
        status: "success",
        message: "Bot deployed successfully",
        containerId
      }

      return NextResponse.json(response)

    } catch (deployError) {
      console.error("Deployment error:", deployError)
      
      // Update deployment status to failed
      await supabase
        .from("deployments")
        .update({
          status: "failed",
          error_message: deployError instanceof Error ? deployError.message : "Unknown error",
          completed_at: new Date().toISOString()
        })
        .eq("bot_id", botId)

      // Update bot status
      await supabase
        .from("bots")
        .update({
          status: "error",
          updated_at: new Date().toISOString()
        })
        .eq("id", botId)

      return NextResponse.json({ 
        error: `Deployment failed: ${deployError instanceof Error ? deployError.message : "Unknown error"}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Deployment error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Get user's bots
    const { data: bots, error: botsError } = await supabase
      .from("bots")
      .select(`
        id,
        name,
        description,
        status,
        platform,
        created_at,
        updated_at,
        deployments (
          id,
          status,
          started_at,
          completed_at,
          error_message
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (botsError) {
      console.error("Database error:", botsError)
      return NextResponse.json({ 
        error: "Failed to fetch bots" 
      }, { status: 500 })
    }

    return NextResponse.json({ bots: bots || [] })

  } catch (error) {
    console.error("Error fetching bots:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
