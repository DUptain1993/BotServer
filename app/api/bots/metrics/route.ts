import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { DockerManager } from "@/lib/docker-manager"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Authentication required" 
      }, { status: 401 })
    }

    const dockerManager = DockerManager.getInstance()
    
    // Get user's bots
    const { data: bots, error: botsError } = await supabase
      .from("bots")
      .select(`
        id,
        name,
        status,
        platform,
        container_id,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)

    if (botsError) {
      console.error("Database error:", botsError)
      return NextResponse.json({ 
        error: "Failed to fetch bots" 
      }, { status: 500 })
    }

    // Get system resources
    const systemResources = await dockerManager.getSystemResources()

    // Get metrics for each bot
    const botMetrics = []
    for (const bot of bots || []) {
      const containerStatus = await dockerManager.getContainerStatus(bot.id)
      const metrics = await dockerManager.getBotMetrics(bot.id)
      
      botMetrics.push({
        id: bot.id,
        name: bot.name,
        status: bot.status,
        platform: bot.platform,
        containerStatus,
        metrics,
        createdAt: bot.created_at,
        updatedAt: bot.updated_at
      })
    }

    // Get recent bot logs
    const recentLogs = []
    for (const bot of bots || []) {
      const logs = await dockerManager.getContainerLogs(bot.id, 10)
      recentLogs.push({
        botId: bot.id,
        botName: bot.name,
        logs: logs.slice(-10) // Last 10 log entries
      })
    }

    // Get overall platform metrics
    const platformMetrics = {
      totalBots: bots?.length || 0,
      runningBots: bots?.filter(bot => bot.status === "running").length || 0,
      stoppedBots: bots?.filter(bot => bot.status === "stopped").length || 0,
      errorBots: bots?.filter(bot => bot.status === "error").length || 0,
      totalMessages: botMetrics.reduce((sum, bot) => sum + bot.metrics.messagesProcessed, 0),
      totalErrors: botMetrics.reduce((sum, bot) => sum + bot.metrics.errorCount, 0),
      averageUptime: botMetrics.length > 0 
        ? botMetrics.reduce((sum, bot) => sum + bot.metrics.uptimeSeconds, 0) / botMetrics.length 
        : 0
    }

    // Get real-time activity data
    const realTimeData = {
      timestamp: new Date().toISOString(),
      activeConnections: botMetrics.filter(bot => bot.status === "running").length,
      systemLoad: {
        memory: systemResources.usedMemory,
        cpu: systemResources.usedCpu,
        containers: systemResources.containerCount
      }
    }

    const response = {
      platformMetrics,
      systemResources,
      botMetrics,
      recentLogs,
      realTimeData
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Metrics error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// Prometheus metrics endpoint
export async function POST(request: NextRequest) {
  try {
    const { format = "json" } = await request.json()
    
    if (format === "prometheus") {
      const supabase = createServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({ 
          error: "Authentication required" 
        }, { status: 401 })
      }

      const dockerManager = DockerManager.getInstance()
      
      // Get user's bots
      const { data: bots } = await supabase
        .from("bots")
        .select("id, name, status")
        .eq("user_id", user.id)

      let prometheusMetrics = ""
      
      // System metrics
      const systemResources = await dockerManager.getSystemResources()
      prometheusMetrics += `# HELP platform_total_bots Total number of bots
# TYPE platform_total_bots gauge
platform_total_bots ${bots?.length || 0}

# HELP platform_running_bots Number of running bots
# TYPE platform_running_bots gauge
platform_running_bots ${bots?.filter(bot => bot.status === "running").length || 0}

# HELP platform_system_memory_usage System memory usage percentage
# TYPE platform_system_memory_usage gauge
platform_system_memory_usage ${parseFloat(systemResources.usedMemory.replace(/[^\d.]/g, "")) || 0}

# HELP platform_system_cpu_usage System CPU usage percentage
# TYPE platform_system_cpu_usage gauge
platform_system_cpu_usage ${parseFloat(systemResources.usedCpu.replace(/[^\d.]/g, "")) || 0}

# HELP platform_active_containers Number of active containers
# TYPE platform_active_containers gauge
platform_active_containers ${systemResources.containerCount}

`

      // Bot-specific metrics
      for (const bot of bots || []) {
        const metrics = await dockerManager.getBotMetrics(bot.id)
        const status = bot.status === "running" ? 1 : 0
        
        prometheusMetrics += `# HELP bot_messages_total Total messages processed by bot
# TYPE bot_messages_total counter
bot_messages_total{bot_id="${bot.id}",bot_name="${bot.name}"} ${metrics.messagesProcessed}

# HELP bot_errors_total Total errors encountered by bot
# TYPE bot_errors_total counter
bot_errors_total{bot_id="${bot.id}",bot_name="${bot.name}"} ${metrics.errorCount}

# HELP bot_uptime_seconds Bot uptime in seconds
# TYPE bot_uptime_seconds gauge
bot_uptime_seconds{bot_id="${bot.id}",bot_name="${bot.name}"} ${metrics.uptimeSeconds}

# HELP bot_memory_usage_mb Memory usage in MB
# TYPE bot_memory_usage_mb gauge
bot_memory_usage_mb{bot_id="${bot.id}",bot_name="${bot.name}"} ${metrics.memoryUsageMB}

# HELP bot_cpu_usage_percent CPU usage percentage
# TYPE bot_cpu_usage_percent gauge
bot_cpu_usage_percent{bot_id="${bot.id}",bot_name="${bot.name}"} ${metrics.cpuUsagePercent}

# HELP bot_status Bot health status (1=running, 0=stopped)
# TYPE bot_status gauge
bot_status{bot_id="${bot.id}",bot_name="${bot.name}"} ${status}

`
      }

      return new NextResponse(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })

  } catch (error) {
    console.error("Prometheus metrics error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
