"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  QrCode,
} from "lucide-react";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  api,
} from "@/state/api";
import { useEffect } from "react";
import { useAppDispatch } from "@/state/redux";
import { useSSE } from "@/hooks/useSSE";
import Image from "next/image";

// Local interface for UI mapping
interface OrderUI {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  from: { currency: string; amount: string; flag: string };
  to: { currency: string; amount: string; flag: string };
  status:
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";
  paymentMethod: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  recipientWallet?: string;
  recipientQrCode?: string;
  createdAt: string;
  updatedAt: string;
  rate: string;
  fee: string;
  notes?: string;
}

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
};

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedOrder, setSelectedOrder] = useState<OrderUI | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] =
    useState<OrderUI["status"]>("pending_payment");
  const [statusNotes, setStatusNotes] = useState("");

  // API Queries & Mutations
  const { data, isLoading, error } = useGetOrdersQuery({
    page,
    limit: pageSize,
    search: searchQuery,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const dispatch = useAppDispatch();

  // Replace Socket.io with SSE
  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?role=admin`;

  useSSE({
    url: sseUrl,
    events: {
      new_order: (newOrder: any) => {
        console.log("🔔 Admin SSE: Received new_order:", newOrder);
        // Refresh the list if on page 1
        if (page === 1) {
          dispatch(
            api.util.updateQueryData(
              "getOrders" as any,
              {
                page,
                limit: pageSize,
                search: searchQuery,
                status: statusFilter === "all" ? undefined : statusFilter,
              },
              (draft: any) => {
                if (draft && draft.data) {
                  if (!draft.data.some((o: any) => o.id === newOrder.id)) {
                    console.log("✅ Admin SSE: Adding new order to cache");
                    draft.data.unshift(newOrder);
                  }
                }
              },
            ),
          );
        }
      },
      order_updated: (updatedOrder: any) => {
        console.log("🔔 Admin SSE: Received order_updated:", updatedOrder);
        dispatch(
          api.util.updateQueryData(
            "getOrders" as any,
            {
              page,
              limit: pageSize,
              search: searchQuery,
              status: statusFilter === "all" ? undefined : statusFilter,
            },
            (draft: any) => {
              if (draft && draft.data) {
                const index = draft.data.findIndex(
                  (o: any) => o.id === updatedOrder.id,
                );
                if (index !== -1) {
                  console.log("✅ Admin SSE: Updating order in cache");
                  draft.data[index] = {
                    ...draft.data[index],
                    ...updatedOrder,
                  };
                }
              }
            },
          ),
        );
      },
    },
  });

  const mappedOrders = useMemo<OrderUI[]>(() => {
    if (!data?.data) return [];
    return data.data.map((order: any) => ({
      id: order.id,
      userId: order.user?.id || "",
      userName: order.user?.name || "Unknown",
      userEmail: order.user?.email || "N/A",
      from: {
        currency: order.fromCurrency?.code || "???",
        amount: order.fromAmount.toLocaleString(),
        flag: order.fromCurrency?.flag || "🌍",
      },
      to: {
        currency: order.toCurrency?.code || "???",
        amount: order.toAmount.toLocaleString(),
        flag: order.toCurrency?.flag || "🌍",
      },
      status: order.status as OrderUI["status"],
      paymentMethod: order.paymentMethod?.name || order.paymentMethodId,
      recipientName: order.recipientName || "N/A",
      recipientBank: order.recipientBank || "N/A",
      recipientAccount: order.recipientAccountNumber || "N/A",
      recipientWallet: order.recipientWalletAddress,
      recipientQrCode: order.recipientQrCodeUrl,
      createdAt: new Date(order.createdAt).toLocaleString(),
      updatedAt: new Date(order.updatedAt).toLocaleString(),
      rate: order.exchangeRate.toString(),
      fee: order.fee.toString(),
      notes: order.notes,
    }));
  }, [data]);

  const columns = useMemo<ColumnDef<OrderUI>[]>(
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
          const status = row.getValue("status") as OrderUI["status"];
          const config = statusConfig[status];
          if (!config) return <Badge>{status}</Badge>;
          const Icon = config.icon;
          return (
            <Badge variant={config.variant} className={config.className}>
              <Icon className="size-3 mr-1" />
              {config.label}
            </Badge>
          );
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
    [],
  );

  const table = useReactTable({
    data: mappedOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleViewDetails = (order: OrderUI) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder) {
      try {
        await updateStatus({
          id: selectedOrder.id,
          status: newStatus,
          notes: statusNotes,
        }).unwrap();

        setIsStatusDialogOpen(false);
        setIsDetailsOpen(false);
        setStatusNotes("");
        // RTK Query will automatically refetch due to tag invalidation
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
  };

  const openStatusDialog = (order: OrderUI) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNotes("");
    setIsStatusDialogOpen(true);
  };

  if (isLoading && page === 1) {
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
        <p className="text-muted-foreground">Failed to load orders</p>
      </div>
    );
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order ID, user name, or email..."
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-50">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
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
      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
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
                            header.getContext(),
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
                          cell.getContext(),
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
          Showing {mappedOrders.length} orders
          {data?.pagination && ` of ${data.pagination.total}`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <div className="text-sm font-medium">
            Page {page} {data?.pagination && `of ${data.pagination.totalPages}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={
              data?.pagination ? page >= data.pagination.totalPages : true
            }
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
                      const config = statusConfig[selectedOrder.status];
                      if (!config) return <Badge>{selectedOrder.status}</Badge>;
                      const Icon = config.icon;
                      return (
                        <Badge
                          variant={config.variant}
                          className={config.className}
                        >
                          <Icon className="size-3 mr-1" />
                          {config.label}
                        </Badge>
                      );
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
                    <span className="text-muted-foreground">
                      Payment Method
                    </span>
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

                  {selectedOrder.recipientWallet ? (
                    <div>
                      <Label className="text-muted-foreground">
                        Crypto Wallet Address
                      </Label>
                      <div className="font-mono text-sm break-all">
                        {selectedOrder.recipientWallet}
                      </div>
                    </div>
                  ) : null}

                  {!selectedOrder.recipientWallet && (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Bank</Label>
                        <div>{selectedOrder.recipientBank}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Account / IBAN
                        </Label>
                        <div className="font-mono text-sm">
                          {selectedOrder.recipientAccount}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedOrder.recipientQrCode &&
                    typeof selectedOrder.recipientQrCode === "string" && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                          <QrCode className="w-4 h-4" />
                          Uploaded QR Code
                        </Label>
                        <a
                          href={selectedOrder.recipientQrCode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-[120px] aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity"
                        >
                          <Image
                            src={selectedOrder.recipientQrCode}
                            alt="Recipient QR Code"
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      </div>
                    )}
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
                onValueChange={(value) =>
                  setNewStatus(value as OrderUI["status"])
                }
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
                disabled={isUpdating}
                onClick={() => setIsStatusDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                className="flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
