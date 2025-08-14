import { put } from "@vercel/blob"
import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const botId = formData.get("botId") as string
    const fileType = formData.get("fileType") as string // 'bot' or 'requirements'

    if (!file || !botId || !fileType) {
      return NextResponse.json(
        {
          error: "Missing required fields: file, botId, fileType",
        },
        { status: 400 },
      )
    }

    // Validate file type
    if (fileType === "bot" && !file.name.endsWith(".py")) {
      return NextResponse.json(
        {
          error: "Bot file must be a Python (.py) file",
        },
        { status: 400 },
      )
    }

    if (fileType === "requirements" && !file.name.endsWith(".txt")) {
      return NextResponse.json(
        {
          error: "Requirements file must be a text (.txt) file",
        },
        { status: 400 },
      )
    }

    // Create organized file path: user_id/bot_id/file_type/filename
    const filePath = `${user.id}/${botId}/${fileType}/${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: "private", // Using private access for security
    })

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabase
      .from("bot_files")
      .upsert({
        bot_id: botId,
        file_type: fileType,
        filename: file.name,
        file_path: filePath,
        blob_url: blob.url,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: file.name,
        size: file.size,
        type: file.type,
        url: blob.url,
        fileType: fileType,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
