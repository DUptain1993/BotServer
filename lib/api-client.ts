interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  // Mock implementation for Android app - no server dependencies
  
  // Auth methods - Mock for Android
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { data: { user: { id: "local-user", email, name: "System Administrator" } } }
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { data: { user: { id: "local-user", email, name } } }
  }

  async logout(): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { data: { success: true } }
  }

  // Bot methods - Mock for Android
  async deployBot(botName: string, botFile: string, requirementsFile: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { 
      data: { 
        deploymentId: `deploy_${Date.now()}`,
        status: "deploying"
      } 
    }
  }

  async getBotStatus(id: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const statuses = ["deploying", "running", "error", "stopped"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      data: {
        id,
        status: randomStatus,
        progress: randomStatus === "running" ? 100 : Math.floor(Math.random() * 90),
        logs: [
          `[${new Date().toISOString()}] Bot ${id} status: ${randomStatus}`,
          `[${new Date().toISOString()}] Deployment progress: ${randomStatus === "running" ? 100 : Math.floor(Math.random() * 90)}%`
        ],
        url: randomStatus === "running" ? `https://bot-${id}.matrix.local` : undefined,
        error: randomStatus === "error" ? "Simulated error for demo" : undefined
      }
    }
  }

  async controlBot(id: string, action: "start" | "stop" | "restart"): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const status = action === "stop" ? "stopped" : "running"
    
    return {
      data: {
        status,
        logs: [`[${new Date().toISOString()}] Bot ${id} ${action}ed successfully`]
      }
    }
  }

  async getBotMetrics(): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      data: {
        platform: {
          totalBots: 3,
          activeBots: 2,
          totalMemory: "8GB",
          usedMemory: "2.5GB",
          totalCpu: "100%",
          usedCpu: "45%"
        },
        bots: [
          {
            id: "bot_1",
            name: "Matrix Bot Alpha",
            status: "running",
            metrics: {
              messagesProcessed: 1250,
              uptimeSeconds: 86400,
              memoryUsageMB: 45.2,
              cpuUsagePercent: 12.5,
              errorCount: 2,
              lastActivity: new Date()
            }
          },
          {
            id: "bot_2", 
            name: "Hacker Bot Beta",
            status: "running",
            metrics: {
              messagesProcessed: 890,
              uptimeSeconds: 43200,
              memoryUsageMB: 38.7,
              cpuUsagePercent: 8.9,
              errorCount: 0,
              lastActivity: new Date()
            }
          },
          {
            id: "bot_3",
            name: "Security Bot Gamma", 
            status: "stopped",
            metrics: {
              messagesProcessed: 567,
              uptimeSeconds: 0,
              memoryUsageMB: 0,
              cpuUsagePercent: 0,
              errorCount: 5,
              lastActivity: new Date(Date.now() - 3600000)
            }
          }
        ]
      }
    }
  }

  // File upload - Mock for Android
  async uploadFiles(botFile: File, requirementsFile: File): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: {
        files: {
          botFile: { content: await botFile.text() },
          requirementsFile: { content: await requirementsFile.text() }
        }
      }
    }
  }
}

export const apiClient = new ApiClient()
