"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Bitcoin,
  Copy,
  CheckCircle2,
} from "lucide-react"

interface PaymentMethod {
  id: string
  type: "bank" | "crypto"
  name: string
  currency: string
  active: boolean
  details: {
    bankName?: string
    accountName?: string
    accountNumber?: string
    routingNumber?: string
    swift?: string
    iban?: string
    walletAddress?: string
    network?: string
  }
  instructions?: string
}

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "bank",
    name: "USD Bank Account",
    currency: "USD",
    active: true,
    details: {
      bankName: "XChange International Bank",
      accountName: "XChange Ltd.",
      accountNumber: "1234567890",
      routingNumber: "021000021",
      swift: "XCHGUS33",
    },
    instructions: "Please include your order ID in the payment reference.",
  },
  {
    id: "2",
    type: "bank",
    name: "EUR Bank Account",
    currency: "EUR",
    active: true,
    details: {
      bankName: "Deutsche Bank AG",
      accountName: "XChange Europe GmbH",
      iban: "DE89 3704 0044 0532 0130 00",
      swift: "DEUTDEFF",
    },
    instructions: "Include order reference in payment description.",
  },
  {
    id: "3",
    type: "crypto",
    name: "Bitcoin Wallet",
    currency: "BTC",
    active: true,
    details: {
      walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      network: "Bitcoin",
    },
    instructions:
      "Send exact amount shown in order. Include order ID in memo if possible.",
  },
  {
    id: "4",
    type: "crypto",
    name: "Ethereum Wallet",
    currency: "ETH",
    active: true,
    details: {
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      network: "Ethereum (ERC-20)",
    },
    instructions: "Ensure you&apos;re sending on the correct network.",
  },
  {
    id: "5",
    type: "bank",
    name: "GBP Bank Account",
    currency: "GBP",
    active: true,
    details: {
      bankName: "Barclays Bank",
      accountName: "XChange UK Ltd.",
      accountNumber: "12345678",
      swift: "BARCGB22",
      iban: "GB29 NWBK 6016 1331 9268 19",
    },
    instructions: "Reference must include order number.",
  },
]

export default function PaymentMethodsManagement() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    initialPaymentMethods
  )
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: "bank",
    name: "",
    currency: "USD",
    active: true,
    details: {},
    instructions: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingMethod) {
      setPaymentMethods(
        paymentMethods.map((m) =>
          m.id === editingMethod.id ? ({ ...m, ...formData } as PaymentMethod) : m
        )
      )
    } else {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: formData.type || "bank",
        name: formData.name || "",
        currency: formData.currency || "USD",
        active: formData.active ?? true,
        details: formData.details || {},
        instructions: formData.instructions,
      }
      setPaymentMethods([...paymentMethods, newMethod])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      type: "bank",
      name: "",
      currency: "USD",
      active: true,
      details: {},
      instructions: "",
    })
    setIsAddDialogOpen(false)
    setEditingMethod(null)
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
    setFormData(method)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      setPaymentMethods(paymentMethods.filter((m) => m.id !== id))
    }
  }

  const toggleActive = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage bank accounts and crypto wallets for receiving payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMethod(null)
                resetForm()
              }}
            >
              <Plus className="size-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMethod
                  ? "Edit Payment Method"
                  : "Add New Payment Method"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as "bank" | "crypto" })
                    }
                  >
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="USD, EUR, BTC, etc."
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., USD Bank Account"
                  required
                  className="mt-1"
                />
              </div>

              {formData.type === "bank" ? (
                <>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.details?.bankName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            bankName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Chase Bank"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={formData.details?.accountName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            accountName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., XChange Ltd."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={formData.details?.accountNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: {
                              ...formData.details,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                        placeholder="1234567890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={formData.details?.routingNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: {
                              ...formData.details,
                              routingNumber: e.target.value,
                            },
                          })
                        }
                        placeholder="021000021"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="swift">SWIFT/BIC</Label>
                      <Input
                        id="swift"
                        value={formData.details?.swift || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: {
                              ...formData.details,
                              swift: e.target.value,
                            },
                          })
                        }
                        placeholder="CHASUS33"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={formData.details?.iban || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: {
                              ...formData.details,
                              iban: e.target.value,
                            },
                          })
                        }
                        placeholder="DE89 3704 0044..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="walletAddress">Wallet Address *</Label>
                    <Input
                      id="walletAddress"
                      value={formData.details?.walletAddress || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            walletAddress: e.target.value,
                          },
                        })
                      }
                      placeholder="0x..."
                      required={formData.type === "crypto"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="network">Network</Label>
                    <Input
                      id="network"
                      value={formData.details?.network || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            network: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Ethereum (ERC-20)"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="instructions">Payment Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  placeholder="Instructions for users when sending payment..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingMethod ? "Update" : "Add"} Payment Method
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`size-12 rounded-lg flex items-center justify-center ${
                    method.type === "bank" ? "bg-blue-100" : "bg-purple-100"
                  }`}
                >
                  {method.type === "bank" ? (
                    <Building2
                      className={`size-6 ${
                        method.type === "bank"
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    />
                  ) : (
                    <Bitcoin
                      className={`size-6 ${
                        method.type === "bank"
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {method.currency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={method.active}
                  onCheckedChange={() => toggleActive(method.id)}
                />
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {method.type === "bank" ? (
                <>
                  {method.details.bankName && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Bank Name
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{method.details.bankName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              method.details.bankName!,
                              `${method.id}-bank`
                            )
                          }
                        >
                          {copied === `${method.id}-bank` ? (
                            <CheckCircle2 className="size-3 text-green-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {method.details.accountName && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Account Name
                      </Label>
                      <div className="text-sm">{method.details.accountName}</div>
                    </div>
                  )}
                  {method.details.accountNumber && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Account Number
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">
                          {method.details.accountNumber}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              method.details.accountNumber!,
                              `${method.id}-account`
                            )
                          }
                        >
                          {copied === `${method.id}-account` ? (
                            <CheckCircle2 className="size-3 text-green-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {method.details.swift && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        SWIFT/BIC
                      </Label>
                      <div className="text-sm font-mono">
                        {method.details.swift}
                      </div>
                    </div>
                  )}
                  {method.details.iban && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        IBAN
                      </Label>
                      <div className="text-sm font-mono">
                        {method.details.iban}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {method.details.network && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Network
                      </Label>
                      <div className="text-sm">{method.details.network}</div>
                    </div>
                  )}
                  {method.details.walletAddress && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Wallet Address
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono truncate">
                          {method.details.walletAddress.substring(0, 20)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              method.details.walletAddress!,
                              `${method.id}-wallet`
                            )
                          }
                        >
                          {copied === `${method.id}-wallet` ? (
                            <CheckCircle2 className="size-3 text-green-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {method.instructions && (
              <div className="mb-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                {method.instructions}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(method)}
                className="flex-1"
              >
                <Edit2 className="size-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(method.id)}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="size-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
