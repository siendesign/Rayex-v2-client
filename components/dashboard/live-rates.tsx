import { TrendingUp, TrendingDown } from "lucide-react"

const rates = [
  { from: "USD", to: "EUR", flag1: "🇺🇸", flag2: "🇪🇺", rate: "0.92", change: "+0.12%", up: true },
  { from: "USD", to: "GBP", flag1: "🇺🇸", flag2: "🇬🇧", rate: "0.79", change: "-0.05%", up: false },
  { from: "USD", to: "JPY", flag1: "🇺🇸", flag2: "🇯🇵", rate: "149.50", change: "+0.34%", up: true },
  { from: "EUR", to: "GBP", flag1: "🇪🇺", flag2: "🇬🇧", rate: "0.86", change: "+0.08%", up: true },
  { from: "GBP", to: "JPY", flag1: "🇬🇧", flag2: "🇯🇵", rate: "189.24", change: "-0.15%", up: false },
]

export function LiveRates() {
  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Live Exchange Rates</h3>
        <span className="text-xs text-muted-foreground">Updated 2 min ago</span>
      </div>

      <div className="space-y-3">
        {rates.map((rate, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <span className="text-2xl">{rate.flag1}</span>
                <span className="text-2xl -ml-2">{rate.flag2}</span>
              </div>
              <div>
                <div className="font-medium">
                  {rate.from}/{rate.to}
                </div>
                <div className="text-sm text-muted-foreground">{rate.rate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${rate.up ? 'text-green-600' : 'text-red-600'}`}>
                {rate.change}
              </span>
              {rate.up ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
