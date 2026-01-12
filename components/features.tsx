import { Shield, Zap, Globe, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const features = [
  {
    icon: Zap,
    title: "Fast & Simple",
    description:
      "Create an order, send your money, and we'll handle the exchange and transfer - usually within 2-24 hours.",
  },
  {
    icon: TrendingDown,
    title: "Best Rates",
    description:
      "Get real-time exchange rates with transparent fees. Only 0.5% commission - much lower than traditional banks.",
  },
  {
    icon: Globe,
    title: "Send Anywhere",
    description:
      "Transfer to any bank account in 150+ countries. Support for both fiat currencies and cryptocurrencies.",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description:
      "Bank-level security for all transactions. Your money is safe every step of the way.",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why choose us
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We make currency exchange simple, transparent, and accessible to everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="border hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
