"use client"

import { useState } from "react"
import { ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const currencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
]

const exchangeRates: { [key: string]: number } = {
  "USD-EUR": 0.92,
  "USD-GBP": 0.79,
  "USD-JPY": 149.5,
  "USD-AUD": 1.52,
  "USD-CAD": 1.36,
  "EUR-USD": 1.09,
  "GBP-USD": 1.27,
  "JPY-USD": 0.0067,
  "AUD-USD": 0.66,
  "CAD-USD": 0.74,
}

export function ExchangeCalculator() {
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("1000")

  const getExchangeRate = () => {
    const key = `${fromCurrency}-${toCurrency}`
    return exchangeRates[key] || 1
  }

  const convertedAmount = (parseFloat(amount) || 0) * getExchangeRate()

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <section className="py-20 px-4 md:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Calculate Exchange
          </h2>
          <p className="text-xl text-muted-foreground">
            See how much you&apos;ll get with our live exchange rates
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8 space-y-6">
            {/* From Currency */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">You send</label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 text-2xl h-14"
                  placeholder="0.00"
                />
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="w-40 h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapCurrencies}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Swap currencies"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* To Currency */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Recipient gets</label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={convertedAmount.toFixed(2)}
                  readOnly
                  className="flex-1 text-2xl h-14 bg-muted"
                />
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-40 h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Exchange rate</span>
                <span className="font-medium">
                  1 {fromCurrency} = {getExchangeRate().toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium text-green-600">$0.00</span>
              </div>
            </div>

            <Button className="w-full h-12">Continue</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
