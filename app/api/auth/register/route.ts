import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

interface RegisterRequest {
  email: string
  password: string
  name: string
}

interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro" | "enterprise"
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name }: RegisterRequest = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists (in production, check database)
    // For demo, we'll just create a new user

    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name,
      plan: "free",
      createdAt: new Date().toISOString(),
    }

    // Create session token
    const sessionToken = Buffer.from(JSON.stringify({ userId: newUser.id, email })).toString("base64")

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("telebot-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
