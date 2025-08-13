interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl = "/api"

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Request failed" }
      }

      return { data }
    } catch (error) {
      console.error("API request failed:", error)
      return { error: "Network error" }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // Bot methods
  async deployBot(botName: string, botFile: string, requirementsFile: string) {
    return this.request("/bots/deploy", {
      method: "POST",
      body: JSON.stringify({ botName, botFile, requirementsFile }),
    })
  }

  async getBotStatus(id: string) {
    return this.request(`/bots/${id}/status`)
  }

  async controlBot(id: string, action: "start" | "stop" | "restart") {
    return this.request(`/bots/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ action }),
    })
  }

  async getBotMetrics() {
    return this.request("/bots/metrics")
  }

  // File upload
  async uploadFiles(botFile: File, requirementsFile: File) {
    const formData = new FormData()
    formData.append("botFile", botFile)
    formData.append("requirementsFile", requirementsFile)

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Upload failed" }
      }

      return { data }
    } catch (error) {
      console.error("Upload failed:", error)
      return { error: "Network error" }
    }
  }
}

export const apiClient = new ApiClient()
