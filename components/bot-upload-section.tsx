"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Code, Settings, AlertTriangle, CheckCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

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
  const [botName, setBotName] = useState("")
  const [botToken, setBotToken] = useState("")
  const [description, setDescription] = useState("")
  const [platform, setPlatform] = useState<"linux" | "android" | "windows">("linux")
  const [memory, setMemory] = useState("256m")
  const [cpu, setCpu] = useState("0.5")
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const onBotFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.name.endsWith(".py")) {
      setBotFile(file)
      setErrorMessage("")
    } else {
      setErrorMessage("Please upload a valid Python file (.py)")
    }
  }, [setBotFile])

  const onRequirementsDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.name === "requirements.txt") {
      setRequirementsFile(file)
      setErrorMessage("")
    } else {
      setErrorMessage("Please upload a valid requirements.txt file")
    }
  }, [setRequirementsFile])

  const { getRootProps: getBotRootProps, getInputProps: getBotInputProps, isDragActive: isBotDragActive } = useDropzone({
    onDrop: onBotFileDrop,
    accept: { "text/x-python": [".py"] },
    maxFiles: 1,
  })

  const { getRootProps: getRequirementsRootProps, getInputProps: getRequirementsInputProps, isDragActive: isRequirementsDragActive } = useDropzone({
    onDrop: onRequirementsDrop,
    accept: { "text/plain": [".txt"] },
    maxFiles: 1,
  })

  const validateBotToken = (token: string) => {
    return /^\d+:[A-Za-z0-9_-]{35}$/.test(token)
  }

  const handleDeploy = async () => {
    if (!botName || !botToken || !botFile) {
      setErrorMessage("Please fill in all required fields and upload a bot file")
      return
    }

    if (!validateBotToken(botToken)) {
      setErrorMessage("Please enter a valid Telegram bot token")
      return
    }

    setIsDeploying(true)
    setDeployStatus("idle")
    setErrorMessage("")

    try {
      // Convert files to base64
      const botFileContent = await fileToBase64(botFile)
      const requirementsFileContent = requirementsFile ? await fileToBase64(requirementsFile) : undefined

      const response = await fetch("/api/bots/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botName,
          description,
          botToken,
          botFile: botFileContent,
          requirementsFile: requirementsFileContent,
          platform,
          resources: {
            memory,
            cpu,
            storage: "1g"
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed")
      }

      setDeployStatus("success")
      // Reset form
      setBotName("")
      setBotToken("")
      setDescription("")
      setBotFile(null)
      setRequirementsFile(null)
      setPlatform("linux")
      setMemory("256m")
      setCpu("0.5")

    } catch (error) {
      setDeployStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Deployment failed")
    } finally {
      setIsDeploying(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data URL prefix
      }
      reader.onerror = error => reject(error)
    })
  }

  const getPlatformDescription = (platform: string) => {
    switch (platform) {
      case "linux":
        return "Best performance, recommended for production"
      case "android":
        return "Optimized for mobile and ARM architectures"
      case "windows":
        return "Windows-specific dependencies support"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Deploy New Bot
          </CardTitle>
          <CardDescription>
            Upload your Telegram bot files and configure deployment settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bot Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="botName">Bot Name *</Label>
              <Input
                id="botName"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="My Awesome Bot"
                className="mt-1"
              />
          </div>

            <div>
              <Label htmlFor="botToken">Bot Token *</Label>
                <Input
                id="botToken"
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your bot token from @BotFather on Telegram
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your bot does..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bot File Upload */}
            <div>
              <Label>Bot File (bot.py) *</Label>
              <div
                {...getBotRootProps()}
                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isBotDragActive
                    ? "border-blue-500 bg-blue-50"
                    : botFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getBotInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                  <Code className="w-8 h-8 text-gray-400" />
                  {botFile ? (
                    <div className="text-green-600">
                      <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                      <p className="font-medium">{botFile.name}</p>
                      <p className="text-sm">{(botFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">
                        {isBotDragActive ? "Drop the bot file here" : "Drag & drop bot.py here"}
                      </p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Requirements File Upload */}
            <div>
              <Label>Requirements File (requirements.txt)</Label>
              <div
                {...getRequirementsRootProps()}
                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isRequirementsDragActive
                    ? "border-blue-500 bg-blue-50"
                    : requirementsFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getRequirementsInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="w-8 h-8 text-gray-400" />
                  {requirementsFile ? (
                    <div className="text-green-600">
                      <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                      <p className="font-medium">{requirementsFile.name}</p>
                      <p className="text-sm">{(requirementsFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">
                        {isRequirementsDragActive ? "Drop requirements.txt here" : "Drag & drop requirements.txt here"}
                      </p>
                      <p className="text-sm text-gray-500">or click to browse (optional)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Configuration */}
          <div className="space-y-4">
            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(value: "linux" | "android" | "windows") => setPlatform(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linux">
                    <div className="flex items-center space-x-2">
                      <span>🐧 Linux</span>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="android">
                    <div className="flex items-center space-x-2">
                      <span>📱 Android</span>
                      <Badge variant="outline">ARM Optimized</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="windows">
                    <div className="flex items-center space-x-2">
                      <span>🪟 Windows</span>
                      <Badge variant="outline">Windows Dependencies</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {getPlatformDescription(platform)}
              </p>
            </div>

            {/* Resource Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memory">Memory Limit</Label>
                <Select value={memory} onValueChange={setMemory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128m">128 MB</SelectItem>
                    <SelectItem value="256m">256 MB</SelectItem>
                    <SelectItem value="512m">512 MB</SelectItem>
                    <SelectItem value="1g">1 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cpu">CPU Limit</Label>
                <Select value={cpu} onValueChange={setCpu}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">0.25 cores</SelectItem>
                    <SelectItem value="0.5">0.5 cores</SelectItem>
                    <SelectItem value="1.0">1.0 cores</SelectItem>
                    <SelectItem value="2.0">2.0 cores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {deployStatus === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Bot deployed successfully! Check the dashboard for status updates.</AlertDescription>
            </Alert>
          )}

          {/* Deploy Button */}
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !botName || !botToken || !botFile}
            className="w-full"
            size="lg"
          >
            {isDeploying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deploying...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Deploy Bot
              </>
            )}
          </Button>

          {/* Platform Features */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Platform Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Cross-platform support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Automatic dependency installation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Resource management</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Health checks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Auto-restart on failure</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
