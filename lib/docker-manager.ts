import { exec } from "child_process"
import { promisify } from "util"
import { createServerClient } from "@/lib/supabase/server"

const execAsync = promisify(exec)

export interface ContainerConfig {
  botId: string
  userId: string
  botFilePath: string
  requirementsPath?: string
  environmentVars?: Record<string, string>
}

export interface ContainerStatus {
  id: string
  status: "running" | "stopped" | "error" | "starting" | "stopping"
  uptime?: string
  memoryUsage?: string
  cpuUsage?: string
  logs?: string[]
}

export class DockerManager {
  private static instance: DockerManager
  private containers: Map<string, string> = new Map() // botId -> containerId

  static getInstance(): DockerManager {
    if (!DockerManager.instance) {
      DockerManager.instance = new DockerManager()
    }
    return DockerManager.instance
  }

  async createContainer(config: ContainerConfig): Promise<string> {
    try {
      // Create a unique container name
      const containerName = `telebot-${config.botId}`

      // Build Docker command
      const dockerCommand = [
        "docker run -d",
        `--name ${containerName}`,
        "--restart unless-stopped",
        "--memory=256m", // Memory limit
        "--cpus=0.5", // CPU limit
        `-v ${config.botFilePath}:/app/bot.py:ro`, // Mount bot file as read-only
        config.requirementsPath ? `-v ${config.requirementsPath}:/app/requirements.txt:ro` : "",
        // Add environment variables
        Object.entries(config.environmentVars || {})
          .map(([key, value]) => `-e ${key}="${value}"`)
          .join(" "),
        "python:3.11-slim", // Base Python image
        "sh -c 'cd /app && (test -f requirements.txt && pip install -r requirements.txt || true) && python bot.py'",
      ]
        .filter(Boolean)
        .join(" ")

      const { stdout } = await execAsync(dockerCommand)
      const containerId = stdout.trim()

      // Store container mapping
      this.containers.set(config.botId, containerId)

      // Update database with container info
      const supabase = createServerClient()
      await supabase
        .from("bots")
        .update({
          container_id: containerId,
          status: "starting",
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.botId)

      return containerId
    } catch (error) {
      console.error("Failed to create container:", error)
      throw new Error(`Container creation failed: ${error}`)
    }
  }

  async startContainer(botId: string): Promise<void> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        throw new Error("Container not found")
      }

      await execAsync(`docker start ${containerId}`)

      // Update database status
      const supabase = createServerClient()
      await supabase
        .from("bots")
        .update({
          status: "running",
          updated_at: new Date().toISOString(),
        })
        .eq("id", botId)
    } catch (error) {
      console.error("Failed to start container:", error)
      throw new Error(`Container start failed: ${error}`)
    }
  }

  async stopContainer(botId: string): Promise<void> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        throw new Error("Container not found")
      }

      await execAsync(`docker stop ${containerId}`)

      // Update database status
      const supabase = createServerClient()
      await supabase
        .from("bots")
        .update({
          status: "stopped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", botId)
    } catch (error) {
      console.error("Failed to stop container:", error)
      throw new Error(`Container stop failed: ${error}`)
    }
  }

  async restartContainer(botId: string): Promise<void> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        throw new Error("Container not found")
      }

      await execAsync(`docker restart ${containerId}`)

      // Update database status
      const supabase = createServerClient()
      await supabase
        .from("bots")
        .update({
          status: "running",
          updated_at: new Date().toISOString(),
        })
        .eq("id", botId)
    } catch (error) {
      console.error("Failed to restart container:", error)
      throw new Error(`Container restart failed: ${error}`)
    }
  }

  async removeContainer(botId: string): Promise<void> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        throw new Error("Container not found")
      }

      // Stop and remove container
      await execAsync(`docker stop ${containerId} || true`)
      await execAsync(`docker rm ${containerId}`)

      // Remove from mapping
      this.containers.delete(botId)

      // Update database status
      const supabase = createServerClient()
      await supabase
        .from("bots")
        .update({
          container_id: null,
          status: "stopped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", botId)
    } catch (error) {
      console.error("Failed to remove container:", error)
      throw new Error(`Container removal failed: ${error}`)
    }
  }

  async getContainerStatus(botId: string): Promise<ContainerStatus> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        return { id: "", status: "stopped" }
      }

      // Get container stats
      const { stdout: statusOutput } = await execAsync(`docker inspect ${containerId} --format='{{.State.Status}}'`)
      const status = statusOutput.trim()

      // Get container stats if running
      let memoryUsage = ""
      let cpuUsage = ""
      if (status === "running") {
        try {
          const { stdout: statsOutput } = await execAsync(
            `docker stats ${containerId} --no-stream --format="{{.MemUsage}} {{.CPUPerc}}"`,
          )
          const [memory, cpu] = statsOutput.trim().split(" ")
          memoryUsage = memory
          cpuUsage = cpu
        } catch (statsError) {
          console.warn("Failed to get container stats:", statsError)
        }
      }

      // Get recent logs
      let logs: string[] = []
      try {
        const { stdout: logsOutput } = await execAsync(`docker logs ${containerId} --tail=50`)
        logs = logsOutput.split("\n").filter((line) => line.trim())
      } catch (logsError) {
        console.warn("Failed to get container logs:", logsError)
      }

      return {
        id: containerId,
        status: status as ContainerStatus["status"],
        memoryUsage,
        cpuUsage,
        logs,
      }
    } catch (error) {
      console.error("Failed to get container status:", error)
      return { id: "", status: "error" }
    }
  }

  async getContainerLogs(botId: string, lines = 100): Promise<string[]> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        return []
      }

      const { stdout } = await execAsync(`docker logs ${containerId} --tail=${lines}`)
      return stdout.split("\n").filter((line) => line.trim())
    } catch (error) {
      console.error("Failed to get container logs:", error)
      return []
    }
  }

  // Initialize containers from database on startup
  async initializeContainers(): Promise<void> {
    try {
      const supabase = createServerClient()
      const { data: bots } = await supabase.from("bots").select("id, container_id").not("container_id", "is", null)

      if (bots) {
        for (const bot of bots) {
          if (bot.container_id) {
            this.containers.set(bot.id, bot.container_id)
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize containers:", error)
    }
  }
}
