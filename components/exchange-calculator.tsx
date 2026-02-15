"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, Loader2 } from "lucide-react"
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
import { useGetCurrenciesQuery, useGetExchangeRatesQuery } from "@/state/api"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function ExchangeCalculator() {
  const router = useRouter()
  const { data: currenciesData, isLoading: currenciesLoading } = useGetCurrenciesQuery()
  const { data: ratesData, isLoading: ratesLoading } = useGetExchangeRatesQuery()

  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("1000")

  const currencies = currenciesData?.data || []
  const exchangeRates = ratesData?.data || []

  // Get currencies that have at least one active exchange rate as the from-currency
  const activeFromCurrencyCodes = Array.from(new Set(exchangeRates.filter(r => r.active).map(r => r.fromCurrency.code)))
  const validFromCurrencies = currencies.filter(c => activeFromCurrencyCodes.includes(c.code))

  const validToCurrencyCodes = exchangeRates
    .filter((r) => r.fromCurrency.code === fromCurrency && r.active)
    .map((r) => r.toCurrency.code)

  const validToCurrencies = currencies.filter((c) =>
    validToCurrencyCodes.includes(c.code)
  )

  const toCurrencyObj = currencies.find(c => c.code === toCurrency)

  // Auto-switch toCurrency if it's no longer valid
  useEffect(() => {
    if (validToCurrencyCodes.length > 0 && !validToCurrencyCodes.includes(toCurrency)) {
      setToCurrency(validToCurrencyCodes[0])
    }
  }, [fromCurrency, validToCurrencyCodes, toCurrency])

  const getExchangeRate = () => {
    const rateItem = exchangeRates.find(
      (r) => r.fromCurrency.code === fromCurrency && r.toCurrency.code === toCurrency
    )
    return rateItem ? rateItem.sellRate : 1 // Using sellRate for calculator
  }

  const convertedAmount = (parseFloat(amount) || 0) / getExchangeRate()

  const swapCurrencies = () => {
    // Only swap if the reverse pair is also valid
    const reversePairExists = exchangeRates.some(
      (r) => r.fromCurrency.code === toCurrency && r.toCurrency.code === fromCurrency && r.active
    )
    if (reversePairExists) {
      setFromCurrency(toCurrency)
      setToCurrency(fromCurrency)
    }
  }

  const handleContinue = () => {
    const params = new URLSearchParams({
      from: fromCurrency,
      to: toCurrency,
      amount: amount
    })
    router.push(`/create-order?${params.toString()}`)
  }

  const isLoading = currenciesLoading || ratesLoading

  if (isLoading) {
    return (
      <section className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading exchange rates...</p>
        </div>
      </section>
    )
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
                  <SelectTrigger className="w-44 h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validFromCurrencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.code}>
                        <span className="flex items-center gap-2">
                          {currency.flagUrl ? (
                            <div className="relative w-6 h-4 overflow-hidden rounded-sm border border-muted-foreground/20">
                              <Image
                                src={currency.flagUrl}
                                alt={currency.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="text-lg">{currency.flag}</span>
                          )}
                          <span className="font-medium">{currency.code}</span>
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
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Swap currencies"
                disabled={!exchangeRates.some(r => r.fromCurrency.code === toCurrency && r.toCurrency.code === fromCurrency && r.active)}
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
                  value={convertedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  readOnly
                  className="flex-1 text-2xl h-14 bg-muted"
                />
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-44 h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validToCurrencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.code}>
                        <span className="flex items-center gap-2">
                          {currency.flagUrl ? (
                            <div className="relative w-6 h-4 overflow-hidden rounded-sm border border-muted-foreground/20">
                              <Image
                                src={currency.flagUrl}
                                alt={currency.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="text-lg">{currency.flag}</span>
                          )}
                          <span className="font-medium">{currency.code}</span>
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
                  1 {toCurrency} = {getExchangeRate().toFixed(4)} {fromCurrency}
                </span>
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full h-12">Continue</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
