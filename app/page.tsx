import { BotManagementApp } from "@/components/bot-management-app"
import { HeroSection } from "@/components/hero-section"
import { AppHeader } from "@/components/app-header"

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <HeroSection />
          <BotManagementApp />
        </div>
      </main>
    </>
  )
}
