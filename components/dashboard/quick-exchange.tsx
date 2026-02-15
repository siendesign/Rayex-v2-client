"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, Calculator, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetCurrenciesQuery, useGetExchangeRatesQuery } from "@/state/api"
import Image from "next/image"

export function QuickExchange() {
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
    return rateItem ? rateItem.sellRate : 1
  }

  const rate = getExchangeRate()
  const convertedAmount = (parseFloat(amount) || 0) / rate

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

  const isLoading = currenciesLoading || ratesLoading

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-4 md:p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading rates...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-4 md:p-6">
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
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {validFromCurrencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    <div className="flex items-center gap-2">
                      {currency.flagUrl ? (
                        <div className="relative w-5 h-3 overflow-hidden rounded-sm">
                          <Image
                            src={currency.flagUrl}
                            alt={currency.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span>{currency.flag}</span>
                      )}
                      <span>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!exchangeRates.some(r => r.fromCurrency.code === toCurrency && r.toCurrency.code === fromCurrency && r.active)}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Recipient gets</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: toCurrencyObj?.decimals || 2,
                maximumFractionDigits: toCurrencyObj?.decimals || 2
              })}
              readOnly
              className="flex-1 bg-muted"
            />
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {validToCurrencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    <div className="flex items-center gap-2">
                      {currency.flagUrl ? (
                        <div className="relative w-5 h-3 overflow-hidden rounded-sm">
                          <Image
                            src={currency.flagUrl}
                            alt={currency.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xl">{currency.flag}</span>
                      )}
                      <span>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange rate</span>
            <span className="font-medium">1 {toCurrency} = {rate.toFixed(4)} {fromCurrency}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Recipient gets</span>
            <span className="font-bold">
              {convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: toCurrencyObj?.decimals || 2,
                maximumFractionDigits: toCurrencyObj?.decimals || 2
              })} {toCurrency}
            </span>
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
