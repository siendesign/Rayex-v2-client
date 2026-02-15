"use client"

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useGetExchangeRatesQuery, api } from "@/state/api"
import Image from "next/image"
import { useSSE } from "@/hooks/useSSE"
import { useAppDispatch } from "@/state/redux"

export function LiveRates() {
  const dispatch = useAppDispatch()
  const { data: ratesData, isLoading } = useGetExchangeRatesQuery()
  const rates = ratesData?.data || []

  // Replace Socket.io with SSE
  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?role=public`;

  useSSE({
    url: sseUrl,
    events: {
      rate_updated: (updatedRate: any) => {
        console.log('🔔 SSE: Received rate_updated:', updatedRate)
        dispatch(
          api.util.updateQueryData('getExchangeRates' as any, undefined, (draft: any) => {
            if (draft && draft.data) {
              const index = draft.data.findIndex((r: any) => r.id === updatedRate.id)
              if (index !== -1) {
                console.log('✅ Updating local rate in cache')
                draft.data[index] = updatedRate
              } else {
                draft.data.unshift(updatedRate)
              }
            }
          })
        )
      }
    }
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading rates...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Live Exchange Rates</h3>
        <span className="text-xs text-muted-foreground">Live updates</span>
      </div>

      <div className="space-y-3">
        {rates.slice(0, 6).map((rateItem) => {
          const { fromCurrency, toCurrency, rate, previousRate } = rateItem

          // Calculate trend
          const change = previousRate
            ? ((rate - previousRate) / previousRate) * 100
            : 0
          const up = change >= 0
          const changeText = `${up ? "+" : ""}${change.toFixed(2)}%`

          return (
            <div
              key={rateItem.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {fromCurrency.flagUrl ? (
                    <div className="relative w-8 h-8 overflow-hidden rounded-full border-2 border-background shadow-sm">
                      <Image src={fromCurrency.flagUrl} alt={fromCurrency.code} fill className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-2xl">{fromCurrency.flag}</span>
                  )}
                  {toCurrency.flagUrl ? (
                    <div className="relative w-8 h-8 overflow-hidden rounded-full border-2 border-background shadow-sm -ml-3">
                      <Image src={toCurrency.flagUrl} alt={toCurrency.code} fill className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-2xl -ml-3">{toCurrency.flag}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {fromCurrency.code}/{toCurrency.code}
                  </div>
                  <div className="text-sm text-muted-foreground">{rate.toFixed(4)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
                  {changeText}
                </span>
                {up ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          )
        })}

        {rates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No rates available</p>
        )}
      </div>
    </div>
  )
}
