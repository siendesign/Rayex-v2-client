"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
} from "lucide-react"

interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  buyRate: number
  sellRate: number
  active: boolean
  lastUpdated: string
  autoUpdate: boolean
  trend?: "up" | "down"
}

const initialRates: ExchangeRate[] = [
  {
    id: "1",
    fromCurrency: "USD",
    toCurrency: "EUR",
    rate: 0.92,
    buyRate: 0.918,
    sellRate: 0.922,
    active: true,
    lastUpdated: "2024-12-23 10:30:00",
    autoUpdate: true,
    trend: "up",
  },
  {
    id: "2",
    fromCurrency: "USD",
    toCurrency: "GBP",
    rate: 0.79,
    buyRate: 0.788,
    sellRate: 0.792,
    active: true,
    lastUpdated: "2024-12-23 10:30:00",
    autoUpdate: true,
    trend: "down",
  },
  {
    id: "3",
    fromCurrency: "USD",
    toCurrency: "JPY",
    rate: 149.5,
    buyRate: 149.0,
    sellRate: 150.0,
    active: true,
    lastUpdated: "2024-12-23 10:30:00",
    autoUpdate: true,
    trend: "up",
  },
  {
    id: "4",
    fromCurrency: "EUR",
    toCurrency: "GBP",
    rate: 0.86,
    buyRate: 0.858,
    sellRate: 0.862,
    active: true,
    lastUpdated: "2024-12-23 10:30:00",
    autoUpdate: true,
    trend: "up",
  },
  {
    id: "5",
    fromCurrency: "BTC",
    toCurrency: "USD",
    rate: 43000,
    buyRate: 42800,
    sellRate: 43200,
    active: true,
    lastUpdated: "2024-12-23 10:28:00",
    autoUpdate: true,
    trend: "down",
  },
  {
    id: "6",
    fromCurrency: "EUR",
    toCurrency: "USD",
    rate: 1.09,
    buyRate: 1.085,
    sellRate: 1.095,
    active: true,
    lastUpdated: "2024-12-23 10:30:00",
    autoUpdate: true,
    trend: "up",
  },
]

const currencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "BTC",
  "ETH",
  "USDT",
]

export default function ExchangeRatesManagement() {
  const [rates, setRates] = useState<ExchangeRate[]>(initialRates)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null)

  const [formData, setFormData] = useState<Partial<ExchangeRate>>({
    fromCurrency: "USD",
    toCurrency: "EUR",
    rate: 0,
    buyRate: 0,
    sellRate: 0,
    active: true,
    autoUpdate: true,
  })

  const columns = useMemo<ColumnDef<ExchangeRate>[]>(
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
            {row.original.trend && (
              <>
                {row.original.trend === "up" ? (
                  <TrendingUp className="size-4 text-green-600" />
                ) : (
                  <TrendingDown className="size-4 text-red-600" />
                )}
              </>
            )}
          </div>
        ),
      },
      {
        accessorKey: "buyRate",
        header: "Buy Rate",
        cell: ({ row }) => (
          <span>
            {row.original.buyRate.toFixed(
              row.original.buyRate < 10
                ? 6
                : row.original.buyRate < 100
                ? 4
                : 2
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
              row.original.sellRate < 10
                ? 6
                : row.original.sellRate < 100
                ? 4
                : 2
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
    return rates.filter(
      (rate) =>
        rate.fromCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.toCurrency.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [rates, searchQuery])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingRate) {
      setRates(
        rates.map((r) =>
          r.id === editingRate.id
            ? { ...r, ...formData, lastUpdated: new Date().toLocaleString() }
            : r
        )
      )
    } else {
      const newRate: ExchangeRate = {
        id: Date.now().toString(),
        fromCurrency: formData.fromCurrency || "USD",
        toCurrency: formData.toCurrency || "EUR",
        rate: formData.rate || 0,
        buyRate: formData.buyRate || 0,
        sellRate: formData.sellRate || 0,
        active: formData.active ?? true,
        autoUpdate: formData.autoUpdate ?? true,
        lastUpdated: new Date().toLocaleString(),
      }
      setRates([...rates, newRate])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      fromCurrency: "USD",
      toCurrency: "EUR",
      rate: 0,
      buyRate: 0,
      sellRate: 0,
      active: true,
      autoUpdate: true,
    })
    setIsAddDialogOpen(false)
    setEditingRate(null)
  }

  const handleEdit = (rate: ExchangeRate) => {
    setEditingRate(rate)
    setFormData(rate)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exchange rate?")) {
      setRates(rates.filter((r) => r.id !== id))
    }
  }

  const toggleActive = (id: string) => {
    setRates(rates.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  const refreshRate = (id: string) => {
    setRates(
      rates.map((r) =>
        r.id === id ? { ...r, lastUpdated: new Date().toLocaleString() } : r
      )
    )
  }

  const refreshAllRates = () => {
    const now = new Date().toLocaleString()
    setRates(rates.map((r) => ({ ...r, lastUpdated: now })))
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
          <Button variant="outline" onClick={refreshAllRates} size="sm" className="md:size-default">
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
                      value={formData.fromCurrency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fromCurrency: value })
                      }
                    >
                      <SelectTrigger id="fromCurrency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="toCurrency">To Currency *</Label>
                    <Select
                      value={formData.toCurrency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, toCurrency: value })
                      }
                    >
                      <SelectTrigger id="toCurrency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
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
                        rate: parseFloat(e.target.value),
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
                        buyRate: parseFloat(e.target.value),
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
                        sellRate: parseFloat(e.target.value),
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
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
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
