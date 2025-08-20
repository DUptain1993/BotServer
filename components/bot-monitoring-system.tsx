"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  Server
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

interface BotMetrics {
  id: string
  name: string
  status: string
  platform: string
  containerStatus: {
    status: string
    memoryUsage: string
    cpuUsage: string
    logs: string[]
  }
  metrics: {
    messagesProcessed: number
    uptimeSeconds: number
    memoryUsageMB: number
    cpuUsagePercent: number
  errorCount: number
  lastActivity: Date
  }
  createdAt: string
  updatedAt: string
}

interface SystemResources {
  totalMemory: string
  usedMemory: string
  totalCpu: string
  usedCpu: string
  containerCount: number
}

interface PlatformMetrics {
  totalBots: number
  runningBots: number
  stoppedBots: number
  errorBots: number
  totalMessages: number
  totalErrors: number
  averageUptime: number
}

interface RealTimeData {
  timestamp: string
  activeConnections: number
  systemLoad: {
    memory: string
    cpu: string
    containers: number
  }
}

export function BotMonitoringSystem() {
  const [botMetrics, setBotMetrics] = useState<BotMetrics[]>([])
  const [systemResources, setSystemResources] = useState<SystemResources | null>(null)
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/bots/metrics")
      if (!response.ok) {
        throw new Error("Failed to fetch metrics")
      }
      
      const data = await response.json()
      setBotMetrics(data.botMetrics || [])
      setSystemResources(data.systemResources)
      setPlatformMetrics(data.platformMetrics)
      setRealTimeData(data.realTimeData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "stopped":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      case "starting":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-4 h-4" />
      case "error":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatMemory = (mb: number) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  // Chart data for system resources
  const systemChartData = [
    { name: "Memory", value: parseFloat(systemResources?.usedMemory.replace(/[^\d.]/g, "") || "0") },
    { name: "CPU", value: parseFloat(systemResources?.usedCpu.replace(/[^\d.]/g, "") || "0") }
  ]

  // Chart data for bot activity
  const botActivityData = botMetrics.map(bot => ({
    name: bot.name,
    messages: bot.metrics.messagesProcessed,
    errors: bot.metrics.errorCount,
    memory: bot.metrics.memoryUsageMB
  }))

  if (isLoading) {
  return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics?.totalBots || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformMetrics?.runningBots || 0} running, {platformMetrics?.stoppedBots || 0} stopped
            </p>
                </CardContent>
              </Card>

              <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformMetrics?.totalErrors || 0} errors
            </p>
                </CardContent>
              </Card>

              <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Memory</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemResources?.usedMemory || "0"}</div>
            <p className="text-xs text-muted-foreground">
              of {systemResources?.totalMemory || "0"} total
            </p>
                </CardContent>
              </Card>

              <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemResources?.usedCpu || "0%"}</div>
            <p className="text-xs text-muted-foreground">
              {systemResources?.containerCount || 0} containers
            </p>
                </CardContent>
              </Card>
            </div>

      {/* Real-time Monitoring */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bots">Bot Details</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Resources Chart */}
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={systemChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {systemChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : "#ef4444"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                    <span>{systemResources?.usedMemory || "0"}</span>
                      </div>
                  <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                    <span>{systemResources?.usedCpu || "0%"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bot Activity Chart */}
              <Card>
                <CardHeader>
                <CardTitle>Bot Activity</CardTitle>
                <CardDescription>Message processing activity</CardDescription>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={botActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                    <Bar dataKey="messages" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {botMetrics.map((bot) => (
              <Card key={bot.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`}></div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <Badge variant="outline">{bot.platform}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(bot.status)}
                      <span className="text-sm capitalize">{bot.status}</span>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MessageSquare className="w-4 h-4" />
                        <span>Messages</span>
                      </div>
                      <div className="text-2xl font-bold">{bot.metrics.messagesProcessed}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Uptime</span>
                      </div>
                      <div className="text-2xl font-bold">{formatUptime(bot.metrics.uptimeSeconds)}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                                        <HardDrive className="w-4 h-4" />
                <span>Memory</span>
                      </div>
                      <div className="text-2xl font-bold">{formatMemory(bot.metrics.memoryUsageMB)}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Cpu className="w-4 h-4" />
                        <span>CPU</span>
                        </div>
                      <div className="text-2xl font-bold">{bot.metrics.cpuUsagePercent.toFixed(1)}%</div>
                        </div>
                      </div>
                  
                  {bot.metrics.errorCount > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">{bot.metrics.errorCount} errors detected</span>
                      </div>
                </div>
                  )}
              </CardContent>
            </Card>
            ))}
          </div>
          </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
              <Card>
                <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>{systemResources?.usedMemory || "0"} / {systemResources?.totalMemory || "0"}</span>
                  </div>
                  <Progress 
                    value={parseFloat(systemResources?.usedMemory.replace(/[^\d.]/g, "") || "0")} 
                    className="w-full" 
                  />
                </div>
                
                  <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>{systemResources?.usedCpu || "0%"}</span>
                    </div>
                  <Progress 
                    value={parseFloat(systemResources?.usedCpu.replace(/[^\d.]/g, "") || "0")} 
                    className="w-full" 
                  />
                  </div>
                
                  <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Containers</span>
                    <span>{systemResources?.containerCount || 0}</span>
                    </div>
                  <Progress 
                    value={(systemResources?.containerCount || 0) / 3 * 100} 
                    className="w-full" 
                  />
                  </div>
                </CardContent>
              </Card>

            {/* Real-time Activity */}
              <Card>
                <CardHeader>
                <CardTitle>Real-time Activity</CardTitle>
                <CardDescription>Live platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="font-bold">{realTimeData?.activeConnections || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Update</span>
                    <span className="text-sm text-muted-foreground">
                      {realTimeData?.timestamp ? new Date(realTimeData.timestamp).toLocaleTimeString() : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Uptime</span>
                    <span className="font-bold">{formatUptime(platformMetrics?.averageUptime || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Bot Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Bot Performance Trends</CardTitle>
                <CardDescription>Message processing over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={botActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  )
}
