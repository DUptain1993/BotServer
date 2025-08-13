import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Zap, BarChart3, Shield, Users, Smartphone } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Easy Bot Upload",
    description: "Upload your bot.py and requirements.txt in seconds with our intuitive interface",
  },
  {
    icon: Zap,
    title: "One-Click Deployment",
    description: "Instantly deploy bots to our backend server with just a single tap",
  },
  {
    icon: BarChart3,
    title: "Live Status & Logs",
    description: "Monitor your bot's real-time status, logs, and errors from anywhere",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Manage everything easily on mobile with our responsive interface",
  },
  {
    icon: Shield,
    title: "Safe & Private",
    description: "Your bot files and data are secure with enterprise-grade protection",
  },
  {
    icon: Users,
    title: "For Everyone",
    description: "Perfect for developers, beginners, and anyone wanting hassle-free bot hosting",
  },
]

export function FeatureCards() {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Why Choose TeleBot Server?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to host and manage your Telegram bots, designed for simplicity and efficiency.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-heading text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
