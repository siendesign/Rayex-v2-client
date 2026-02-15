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
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  useGetExchangeRatesQuery,
  useCreateExchangeRateMutation,
  useUpdateExchangeRateMutation,
  useRefreshExchangeRateMutation,
  useRefreshAllExchangeRatesMutation,
  useGetCurrenciesQuery,
  api
} from "@/state/api"
import { useSSE } from "@/hooks/useSSE"
import { useAppDispatch } from "@/state/redux"

interface ExchangeRateUI {
  id: string
  fromCurrencyId: string
  toCurrencyId: string
  fromCurrency: string
  toCurrency: string
  rate: number
  buyRate: number
  sellRate: number
  active: boolean
  lastUpdated: string
  autoUpdate: boolean
}

export default function ExchangeRatesManagement() {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ExchangeRateUI | null>(null)

  // API Queries & Mutations
  const { data, isLoading, error } = useGetExchangeRatesQuery()

  // Real-time updates via SSE
  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?role=public`;

  useSSE({
    url: sseUrl,
    events: {
      rate_updated: (updatedRate: any) => {
        console.log('📈 SSE: Rate updated in admin view:', updatedRate.id)
        dispatch(
          api.util.updateQueryData('getExchangeRates' as any, undefined, (draft: any) => {
            if (draft && draft.data) {
              const index = draft.data.findIndex((r: any) => r.id === updatedRate.id)
              if (index !== -1) {
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
  const { data: currenciesData } = useGetCurrenciesQuery()
  const [createRate, { isLoading: isCreating }] = useCreateExchangeRateMutation()
  const [updateRate, { isLoading: isUpdating }] = useUpdateExchangeRateMutation()
  const [refreshRateMutation] = useRefreshExchangeRateMutation()
  const [refreshAllMutation] = useRefreshAllExchangeRatesMutation()

  const isSaving = isCreating || isUpdating

  const [formData, setFormData] = useState<Partial<ExchangeRateUI>>({
    fromCurrencyId: "",
    toCurrencyId: "",
    rate: 0,
    buyRate: 0,
    sellRate: 0,
    active: true,
    autoUpdate: true,
  })

  const rates = data?.data || []
  const availableCurrencies = currenciesData?.data || []

  const mappedRates = useMemo<ExchangeRateUI[]>(() => {
    return rates.map((rate: any) => ({
      id: rate.id,
      fromCurrencyId: rate.fromCurrencyId,
      toCurrencyId: rate.toCurrencyId,
      fromCurrency: rate.fromCurrency?.code || "???",
      toCurrency: rate.toCurrency?.code || "???",
      rate: rate.rate,
      buyRate: rate.buyRate,
      sellRate: rate.sellRate,
      active: rate.active,
      lastUpdated: new Date(rate.lastUpdated).toLocaleString(),
      autoUpdate: rate.autoUpdate,
    }))
  }, [rates])

  const columns = useMemo<ColumnDef<ExchangeRateUI>[]>(
    () => [
      {
        id: "pair",
        header: "Pair",
        cell: ({ row }) => (
          <div className="font-mono font-semibold">
            {row.original.fromCurrency}/{row.original.toCurrency}
          </div>
        ),
      },
      {
        accessorKey: "rate",
        header: "Mid Rate",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {row.original.rate.toFixed(
                row.original.rate < 10 ? 6 : row.original.rate < 100 ? 4 : 2
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "buyRate",
        header: "Buy Rate",
        cell: ({ row }) => (
          <span>
            {row.original.buyRate.toFixed(
              row.original.buyRate < 10 ? 6 : row.original.buyRate < 100 ? 4 : 2
            )}
          </span>
        ),
      },
      {
        accessorKey: "sellRate",
        header: "Sell Rate",
        cell: ({ row }) => (
          <span>
            {row.original.sellRate.toFixed(
              row.original.sellRate < 10 ? 6 : row.original.sellRate < 100 ? 4 : 2
            )}
          </span>
        ),
      },
      {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.getValue("lastUpdated")}
          </span>
        ),
      },
      {
        accessorKey: "autoUpdate",
        header: "Auto",
        cell: ({ row }) => (
          <>
            {row.getValue("autoUpdate") ? (
              <Badge className="bg-green-500 hover:bg-green-600">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </>
        ),
      },
      {
        accessorKey: "active",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            checked={row.getValue("active")}
            onCheckedChange={() => toggleActive(row.original)}
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
              onClick={() => refreshRate(row.original.id)}
              title="Refresh rate"
            >
              <RefreshCw className="size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <Edit2 className="size-4 text-blue-600" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    return mappedRates.filter(
      (rate) =>
        rate.fromCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.toCurrency.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [mappedRates, searchQuery])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Prepare the request data by removing UI-only fields
      const { fromCurrency, toCurrency, lastUpdated, id, ...requestData } = formData as any

      if (editingRate) {
        // For updates, we only send the fields allowed by UpdateExchangeRateRequest
        const updateData = {
          rate: requestData.rate,
          buyRate: requestData.buyRate,
          sellRate: requestData.sellRate,
          active: requestData.active,
          autoUpdate: requestData.autoUpdate,
        }
        await updateRate({
          id: editingRate.id,
          data: updateData,
        }).unwrap()
      } else {
        // For creation, we need fromCurrencyId and toCurrencyId
        const createData = {
          fromCurrencyId: requestData.fromCurrencyId,
          toCurrencyId: requestData.toCurrencyId,
          rate: requestData.rate,
          buyRate: requestData.buyRate,
          sellRate: requestData.sellRate,
          active: requestData.active,
          autoUpdate: requestData.autoUpdate,
        }
        await createRate(createData as any).unwrap()
      }
      resetForm()
    } catch (err) {
      console.error("Failed to save exchange rate:", err)
    }
  }

  const resetForm = () => {
    setFormData({
      fromCurrencyId: "",
      toCurrencyId: "",
      rate: 0,
      buyRate: 0,
      sellRate: 0,
      active: true,
      autoUpdate: true,
    })
    setIsAddDialogOpen(false)
    setEditingRate(null)
  }

  const handleEdit = (rate: ExchangeRateUI) => {
    setEditingRate(rate)
    setFormData({
      fromCurrencyId: rate.fromCurrencyId,
      toCurrencyId: rate.toCurrencyId,
      rate: rate.rate,
      buyRate: rate.buyRate,
      sellRate: rate.sellRate,
      active: rate.active,
      autoUpdate: rate.autoUpdate,
    })
    setIsAddDialogOpen(true)
  }

  const toggleActive = async (rate: ExchangeRateUI) => {
    try {
      await updateRate({
        id: rate.id,
        data: { active: !rate.active },
      }).unwrap()
    } catch (err) {
      console.error("Failed to toggle rate status:", err)
    }
  }

  const refreshRate = async (id: string) => {
    try {
      await refreshRateMutation(id).unwrap()
    } catch (err) {
      console.error("Failed to refresh rate:", err)
    }
  }

  const handleRefreshAll = async () => {
    try {
      await refreshAllMutation().unwrap()
    } catch (err) {
      console.error("Failed to refresh all rates:", err)
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
        <p className="text-muted-foreground">Failed to load exchange rates</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Exchange Rates</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage currency exchange rates
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" onClick={handleRefreshAll} size="sm" className="md:size-default">
            <RefreshCw className="size-4 mr-2" />
            <span className="hidden sm:inline">Refresh All</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingRate(null)
                  resetForm()
                }}
              >
                <Plus className="size-4 mr-2" />
                Add Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingRate ? "Edit Exchange Rate" : "Add New Exchange Rate"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromCurrency">From Currency *</Label>
                    <Select
                      value={formData.fromCurrencyId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fromCurrencyId: value })
                      }
                    >
                      <SelectTrigger id="fromCurrency" className="mt-1">
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

                  <div>
                    <Label htmlFor="toCurrency">To Currency *</Label>
                    <Select
                      value={formData.toCurrencyId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, toCurrencyId: value })
                      }
                    >
                      <SelectTrigger id="toCurrency" className="mt-1">
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
                  <Label htmlFor="rate">Mid Rate *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.000001"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rate: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The mid-market rate for display purposes
                  </p>
                </div>

                <div>
                  <Label htmlFor="buyRate">Buy Rate *</Label>
                  <Input
                    id="buyRate"
                    type="number"
                    step="0.000001"
                    value={formData.buyRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyRate: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Rate at which you buy the currency from users
                  </p>
                </div>

                <div>
                  <Label htmlFor="sellRate">Sell Rate *</Label>
                  <Input
                    id="sellRate"
                    type="number"
                    step="0.000001"
                    value={formData.sellRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellRate: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Rate at which you sell the currency to users
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoUpdate">Auto Update</Label>
                  <Switch
                    id="autoUpdate"
                    checked={formData.autoUpdate}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, autoUpdate: checked })
                    }
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
                    disabled={isSaving}
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    {editingRate ? "Update" : "Add"} Rate
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exchange rates..."
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
