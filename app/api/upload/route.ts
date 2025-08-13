import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const botFile = formData.get("botFile") as File
    const requirementsFile = formData.get("requirementsFile") as File

    if (!botFile || !requirementsFile) {
      return NextResponse.json({ error: "Both files are required" }, { status: 400 })
    }

    // Validate file types
    if (!botFile.name.endsWith(".py")) {
      return NextResponse.json({ error: "Bot file must be a Python file (.py)" }, { status: 400 })
    }

    if (requirementsFile.name !== "requirements.txt") {
      return NextResponse.json({ error: "Requirements file must be named requirements.txt" }, { status: 400 })
    }

    // Read file contents
    const botContent = await botFile.text()
    const requirementsContent = await requirementsFile.text()

    // Basic validation
    if (!botContent.includes("telegram") && !botContent.includes("telebot")) {
      return NextResponse.json({ error: "Bot file doesn't appear to be a Telegram bot" }, { status: 400 })
    }

    // In production, save files to storage (S3, etc.)
    console.log("Bot file uploaded:", botFile.name, botFile.size, "bytes")
    console.log("Requirements file uploaded:", requirementsFile.name, requirementsFile.size, "bytes")

    return NextResponse.json({
      success: true,
      files: {
        botFile: {
          name: botFile.name,
          size: botFile.size,
          content: Buffer.from(botContent).toString("base64"),
        },
        requirementsFile: {
          name: requirementsFile.name,
          size: requirementsFile.size,
          content: Buffer.from(requirementsContent).toString("base64"),
        },
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
