import { NextResponse } from "next/server"

interface BotMetrics {
  id: string
  name: string
  status: "online" | "offline" | "error"
  uptime: number
  totalMessages: number
  activeUsers: number
  errorCount: number
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  lastActivity: string
}

// Mock metrics data
const generateMockMetrics = (): BotMetrics[] => {
  return [
    {
      id: "1",
      name: "weather-bot",
      status: "online",
      uptime: 99.8,
      totalMessages: Math.floor(Math.random() * 2000) + 1000,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      errorCount: Math.floor(Math.random() * 10),
      responseTime: Math.floor(Math.random() * 200) + 50,
      memoryUsage: Math.floor(Math.random() * 60) + 20,
      cpuUsage: Math.floor(Math.random() * 40) + 10,
      lastActivity: new Date(Date.now() - Math.random() * 600000).toISOString(),
    },
    {
      id: "2",
      name: "support-bot",
      status: "online",
      uptime: 97.2,
      totalMessages: Math.floor(Math.random() * 1500) + 500,
      activeUsers: Math.floor(Math.random() * 50) + 20,
      errorCount: Math.floor(Math.random() * 15) + 5,
      responseTime: Math.floor(Math.random() * 150) + 70,
      memoryUsage: Math.floor(Math.random() * 50) + 30,
      cpuUsage: Math.floor(Math.random() * 30) + 5,
      lastActivity: new Date(Date.now() - Math.random() * 300000).toISOString(),
    },
  ]
}

export async function GET() {
  try {
    const metrics = generateMockMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Metrics error:", error)
    return NextResponse.json({ error: "Failed to get metrics" }, { status: 500 })
  }
}
