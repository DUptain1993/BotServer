import { BotManagementApp } from "@/components/bot-management-app"
import { FeatureCards } from "@/components/feature-cards"
import { HeroSection } from "@/components/hero-section"
import { AppHeader } from "@/components/app-header"

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <HeroSection />
          <BotManagementApp />
          <FeatureCards />
        </div>
      </main>
    </>
  )
}
