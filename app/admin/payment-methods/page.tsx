"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Bitcoin,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetCurrenciesQuery,
  type PaymentMethod,
} from "@/state/api";

export default function PaymentMethodsManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [copied, setCopied] = useState<string | null>(null);

  // API Queries & Mutations
  const { data, isLoading, error } = useGetPaymentMethodsQuery();
  const { data: currenciesData } = useGetCurrenciesQuery();
  const [createMethod, { isLoading: isCreating }] =
    useCreatePaymentMethodMutation();
  const [updateMethod, { isLoading: isUpdating }] =
    useUpdatePaymentMethodMutation();
  const [deleteMethod] = useDeletePaymentMethodMutation();

  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: "bank",
    name: "",
    currencyId: "",
    active: true,
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swift: "",
    iban: "",
    walletAddress: "",
    network: "",
    instructions: "",
  });

  const paymentMethods = data?.data || [];
  const availableCurrencies = currenciesData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMethod) {
        await updateMethod({
          id: editingMethod.id,
          data: formData,
        }).unwrap();
      } else {
        await createMethod(formData as any).unwrap();
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save payment method:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "bank",
      name: "",
      currencyId: "",
      active: true,
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swift: "",
      iban: "",
      walletAddress: "",
      network: "",
      instructions: "",
    });
    setIsAddDialogOpen(false);
    setEditingMethod(null);
  };

  const handleEdit = (method: any) => {
    setEditingMethod(method);
    setFormData({
      ...method,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        await deleteMethod(id).unwrap();
      } catch (err) {
        console.error("Failed to delete payment method:", err);
      }
    }
  };

  const toggleActive = async (method: any) => {
    try {
      await updateMethod({
        id: method.id,
        data: { active: !method.active },
      }).unwrap();
    } catch (err) {
      console.error("Failed to toggle payment method status:", err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load payment methods</p>
      </div>
    );
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
                setEditingMethod(null);
                resetForm();
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
                      setFormData({
                        ...formData,
                        type: value as "bank" | "crypto",
                      })
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
                  <Select
                    value={formData.currencyId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currencyId: value })
                    }
                  >
                    <SelectTrigger id="currency" className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map((curr: any) => (
                        <SelectItem key={curr.id} value={curr.id}>
                          {curr.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      value={formData.bankName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankName: e.target.value,
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
                      value={formData.accountName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountName: e.target.value,
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
                        value={formData.accountNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountNumber: e.target.value,
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
                        value={formData.routingNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            routingNumber: e.target.value,
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
                        value={formData.swift || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            swift: e.target.value,
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
                        value={formData.iban || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            iban: e.target.value,
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
                      value={formData.walletAddress || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          walletAddress: e.target.value,
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
                      value={formData.network || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          network: e.target.value,
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
                  disabled={isCreating || isUpdating}
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  {editingMethod ? "Update" : "Add"} Payment Method
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {paymentMethods.map((method: any) => (
          <div key={method.id} className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`size-12 rounded-lg flex items-center justify-center ${
                    method.type === "bank" ? "bg-blue-100" : "bg-purple-100"
                  }`}
                >
                  {method.type === "bank" ? (
                    <Building2 className="size-6 text-blue-600" />
                  ) : (
                    <Bitcoin className="size-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="text-sm text-muted-foreground uppercase">
                    {method.currency?.code || method.currencyId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={method.active}
                  onCheckedChange={() => toggleActive(method)}
                />
              </div>
            </div>

            <div className="space-y-3 mb-4 min-h-[160px]">
              {method.type === "bank" ? (
                <>
                  {method.bankName && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Bank Name
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{method.bankName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              method.bankName!,
                              `${method.id}-bank`,
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
                  {method.accountName && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Account Name
                      </Label>
                      <div className="text-sm">{method.accountName}</div>
                    </div>
                  )}
                  {method.accountNumber && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Account Number
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">
                          {method.accountNumber}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              method.accountNumber!,
                              `${method.id}-account`,
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
                  {method.swift && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        SWIFT/BIC
                      </Label>
                      <div className="text-sm font-mono">{method.swift}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {method.network && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Network
                      </Label>
                      <div className="text-sm">{method.network}</div>
                    </div>
                  )}
                  {method.walletAddress && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Wallet Address
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono truncate">
                          {method.walletAddress.substring(0, 20)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              method.walletAddress!,
                              `${method.id}-wallet`,
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
              <div className="mb-4 p-3 bg-muted rounded text-xs text-muted-foreground line-clamp-2">
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
  );
}
