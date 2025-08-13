import { Bot, Smartphone, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="text-center mb-12">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
        Host Your Telegram Bots for <span className="text-primary">FREE</span>
      </h1>

      <p className="text-xl text-muted-foreground mb-2">Straight from Your Phone!</p>

      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Effortless Bot Management at Your Fingertips. Whether you're a pro or just starting, our platform makes bot
        deployment seamless.
      </p>

      <div className="flex items-center justify-center gap-2 text-accent font-medium">
        <Zap className="w-5 h-5" />
        <span>Deploy Your Bot in Just a Few Taps!</span>
      </div>
    </section>
  )
}
