"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Server,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

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
  lastActivity: Date
}

interface LogEntry {
  timestamp: Date
  level: "info" | "warning" | "error"
  message: string
  botId: string
}

interface ChartData {
  time: string
  messages: number
  users: number
  errors: number
}

const mockMetrics: BotMetrics[] = [
  {
    id: "1",
    name: "weather-bot",
    status: "online",
    uptime: 99.8,
    totalMessages: 1247,
    activeUsers: 89,
    errorCount: 3,
    responseTime: 120,
    memoryUsage: 45,
    cpuUsage: 23,
    lastActivity: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    name: "support-bot",
    status: "online",
    uptime: 97.2,
    totalMessages: 892,
    activeUsers: 34,
    errorCount: 12,
    responseTime: 89,
    memoryUsage: 38,
    cpuUsage: 15,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
  },
]

const mockChartData: ChartData[] = [
  { time: "00:00", messages: 45, users: 12, errors: 0 },
  { time: "04:00", messages: 23, users: 8, errors: 1 },
  { time: "08:00", messages: 89, users: 25, errors: 0 },
  { time: "12:00", messages: 156, users: 42, errors: 2 },
  { time: "16:00", messages: 134, users: 38, errors: 1 },
  { time: "20:00", messages: 98, users: 28, errors: 0 },
]

const mockLogs: LogEntry[] = [
  { timestamp: new Date(Date.now() - 1 * 60 * 1000), level: "info", message: "Bot started successfully", botId: "1" },
  { timestamp: new Date(Date.now() - 3 * 60 * 1000), level: "info", message: "Processed 50 messages", botId: "1" },
  {
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    level: "warning",
    message: "High memory usage detected",
    botId: "2",
  },
  {
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    level: "error",
    message: "Failed to connect to external API",
    botId: "2",
  },
  {
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    level: "info",
    message: "User authentication successful",
    botId: "1",
  },
]

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7"]

export function BotMonitoringSystem() {
  const [selectedBot, setSelectedBot] = useState<string>("1")
  const [metrics, setMetrics] = useState<BotMetrics[]>(mockMetrics)
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const selectedBotMetrics = metrics.find((m) => m.id === selectedBot)

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500"
      case "offline":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`
  }

  const formatLastActivity = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold text-foreground">Bot Monitoring</h2>
          <p className="text-muted-foreground">Real-time performance and analytics</p>
        </div>
        <Button variant="outline" onClick={refreshData} disabled={isRefreshing} className="gap-2 bg-transparent">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Bot Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((bot) => (
          <Card
            key={bot.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedBot === bot.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedBot(bot.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium truncate">{bot.name}</h3>
                <Badge className={`${getStatusColor(bot.status)} text-white`}>{bot.status}</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">{formatUptime(bot.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span className="font-medium">{bot.totalMessages.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Users:</span>
                  <span className="font-medium">{bot.activeUsers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Monitoring */}
      {selectedBotMetrics && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-2xl font-bold">{formatUptime(selectedBotMetrics.uptime)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Messages</p>
                      <p className="text-2xl font-bold">{selectedBotMetrics.totalMessages.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">{selectedBotMetrics.activeUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold">{selectedBotMetrics.errorCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Bot Status Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span className="font-medium">{selectedBotMetrics.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity</span>
                      <span className="font-medium">{formatLastActivity(selectedBotMetrics.lastActivity)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Memory Usage</span>
                        <span className="font-medium">{selectedBotMetrics.memoryUsage}%</span>
                      </div>
                      <Progress value={selectedBotMetrics.memoryUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>CPU Usage</span>
                        <span className="font-medium">{selectedBotMetrics.cpuUsage}%</span>
                      </div>
                      <Progress value={selectedBotMetrics.cpuUsage} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Message Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Message Activity</CardTitle>
                  <CardDescription>Messages processed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="messages" stroke="#059669" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">User Activity</CardTitle>
                  <CardDescription>Active users throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-heading">Recent Logs</CardTitle>
                  <CardDescription>Real-time bot activity and error logs</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {logs
                    .filter((log) => log.botId === selectedBot)
                    .map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className={getLogLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{log.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{log.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Resource Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Resource Usage</CardTitle>
                  <CardDescription>Current system resource consumption</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Memory Usage
                      </span>
                      <span className="font-medium">{selectedBotMetrics.memoryUsage}%</span>
                    </div>
                    <Progress value={selectedBotMetrics.memoryUsage} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        CPU Usage
                      </span>
                      <span className="font-medium">{selectedBotMetrics.cpuUsage}%</span>
                    </div>
                    <Progress value={selectedBotMetrics.cpuUsage} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Response Time</CardTitle>
                  <CardDescription>Average response time trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-primary mb-2">{selectedBotMetrics.responseTime}ms</div>
                    <p className="text-muted-foreground">Average Response Time</p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">12% faster than yesterday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
