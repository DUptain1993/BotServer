import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface RegisterRequest {
  email: string
  password: string
  name: string
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

    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Registration failed" }, { status: 400 })
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: name,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name,
        plan: "free",
        createdAt: data.user.created_at,
      },
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
