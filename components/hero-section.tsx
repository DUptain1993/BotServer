import { Bot, Zap, Skull } from "lucide-react"

export function HeroSection() {
  return (
    <section className="text-center mb-12 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-accent rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg red-glow border border-accent/20">
            <Bot className="w-10 h-10 text-accent" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center red-glow">
            <Skull className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <h1
        className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 glitch"
        data-text="UNLEASH THE POWER OF YOUR BOTS"
      >
        UNLEASH THE POWER OF <span className="text-accent">YOUR BOTS</span>
      </h1>

      <p className="text-xl text-accent font-medium mb-2">Join the Dark Side of Bot Development</p>

      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Where your code can roam free and wild. Deploy with confidence.{" "}
        <span className="text-accent">Conquer the platform.</span>
      </p>

      <div className="flex items-center justify-center gap-2 text-accent font-medium bg-primary/50 px-6 py-3 rounded-lg border border-accent/20 red-glow">
        <Zap className="w-5 h-5 animate-pulse" />
        <span>DOMINATE YOUR DEPLOYMENT</span>
      </div>
    </section>
  )
}
