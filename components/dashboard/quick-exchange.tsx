"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "BTC", name: "Bitcoin", flag: "₿" },
  { code: "ETH", name: "Ethereum", flag: "Ξ" },
]

export function QuickExchange() {
  const router = useRouter()
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("1000")

  const rate = 0.92
  const fee = parseFloat(amount || "0") * 0.005 // 0.5% fee
  const convertedAmount = (parseFloat(amount) || 0) * rate - fee

  return (
    <div className="bg-card rounded-2xl border p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Calculator className="size-4 md:size-5 text-primary" />
        <h3 className="text-sm md:text-base font-semibold">Rate Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* From */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">You send</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
              placeholder="0.00"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-24 md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <button className="p-2 rounded-full bg-muted hover:bg-muted/80">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Recipient gets</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={convertedAmount.toFixed(2)}
              readOnly
              className="flex-1 bg-muted"
            />
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-24 md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rate Info */}
        <div className="bg-muted rounded-lg p-3 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange rate</span>
            <span className="font-medium">1 {fromCurrency} = {rate} {toCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Our fee (0.5%)</span>
            <span className="font-medium">{fee.toFixed(2)} {toCurrency}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{convertedAmount.toFixed(2)} {toCurrency}</span>
          </div>
        </div>

        <Button
          onClick={() => router.push("/create-order")}
          className="w-full"
        >
          Create Order
        </Button>
      </div>
    </div>
  )
}
