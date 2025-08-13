"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotUploadSection } from "./bot-upload-section"
import { DeploymentDashboard } from "./deployment-dashboard"
import { BotMonitoringSystem } from "./bot-monitoring-system"
import { Upload, BarChart3, Activity } from "lucide-react"

export function BotManagementApp() {
  const [botFile, setBotFile] = useState<File | null>(null)
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null)

  return (
    <div className="space-y-8">
      <Tabs defaultValue="deploy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deploy" className="gap-2">
            <Upload className="w-4 h-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Activity className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6 mt-6">
          <BotUploadSection
            botFile={botFile}
            setBotFile={setBotFile}
            requirementsFile={requirementsFile}
            setRequirementsFile={setRequirementsFile}
          />
          <DeploymentDashboard botFile={botFile} requirementsFile={requirementsFile} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DeploymentDashboard botFile={botFile} requirementsFile={requirementsFile} />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <BotMonitoringSystem />
        </TabsContent>
      </Tabs>
    </div>
  )
}
