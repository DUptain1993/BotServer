"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("telebot-user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
          })
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await apiClient.login(email, password)

      if (response.error) {
        console.error("Login failed:", response.error)
        return false
      }

      if (response.data?.user) {
        const userData = {
          ...response.data.user,
          createdAt: new Date(response.data.user.createdAt),
        }
        setUser(userData)
        localStorage.setItem("telebot-user", JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await apiClient.register(email, password, name)

      if (response.error) {
        console.error("Registration failed:", response.error)
        return false
      }

      if (response.data?.user) {
        const userData = {
          ...response.data.user,
          createdAt: new Date(response.data.user.createdAt),
        }
        setUser(userData)
        localStorage.setItem("telebot-user", JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("telebot-user")
    }
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("telebot-user", JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error("Profile update failed:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
