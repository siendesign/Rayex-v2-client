"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, ArrowLeft, Info, Bitcoin, Building2, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useUser } from "@clerk/nextjs"
import {
  useGetCurrenciesQuery,
  useGetExchangeRatesQuery,
  useGetPaymentMethodsQuery,
  useCreateOrderMutation
} from "@/state/api"

function CreateOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "crypto">("bank")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: currenciesData, isLoading: currenciesLoading } = useGetCurrenciesQuery()
  const { data: ratesData, isLoading: ratesLoading } = useGetExchangeRatesQuery()
  const { data: payoutMethodsData } = useGetPaymentMethodsQuery()
  const [createOrderMutation] = useCreateOrderMutation()

  // Exchange details
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("1000")

  // Initialize from search params
  useEffect(() => {
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const amt = searchParams.get("amount")

    if (from) setFromCurrency(from)
    if (to) setToCurrency(to)
    if (amt) setAmount(amt)
  }, [searchParams])

  // Recipient details
  const [recipientName, setRecipientName] = useState("")
  const [recipientBank, setRecipientBank] = useState("")
  const [recipientAccount, setRecipientAccount] = useState("")
  const [recipientSwift, setRecipientSwift] = useState("")

  const currencies = currenciesData?.data || []
  const exchangeRates = ratesData?.data || []
  const payoutMethods = payoutMethodsData?.data || []

  // Get valid to-currencies for the selected from-currency
  const validToCurrencyCodes = exchangeRates
    .filter((r) => r.fromCurrency.code === fromCurrency && r.active)
    .map((r) => r.toCurrency.code)

  const validToCurrencies = currencies.filter((c) =>
    validToCurrencyCodes.includes(c.code)
  )

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
  const toCurrencyObj = currencies.find(c => c.code === toCurrency)
  const convertedAmount = (parseFloat(amount) || 0) / rate

  const handleSubmit = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      alert("Please sign in to create an order")
      return
    }

    const fromCurrencyObj = currencies.find(c => c.code === fromCurrency)
    if (!fromCurrencyObj || !toCurrencyObj) {
      alert("Invalid currencies selected")
      return
    }

    // Find a payment method for the "from" currency and matching type (bank/crypto)
    const selectedPayoutMethod = payoutMethods.find(
      pm => pm.currencyId === fromCurrencyObj.id && pm.type === paymentMethod && pm.active
    )

    if (!selectedPayoutMethod) {
      alert(`No active ${paymentMethod} payment method found. Please contact support.`)
      return
    }

    try {
      setIsSubmitting(true)
      const orderData = {
        userEmail: user.primaryEmailAddress.emailAddress,
        fromCurrencyId: fromCurrencyObj.id,
        fromAmount: parseFloat(amount),
        toCurrencyId: toCurrencyObj.id,
        toAmount: convertedAmount,
        paymentMethodId: selectedPayoutMethod.id,
        recipientName,
        recipientBank,
        recipientAccountNumber: recipientAccount,
        recipientSwift,
        exchangeRate: rate,
      }

      const response = await createOrderMutation(orderData).unwrap()

      if (response.success) {
        // Navigate to payment instructions page with the new order ID
        router.push(`/order-payment/${response.data.id}`)
      }
    } catch (err: any) {
      console.error("Failed to create order:", err)
      alert(err.data?.message || "Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = currenciesLoading || ratesLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading exchange data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ... rest of the JSX ... */}
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Create Exchange Order</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {s}
                  </div>
                  <div>
                    <div className={`font-medium ${step >= s ? "" : "text-muted-foreground"}`}>
                      {s === 1 && "Exchange Details"}
                      {s === 2 && "Recipient Info"}
                      {s === 3 && "Review & Confirm"}
                    </div>
                  </div>
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step > s ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Exchange Details */}
        {step === 1 && (
          <div className="bg-card rounded-2xl border p-8">
            <h2 className="text-2xl font-bold mb-6">Exchange Details</h2>

            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">How will you pay?</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "bank" | "crypto")}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "bank"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <RadioGroupItem value="bank" id="bank" className="sr-only" />
                      <label htmlFor="bank" className="cursor-pointer flex items-start gap-3">
                        <Building2
                          className={`w-6 h-6 mt-1 ${paymentMethod === "bank" ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Bank Transfer</div>
                          <div className="text-sm text-muted-foreground">Send from your bank account</div>
                        </div>
                      </label>
                    </div>

                    <div
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "crypto"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <RadioGroupItem value="crypto" id="crypto" className="sr-only" />
                      <label htmlFor="crypto" className="cursor-pointer flex items-start gap-3">
                        <Bitcoin
                          className={`w-6 h-6 mt-1 ${paymentMethod === "crypto" ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Cryptocurrency</div>
                          <div className="text-sm text-muted-foreground">Send from your crypto wallet</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* From Currency */}
              <div>
                <Label htmlFor="from-amount" className="text-base font-semibold mb-3 block">
                  You send
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="from-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 h-14 text-lg"
                    placeholder="0.00"
                  />
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-44 h-14">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies
                        .filter((c) => (paymentMethod === "crypto" ? c.type === "crypto" : c.type === "fiat"))
                        .map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            <div className="flex items-center gap-2">
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
                  className="p-3 rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!exchangeRates.some(r => r.fromCurrency.code === toCurrency && r.toCurrency.code === fromCurrency && r.active)}
                  onClick={() => {
                    const reversePairExists = exchangeRates.some(
                      (r) => r.fromCurrency.code === toCurrency && r.toCurrency.code === fromCurrency && r.active
                    );
                    if (reversePairExists) {
                      setFromCurrency(toCurrency);
                      setToCurrency(fromCurrency);
                    }
                  }}
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* To Currency */}
              <div>
                <Label htmlFor="to-amount" className="text-base font-semibold mb-3 block">
                  Recipient receives
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="to-amount"
                    type="text"
                    value={convertedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                    readOnly
                    className="flex-1 h-14 text-lg bg-muted"
                  />
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-44 h-14">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {validToCurrencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.code}>
                          <div className="flex items-center gap-2">
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
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rate Breakdown */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-medium">
                        1 {toCurrency} = {rate.toFixed(4)} {fromCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-primary/20">
                      <span className="font-semibold">Recipient gets</span>
                      <span className="font-bold text-lg">
                        {(convertedAmount || 0).toFixed(2)} {toCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full h-12">
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Recipient Details */}
        {step === 2 && (
          <div className="bg-card rounded-2xl border p-8">
            <h2 className="text-2xl font-bold mb-6">Recipient Bank Details</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="recipient-name">Recipient Full Name</Label>
                <Input
                  id="recipient-name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={recipientBank}
                  onChange={(e) => setRecipientBank(e.target.value)}
                  placeholder="e.g., Deutsche Bank"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="account-number">Account Number / IBAN</Label>
                <Input
                  id="account-number"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="swift">SWIFT / BIC Code</Label>
                <Input
                  id="swift"
                  value={recipientSwift}
                  onChange={(e) => setRecipientSwift(e.target.value)}
                  placeholder="DEUTDEFF"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-12">
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border p-8">
              <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

              <div className="space-y-6">
                {/* Exchange Summary */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold mb-4">Exchange Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You send</span>
                      <span className="font-medium">
                        {amount} {fromCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient receives</span>
                      <span className="font-medium">
                        {convertedAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {toCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-medium">
                        1 {toCurrency} = {rate.toFixed(4)} {fromCurrency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold mb-4">Recipient Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{recipientName || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank</span>
                      <span className="font-medium">{recipientBank || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account</span>
                      <span className="font-medium font-mono text-sm">
                        {recipientAccount || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Next Steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          We&apos;ll provide our {paymentMethod === "bank" ? "bank account" : "crypto wallet"}{" "}
                          details
                        </li>
                        <li>
                          Send {amount} {fromCurrency} to the provided address
                        </li>
                        <li>We&apos;ll exchange and transfer to recipient (usually within 2-24 hours)</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 h-12" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Order...
                  </>
                ) : (
                  "Create Order"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreateOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <CreateOrderContent />
    </Suspense>
  )
}
