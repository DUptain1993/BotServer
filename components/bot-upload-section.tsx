"use client"

import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Code, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BotUploadSectionProps {
  botFile: File | null
  setBotFile: (file: File | null) => void
  requirementsFile: File | null
  setRequirementsFile: (file: File | null) => void
}

export function BotUploadSection({
  botFile,
  setBotFile,
  requirementsFile,
  setRequirementsFile,
}: BotUploadSectionProps) {
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach((file) => {
      if (file.name.endsWith(".py")) {
        setBotFile(file)
      } else if (file.name === "requirements.txt") {
        setRequirementsFile(file)
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "bot" | "requirements") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "bot") {
        setBotFile(file)
      } else {
        setRequirementsFile(file)
      }
    }
  }

  return (
    <section>
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="font-heading text-2xl text-foreground">Upload Your Bot Files</CardTitle>
          <CardDescription className="text-base">
            Upload your bot.py and requirements.txt files to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
              dragActive
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/25 hover:border-primary/50",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Drag & drop your files here</p>
            <p className="text-muted-foreground">or click the buttons below to browse</p>
          </div>

          {/* File Upload Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bot File Upload */}
            <div className="space-y-3">
              <Label htmlFor="bot-file" className="text-base font-medium">
                Bot File (.py)
              </Label>
              <div className="relative">
                <Input
                  id="bot-file"
                  type="file"
                  accept=".py"
                  onChange={(e) => handleFileChange(e, "bot")}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 bg-transparent"
                  onClick={() => document.getElementById("bot-file")?.click()}
                >
                  <Code className="w-5 h-5" />
                  {botFile ? botFile.name : "Choose bot.py file"}
                </Button>
                {botFile && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />}
              </div>
            </div>

            {/* Requirements File Upload */}
            <div className="space-y-3">
              <Label htmlFor="requirements-file" className="text-base font-medium">
                Requirements File
              </Label>
              <div className="relative">
                <Input
                  id="requirements-file"
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange(e, "requirements")}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 bg-transparent"
                  onClick={() => document.getElementById("requirements-file")?.click()}
                >
                  <FileText className="w-5 h-5" />
                  {requirementsFile ? requirementsFile.name : "Choose requirements.txt"}
                </Button>
                {requirementsFile && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
