import { exec } from "child_process"
import { promisify } from "util"
import { v4 as uuidv4 } from "uuid"

const execAsync = promisify(exec)

export interface ContainerConfig {
  botId: string
  userId: string
  botFilePath: string
  requirementsPath?: string
  environmentVars?: Record<string, string>
  platform?: "linux" | "android" | "windows"
  resources?: {
    memory?: string
    cpu?: string
    storage?: string
  }
}

export interface ContainerStatus {
  id: string
  status: "running" | "stopped" | "error" | "starting" | "stopping" | "building"
  uptime?: string
  memoryUsage?: string
  cpuUsage?: string
  logs?: string[]
  platform?: string
  resources?: {
    memory: string
    cpu: string
    storage: string
  }
}

export interface BotMetrics {
  messagesProcessed: number
  uptimeSeconds: number
  memoryUsageMB: number
  cpuUsagePercent: number
  errorCount: number
  lastActivity: Date
}

export class DockerManager {
  private static instance: DockerManager
  private containers: Map<string, string> = new Map() // botId -> containerId
  private maxContainers = 3 // Maximum bots allowed
  private platformImages = {
    linux: "python:3.11-slim",
    android: "python:3.11-alpine",
    windows: "python:3.11-windowsservercore"
  }

  static getInstance(): DockerManager {
    if (!DockerManager.instance) {
      DockerManager.instance = new DockerManager()
    }
    return DockerManager.instance
  }

  async createContainer(config: ContainerConfig): Promise<string> {
    try {
      // Check container limit
      if (this.containers.size >= this.maxContainers) {
        throw new Error(`Maximum number of bots (${this.maxContainers}) reached`)
      }

      // Create a unique container name
      const containerName = `telebot-${config.botId}-${uuidv4().slice(0, 8)}`
      const platform = config.platform || "linux"
      const baseImage = this.platformImages[platform]
      
      // Set resource limits
      const memory = config.resources?.memory || "256m"
      const cpu = config.resources?.cpu || "0.5"
      const storage = config.resources?.storage || "1g"

      // Create bot directory
      const botDir = `/app/bot-containers/${config.botId}`
      await execAsync(`mkdir -p ${botDir}`)

      // Copy files to container directory
      await execAsync(`cp ${config.botFilePath} ${botDir}/bot.py`)
      if (config.requirementsPath) {
        await execAsync(`cp ${config.requirementsPath} ${botDir}/requirements.txt`)
      }

      // Build cross-platform compatible Dockerfile
      const dockerfileContent = this.generateDockerfile(platform, !!config.requirementsPath)
      await execAsync(`echo '${dockerfileContent}' > ${botDir}/Dockerfile`)

      // Build container image
      const imageName = `telebot-${config.botId}`
      await execAsync(`docker build -t ${imageName} ${botDir}`)

      // Build Docker run command with cross-platform support
      const dockerCommand = [
        "docker run -d",
        `--name ${containerName}`,
        "--restart unless-stopped",
        `--memory=${memory}`,
        `--cpus=${cpu}`,
        `--storage-opt size=${storage}`,
        "--network host", // Use host network for better performance
        // Add environment variables
        Object.entries(config.environmentVars || {})
          .map(([key, value]) => `-e ${key}="${value}"`)
          .join(" "),
        // Add health check
        "--health-cmd='python -c \"import requests; requests.get(\\\"http://localhost:8080/health\\\")\"'",
        "--health-interval=30s",
        "--health-timeout=10s",
        "--health-retries=3",
        imageName
      ]
        .filter(Boolean)
        .join(" ")

      const { stdout } = await execAsync(dockerCommand)
      const containerId = stdout.trim()

      // Store container mapping
      this.containers.set(config.botId, containerId)

      // Update database with container info (disabled for build)
      console.log(`Container ${containerId} created for bot ${config.botId}`)

      return containerId
    } catch (error) {
      console.error("Failed to create container:", error)
      throw new Error(`Container creation failed: ${error}`)
    }
  }

  private generateDockerfile(platform: string, hasRequirements: boolean): string {
    const baseImage = this.platformImages[platform as keyof typeof this.platformImages] || this.platformImages.linux
    
    let dockerfile = `FROM ${baseImage}\n`
    dockerfile += `WORKDIR /app\n`
    
    // Install system dependencies for cross-platform support
    if (platform === "linux") {
      dockerfile += `RUN apt-get update && apt-get install -y \\\n`
      dockerfile += `    gcc \\\n`
      dockerfile += `    g++ \\\n`
      dockerfile += `    libffi-dev \\\n`
      dockerfile += `    libssl-dev \\\n`
      dockerfile += `    curl \\\n`
      dockerfile += `    && rm -rf /var/lib/apt/lists/*\n`
    } else if (platform === "android") {
      dockerfile += `RUN apk add --no-cache \\\n`
      dockerfile += `    gcc \\\n`
      dockerfile += `    musl-dev \\\n`
      dockerfile += `    libffi-dev \\\n`
      dockerfile += `    openssl-dev \\\n`
      dockerfile += `    curl\n`
    }

    // Copy requirements and install Python dependencies
    if (hasRequirements) {
      dockerfile += `COPY requirements.txt .\n`
      dockerfile += `RUN pip install --no-cache-dir -r requirements.txt\n`
    }

    // Install common Telegram bot dependencies
    dockerfile += `RUN pip install --no-cache-dir \\\n`
    dockerfile += `    python-telegram-bot \\\n`
    dockerfile += `    requests \\\n`
    dockerfile += `    aiohttp \\\n`
    dockerfile += `    asyncio \\\n`
    dockerfile += `    python-dotenv\n`

    // Copy bot file
    dockerfile += `COPY bot.py .\n`
    
    // Add health check endpoint
    dockerfile += `RUN pip install flask\n`
    dockerfile += `COPY health_check.py .\n`
    
    // Start both health check and bot
    dockerfile += `CMD ["sh", "-c", "python health_check.py & python bot.py"]\n`
    
    return dockerfile
  }

  async startContainer(botId: string): Promise<void> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        throw new Error("Container not found")
      }

      await execAsync(`docker start ${containerId}`)

      // Update database status (disabled for build)
      console.log(`Container ${containerId} started for bot ${botId}`)
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

      // Update database status (disabled for build)
      console.log(`Container ${containerId} stopped for bot ${botId}`)
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

      // Update database status (disabled for build)
      console.log(`Container ${containerId} restarted for bot ${botId}`)
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

      // Remove image
      const imageName = `telebot-${botId}`
      await execAsync(`docker rmi ${imageName} || true`)

      // Remove from mapping
      this.containers.delete(botId)

      // Update database status (disabled for build)
      console.log(`Container ${containerId} removed for bot ${botId}`)
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

  async getBotMetrics(botId: string): Promise<BotMetrics> {
    try {
      const containerId = this.containers.get(botId)
      if (!containerId) {
        return {
          messagesProcessed: 0,
          uptimeSeconds: 0,
          memoryUsageMB: 0,
          cpuUsagePercent: 0,
          errorCount: 0,
          lastActivity: new Date()
        }
      }

      // Get container stats
      const { stdout: statsOutput } = await execAsync(
        `docker stats ${containerId} --no-stream --format="{{.MemPerc}} {{.CPUPerc}}"`
      )
      const [memoryPercent, cpuPercent] = statsOutput.trim().split(" ")
      
      // Get uptime
      const { stdout: uptimeOutput } = await execAsync(
        `docker inspect ${containerId} --format='{{.State.StartedAt}}'`
      )
      const startTime = new Date(uptimeOutput.trim())
      const uptimeSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)

      // Get logs to count messages and errors
      const logs = await this.getContainerLogs(botId, 1000)
      const messagesProcessed = logs.filter(log => log.includes("message") || log.includes("update")).length
      const errorCount = logs.filter(log => log.toLowerCase().includes("error") || log.toLowerCase().includes("exception")).length

      return {
        messagesProcessed,
        uptimeSeconds,
        memoryUsageMB: parseFloat(memoryPercent.replace("%", "")) || 0,
        cpuUsagePercent: parseFloat(cpuPercent.replace("%", "")) || 0,
        errorCount,
        lastActivity: new Date()
      }
    } catch (error) {
      console.error("Failed to get bot metrics:", error)
      return {
        messagesProcessed: 0,
        uptimeSeconds: 0,
        memoryUsageMB: 0,
        cpuUsagePercent: 0,
        errorCount: 0,
        lastActivity: new Date()
      }
    }
  }

  async getAllContainersStatus(): Promise<Map<string, ContainerStatus>> {
    const statusMap = new Map<string, ContainerStatus>()
    
    for (const [botId, containerId] of this.containers) {
      const status = await this.getContainerStatus(botId)
      statusMap.set(botId, status)
    }
    
    return statusMap
  }

  // Initialize containers from database on startup (disabled for build)
  async initializeContainers(): Promise<void> {
    try {
      console.log("Container initialization disabled for build")
    } catch (error) {
      console.error("Failed to initialize containers:", error)
    }
  }

  // Get system resources
  async getSystemResources(): Promise<{
    totalMemory: string
    usedMemory: string
    totalCpu: string
    usedCpu: string
    containerCount: number
  }> {
    try {
      const { stdout: memoryInfo } = await execAsync("free -h | grep Mem")
      const { stdout: cpuInfo } = await execAsync("top -bn1 | grep 'Cpu(s)'")
      const { stdout: containerCount } = await execAsync("docker ps -q | wc -l")

      return {
        totalMemory: memoryInfo.split(/\s+/)[1] || "0",
        usedMemory: memoryInfo.split(/\s+/)[2] || "0",
        totalCpu: "100%",
        usedCpu: cpuInfo.match(/(\d+\.\d+)%us/)?.[1] + "%" || "0%",
        containerCount: parseInt(containerCount.trim()) || 0
      }
    } catch (error) {
      console.error("Failed to get system resources:", error)
      return {
        totalMemory: "0",
        usedMemory: "0",
        totalCpu: "0%",
        usedCpu: "0%",
        containerCount: 0
      }
    }
  }
}
