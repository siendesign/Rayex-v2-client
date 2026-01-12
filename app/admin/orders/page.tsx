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
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  from: { currency: string; amount: string; flag: string }
  to: { currency: string; amount: string; flag: string }
  status:
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
  paymentMethod: "bank" | "crypto"
  recipientName: string
  recipientBank: string
  recipientAccount: string
  createdAt: string
  updatedAt: string
  rate: string
  fee: string
  notes?: string
}

const initialOrders: Order[] = [
  {
    id: "ORD-2024-045",
    userId: "USR-001",
    userName: "John Doe",
    userEmail: "john@example.com",
    from: { currency: "USD", amount: "5,000.00", flag: "🇺🇸" },
    to: { currency: "EUR", amount: "4,600.00", flag: "🇪🇺" },
    status: "pending_payment",
    paymentMethod: "bank",
    recipientName: "Maria Garcia",
    recipientBank: "Deutsche Bank",
    recipientAccount: "DE89 3704 0044 0532 0130 00",
    createdAt: "2024-12-23 10:30:00",
    updatedAt: "2024-12-23 10:30:00",
    rate: "0.92",
    fee: "25.00",
  },
  {
    id: "ORD-2024-044",
    userId: "USR-002",
    userName: "Sarah Smith",
    userEmail: "sarah@example.com",
    from: { currency: "BTC", amount: "0.5", flag: "₿" },
    to: { currency: "USD", amount: "21,500.00", flag: "🇺🇸" },
    status: "payment_received",
    paymentMethod: "crypto",
    recipientName: "James Wilson",
    recipientBank: "Bank of America",
    recipientAccount: "123456789",
    createdAt: "2024-12-23 09:15:00",
    updatedAt: "2024-12-23 10:00:00",
    rate: "43,000",
    fee: "107.50",
    notes: "Crypto payment confirmed on blockchain",
  },
  {
    id: "ORD-2024-043",
    userId: "USR-003",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    from: { currency: "EUR", amount: "10,000.00", flag: "🇪🇺" },
    to: { currency: "GBP", amount: "8,600.00", flag: "🇬🇧" },
    status: "processing",
    paymentMethod: "bank",
    recipientName: "Emily Brown",
    recipientBank: "Barclays",
    recipientAccount: "GB29 NWBK 6016 1331 9268 19",
    createdAt: "2024-12-23 08:00:00",
    updatedAt: "2024-12-23 09:30:00",
    rate: "0.86",
    fee: "43.00",
    notes: "Processing transfer to Barclays",
  },
  {
    id: "ORD-2024-042",
    userId: "USR-004",
    userName: "Lisa Anderson",
    userEmail: "lisa@example.com",
    from: { currency: "USD", amount: "2,500.00", flag: "🇺🇸" },
    to: { currency: "JPY", amount: "373,750.00", flag: "🇯🇵" },
    status: "completed",
    paymentMethod: "bank",
    recipientName: "Yuki Tanaka",
    recipientBank: "MUFG Bank",
    recipientAccount: "JP98 7654 3210 1234 5678",
    createdAt: "2024-12-22 14:20:00",
    updatedAt: "2024-12-23 08:15:00",
    rate: "149.5",
    fee: "12.50",
    notes: "Completed successfully",
  },
  {
    id: "ORD-2024-041",
    userId: "USR-005",
    userName: "Robert Brown",
    userEmail: "robert@example.com",
    from: { currency: "GBP", amount: "7,500.00", flag: "🇬🇧" },
    to: { currency: "USD", amount: "9,525.00", flag: "🇺🇸" },
    status: "failed",
    paymentMethod: "bank",
    recipientName: "Alice Cooper",
    recipientBank: "Chase Bank",
    recipientAccount: "US12 3456 7890 1234 5678",
    createdAt: "2024-12-22 11:00:00",
    updatedAt: "2024-12-22 15:30:00",
    rate: "1.27",
    fee: "37.50",
    notes: "Failed due to insufficient funds",
  },
  {
    id: "ORD-2024-040",
    userId: "USR-006",
    userName: "Jennifer Davis",
    userEmail: "jennifer@example.com",
    from: { currency: "CAD", amount: "3,200.00", flag: "🇨🇦" },
    to: { currency: "EUR", amount: "2,176.00", flag: "🇪🇺" },
    status: "cancelled",
    paymentMethod: "bank",
    recipientName: "Pierre Dubois",
    recipientBank: "BNP Paribas",
    recipientAccount: "FR76 3000 6000 0112 3456 7890 189",
    createdAt: "2024-12-22 09:00:00",
    updatedAt: "2024-12-22 10:00:00",
    rate: "0.68",
    fee: "16.00",
    notes: "Cancelled by customer request",
  },
]

const statusConfig = {
  pending_payment: {
    label: "Pending Payment",
    variant: "secondary" as const,
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
    icon: Clock,
  },
  payment_received: {
    label: "Payment Received",
    variant: "default" as const,
    className: "bg-blue-500 hover:bg-blue-600",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    variant: "default" as const,
    className: "bg-purple-500 hover:bg-purple-600",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    className: "",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline" as const,
    className: "bg-gray-500 hover:bg-gray-600 text-white",
    icon: XCircle,
  },
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<Order["status"]>("pending_payment")
  const [statusNotes, setStatusNotes] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => (
          <div className="font-mono font-medium">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue("userName")}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.userEmail}
            </div>
          </div>
        ),
      },
      {
        id: "exchange",
        header: "Exchange",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span>
              {row.original.from.flag} {row.original.from.currency}
            </span>
            <span className="text-muted-foreground">→</span>
            <span>
              {row.original.to.flag} {row.original.to.currency}
            </span>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.from.amount}</div>
            <div className="text-sm text-muted-foreground">
              → {row.original.to.amount}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as Order["status"]
          const config = statusConfig[status]
          const Icon = config.icon
          return (
            <Badge variant={config.variant} className={config.className}>
              <Icon className="size-3 mr-1" />
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("createdAt")}</div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(row.original)}
            >
              <Eye className="size-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openStatusDialog(row.original)}
            >
              Update Status
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: newStatus,
                notes: statusNotes || o.notes,
                updatedAt: new Date().toLocaleString(),
              }
            : o
        )
      )
      setIsStatusDialogOpen(false)
      setIsDetailsOpen(false)
      setStatusNotes("")
    }
  }

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusNotes("")
    setIsStatusDialogOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Review and manage exchange orders
        </p>
      </div>

      {/* Status Counts */}
      <div className="flex gap-3 md:gap-6 overflow-x-auto pb-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = orders.filter((o) => o.status === status).length
          return (
            <div key={status} className="text-center min-w-[80px]">
              <div className="text-lg md:text-2xl font-bold">{count}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">{config.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, user name, or email..."
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-50">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs md:text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {filteredData.length}{" "}
          orders
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Order ID</Label>
                  <div className="font-mono font-medium">
                    {selectedOrder.id}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {(() => {
                      const config = statusConfig[selectedOrder.status]
                      const Icon = config.icon
                      return (
                        <Badge variant={config.variant} className={config.className}>
                          <Icon className="size-3 mr-1" />
                          {config.label}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">User Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <div>{selectedOrder.userName}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <div>{selectedOrder.userEmail}</div>
                  </div>
                </div>
              </div>

              {/* Exchange Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Exchange Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">
                      {selectedOrder.from.flag} {selectedOrder.from.amount}{" "}
                      {selectedOrder.from.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">
                      {selectedOrder.to.flag} {selectedOrder.to.amount}{" "}
                      {selectedOrder.to.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="font-medium">{selectedOrder.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-medium">${selectedOrder.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Recipient Details</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <div>{selectedOrder.recipientName}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bank</Label>
                    <div>{selectedOrder.recipientBank}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account</Label>
                    <div className="font-mono text-sm">
                      {selectedOrder.recipientAccount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Notes</Label>
                  <div className="bg-muted p-3 rounded mt-1">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <div>{selectedOrder.createdAt}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <div>{selectedOrder.updatedAt}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <Button
                  onClick={() => openStatusDialog(selectedOrder)}
                  className="w-full"
                >
                  Update Order Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newStatus">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as Order["status"])}
              >
                <SelectTrigger id="newStatus" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusNotes">Notes (Optional)</Label>
              <Textarea
                id="statusNotes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} className="flex-1">
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
