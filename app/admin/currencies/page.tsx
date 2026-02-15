"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit2, Trash2, Search, Loader2, AlertCircle } from "lucide-react"
import {
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useToggleCurrencyActiveMutation,
  api
} from "@/state/api"
import { useSSE } from "@/hooks/useSSE"
import { useAppDispatch } from "@/state/redux"

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  flag: string
  flagUrl?: string
  type: "fiat" | "crypto"
  active: boolean
  decimals: number
}

export default function CurrenciesManagement() {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // API Queries & Mutations
  const { data, isLoading, error } = useGetCurrenciesQuery()

  // Real-time updates via SSE
  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?role=admin`;

  useSSE({
    url: sseUrl,
    events: {
      currency_updated: (updatedCurrency: any) => {
        console.log('🪙 SSE: Currency updated, refreshing list...', updatedCurrency.id)
        dispatch(
          api.util.updateQueryData('getCurrencies' as any, undefined, (draft: any) => {
            if (draft && draft.data) {
              const index = draft.data.findIndex((c: any) => c.id === updatedCurrency.id)
              if (index !== -1) {
                draft.data[index] = updatedCurrency
              } else {
                draft.data.unshift(updatedCurrency)
              }
            }
          })
        )
      }
    }
  });
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation()
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation()
  const [deleteCurrency] = useDeleteCurrencyMutation()
  const [toggleActiveMutation] = useToggleCurrencyActiveMutation()

  // Form state
  const [formData, setFormData] = useState<Partial<Currency>>({
    code: "",
    name: "",
    symbol: "",
    flag: "",
    type: "fiat",
    active: true,
    decimals: 2,
  })

  const currencies = data?.data || []

  const columns = useMemo<ColumnDef<Currency>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Currency",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.flagUrl ? (
              <img
                src={row.original.flagUrl}
                alt={row.original.name}
                className="size-8 object-contain rounded"
              />
            ) : (
              <span className="text-2xl">{row.original.flag}</span>
            )}
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.getValue("code")}</span>
        ),
      },
      {
        accessorKey: "symbol",
        header: "Symbol",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string
          return (
            <Badge
              variant={type === "fiat" ? "default" : "secondary"}
              className={
                type === "fiat"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }
            >
              {type}
            </Badge>
          )
        },
      },
      {
        accessorKey: "decimals",
        header: "Decimals",
      },
      {
        accessorKey: "active",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            checked={row.getValue("active")}
            onCheckedChange={() => toggleActive(row.original.id)}
          />
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <Edit2 className="size-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    return currencies.filter(
      (currency: Currency) =>
        currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currencies, searchQuery])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSubmit = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSubmit.append(key, value.toString())
      }
    })

    if (selectedFile) {
      formDataToSubmit.append("flagImage", selectedFile)
    }

    try {
      if (editingCurrency) {
        await updateCurrency({
          id: editingCurrency.id,
          data: formDataToSubmit,
        }).unwrap()
      } else {
        await createCurrency(formDataToSubmit).unwrap()
      }
      resetForm()
    } catch (err) {
      console.error("Failed to save currency:", err)
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      symbol: "",
      flag: "",
      type: "fiat",
      active: true,
      decimals: 2,
    })
    setIsAddDialogOpen(false)
    setEditingCurrency(null)
    setSelectedFile(null)
  }

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency)
    setFormData(currency)
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this currency?")) {
      try {
        await deleteCurrency(id).unwrap()
      } catch (err) {
        console.error("Failed to delete currency:", err)
      }
    }
  }

  const toggleActive = async (id: string) => {
    try {
      await toggleActiveMutation(id).unwrap()
    } catch (err) {
      console.error("Failed to toggle currency status:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load currencies</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Currencies</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage available currencies for exchange
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCurrency(null)
                resetForm()
              }}
            >
              <Plus className="size-4 mr-2" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCurrency ? "Edit Currency" : "Add New Currency"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Currency Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., USD"
                  maxLength={10}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="name">Currency Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., US Dollar"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  placeholder="e.g., $"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="flag">Default Emoji *</Label>
                <Input
                  id="flag"
                  value={formData.flag}
                  onChange={(e) =>
                    setFormData({ ...formData, flag: e.target.value })
                  }
                  placeholder="e.g., 🇺🇸 or ₿"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="flagImage">Flag Image</Label>
                <Input
                  id="flagImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setSelectedFile(file)
                  }}
                  className="mt-1 pt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a high-quality flag image. Emoji will be used as fallback.
                </p>
                {editingCurrency?.flagUrl && !selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Current:</p>
                    <img src={editingCurrency.flagUrl} alt="current" className="size-6 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as "fiat" | "crypto" })
                  }
                >
                  <SelectTrigger id="type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiat">Fiat</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="decimals">Decimal Places *</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={formData.decimals}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      decimals: e.target.value === "" ? 0 : parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="18"
                  required
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
                <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  {editingCurrency ? "Update" : "Add"} Currency
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search currencies..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
