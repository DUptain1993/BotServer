"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Loader2, Play, Square, BarChart3, ExternalLink, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"

export type DeploymentStatus = "idle" | "uploading" | "installing" | "deploying" | "running" | "error" | "stopped"

export interface BotDeployment {
  id: string
  name: string
  status: DeploymentStatus
  progress: number
  logs: string[]
  deployedAt?: Date
  url?: string
  error?: string
}

interface DeploymentDashboardProps {
  botFile: File | null
  requirementsFile: File | null
  onDeploy?: () => void
}

export function DeploymentDashboard({ botFile, requirementsFile, onDeploy }: DeploymentDashboardProps) {
  const [deployments, setDeployments] = useState<BotDeployment[]>([])
  const [currentDeployment, setCurrentDeployment] = useState<BotDeployment | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)

  const startDeployment = async () => {
    if (!botFile || !requirementsFile || isDeploying) return

    setIsDeploying(true)

    try {
      // First upload files
      const uploadResponse = await apiClient.uploadFiles(botFile, requirementsFile)

      if (uploadResponse.error) {
        console.error("Upload failed:", uploadResponse.error)
        return
      }

      // Then deploy
      const botName = botFile.name.replace(".py", "")
      const deployResponse = await apiClient.deployBot(
        botName,
        uploadResponse.data?.files.botFile.content || "",
        uploadResponse.data?.files.requirementsFile.content || "",
      )

      if (deployResponse.error) {
        console.error("Deployment failed:", deployResponse.error)
        return
      }

      const newDeployment: BotDeployment = {
        id: deployResponse.data?.deploymentId || Date.now().toString(),
        name: botName,
        status: "deploying",
        progress: 0,
        logs: ["Starting deployment..."],
      }

      setCurrentDeployment(newDeployment)
      setDeployments((prev) => [newDeployment, ...prev])

      // Poll for status updates
      pollDeploymentStatus(newDeployment.id)
      onDeploy?.()
    } catch (error) {
      console.error("Deployment error:", error)
    } finally {
      setIsDeploying(false)
    }
  }

  const pollDeploymentStatus = async (deploymentId: string) => {
    const pollInterval = setInterval(async () => {
      const response = await apiClient.getBotStatus(deploymentId)

      if (response.data) {
        const updatedDeployment: BotDeployment = {
          id: deploymentId,
          name: response.data.id,
          status: response.data.status as DeploymentStatus,
          progress: response.data.progress,
          logs: response.data.logs,
          url: response.data.url,
          error: response.data.error,
          ...(response.data.status === "running" && { deployedAt: new Date() }),
        }

        setCurrentDeployment(updatedDeployment)
        setDeployments((prev) => prev.map((d) => (d.id === deploymentId ? updatedDeployment : d)))

        // Stop polling when deployment is complete
        if (response.data.status === "running" || response.data.status === "error") {
          clearInterval(pollInterval)
          if (response.data.status === "running") {
            setCurrentDeployment(null)
          }
        }
      }
    }, 2000)

    // Clean up after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000)
  }

  const controlBot = async (id: string, action: "start" | "stop" | "restart") => {
    const response = await apiClient.controlBot(id, action)

    if (response.data) {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: response.data?.status as DeploymentStatus,
                logs: response.data?.logs || d.logs,
              }
            : d,
        ),
      )
    }
  }

  const getStatusIcon = (status: DeploymentStatus) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "stopped":
        return <Square className="w-5 h-5 text-gray-500" />
      case "uploading":
      case "installing":
      case "deploying":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case "running":
        return "bg-emerald-500"
      case "error":
        return "bg-red-500"
      case "stopped":
        return "bg-gray-500"
      case "uploading":
      case "installing":
      case "deploying":
        return "bg-primary"
      default:
        return "bg-gray-400"
    }
  }

  const isReadyToDeploy = botFile && requirementsFile && !currentDeployment && !isDeploying

  return (
    <div className="space-y-6">
      {/* Deploy Button */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Button
            size="lg"
            className={cn(
              "w-full h-14 text-lg font-semibold transition-all duration-200",
              isReadyToDeploy
                ? "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            disabled={!isReadyToDeploy}
            onClick={startDeployment}
          >
            {currentDeployment || isDeploying ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Deploying...
              </>
            ) : isReadyToDeploy ? (
              <>
                <Play className="w-6 h-6 mr-2" />
                Deploy Bot Now
              </>
            ) : (
              <>
                <Clock className="w-6 h-6 mr-2" />
                Upload Files to Deploy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Deployment Progress */}
      {currentDeployment && (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-3">
              {getStatusIcon(currentDeployment.status)}
              Deploying {currentDeployment.name}
            </CardTitle>
            <CardDescription>
              {currentDeployment.status === "running"
                ? "Deployment completed successfully!"
                : "Deployment in progress..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{currentDeployment.status}</span>
                <span>{currentDeployment.progress}%</span>
              </div>
              <Progress value={currentDeployment.progress} className="h-2" />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 max-h-32 overflow-y-auto">
              <div className="space-y-1 text-sm font-mono">
                {currentDeployment.logs.map((log, index) => (
                  <div key={index} className="text-slate-600">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployed Bots List */}
      {deployments.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              Your Deployed Bots
            </CardTitle>
            <CardDescription>Manage and monitor your active bot deployments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <h4 className="font-medium">{deployment.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={cn("text-white", getStatusColor(deployment.status))}>
                          {deployment.status}
                        </Badge>
                        {deployment.deployedAt && (
                          <span className="text-sm text-muted-foreground">
                            {deployment.deployedAt.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {deployment.url && deployment.status === "running" && (
                      <Button variant="outline" size="sm" onClick={() => window.open(deployment.url, "_blank")}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                    )}

                    {deployment.status === "running" && (
                      <Button variant="outline" size="sm" onClick={() => controlBot(deployment.id, "stop")}>
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    )}

                    {deployment.status === "stopped" && (
                      <Button variant="outline" size="sm" onClick={() => controlBot(deployment.id, "start")}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Restart
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
