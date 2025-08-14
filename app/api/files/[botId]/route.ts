import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { botId: string } }) {
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

    const { botId } = params

    // Get file metadata from database
    const { data: files, error: dbError } = await supabase
      .from("bot_files")
      .select("*")
      .eq("bot_id", botId)
      .eq("uploaded_by", user.id)

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { botId: string } }) {
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

    const { fileId } = await request.json()
    const { botId } = params

    // Get file record from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from("bot_files")
      .select("*")
      .eq("id", fileId)
      .eq("bot_id", botId)
      .eq("uploaded_by", user.id)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    const { del } = await import("@vercel/blob")
    await del(fileRecord.blob_url)

    // Delete from database
    const { error: deleteError } = await supabase.from("bot_files").delete().eq("id", fileId)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete file record" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
