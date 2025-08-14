export interface BotFile {
  id: string
  filename: string
  file_type: "bot" | "requirements"
  file_size: number
  blob_url: string
  uploaded_at: string
}

export async function uploadBotFile(file: File, botId: string, fileType: "bot" | "requirements"): Promise<BotFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("botId", botId)
  formData.append("fileType", fileType)

  const response = await fetch("/api/files/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Upload failed")
  }

  const result = await response.json()
  return result.file
}

export async function getBotFiles(botId: string): Promise<BotFile[]> {
  const response = await fetch(`/api/files/${botId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch files")
  }

  const result = await response.json()
  return result.files
}

export async function deleteBotFile(botId: string, fileId: string): Promise<void> {
  const response = await fetch(`/api/files/${botId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Delete failed")
  }
}
