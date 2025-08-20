import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"
// import { DockerManager } from "@/lib/docker-manager"
// import { writeFile, mkdir } from "fs/promises"
// import { join } from "path"
// import { v4 as uuidv4 } from "uuid"

// interface DeployRequest {
//   botName: string
//   description?: string
//   botToken: string
//   botFile: string
//   requirementsFile?: string
//   platform?: "linux" | "android" | "windows"
//   resources?: {
//     memory?: string
//     cpu?: string
//     storage?: string
//   }
// }

// interface DeploymentResponse {
//   botId: string
//   deploymentId: string
//   status: "success" | "error"
//   message: string
//   containerId?: string
// }

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: "API temporarily disabled for build" 
  }, { status: 503 })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ bots: [] })
}
