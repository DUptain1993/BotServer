import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

interface LoginRequest {
  email: string
  password: string
}

interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro" | "enterprise"
  createdAt: string
}

// Mock user database
const mockUsers: Record<string, { password: string; user: User }> = {
  "demo@telebot.com": {
    password: "password123",
    user: {
      id: "1",
      email: "demo@telebot.com",
      name: "Demo User",
      plan: "free",
      createdAt: new Date().toISOString(),
    },
  },
  "admin@telebot.com": {
    password: "admin123",
    user: {
      id: "2",
      email: "admin@telebot.com",
      name: "Admin User",
      plan: "pro",
      createdAt: new Date().toISOString(),
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginRequest = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check credentials
    const userRecord = mockUsers[email.toLowerCase()]
    if (!userRecord || userRecord.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session token (in production, use proper JWT)
    const sessionToken = Buffer.from(JSON.stringify({ userId: userRecord.user.id, email })).toString("base64")

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("telebot-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ user: userRecord.user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
