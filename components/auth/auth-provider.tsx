"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default user data for the app
const defaultUser: User = {
  id: "local-user",
  email: "user@telegrambot.platform",
  name: "Bot Manager",
  avatar: "",
  plan: "free",
  createdAt: new Date()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage or use default
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem("telebot-user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
          })
        } else {
          // Set default user and save to localStorage
          setUser(defaultUser)
          localStorage.setItem("telebot-user", JSON.stringify(defaultUser))
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
        // Use default user if localStorage fails
        setUser(defaultUser)
        localStorage.setItem("telebot-user", JSON.stringify(defaultUser))
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

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
    <AuthContext.Provider value={{ user, isLoading, updateProfile }}>
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