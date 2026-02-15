"use client"

import { useState, useMemo } from "react"
import {
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ArrowRightLeft,
    Copy,
    Eye,
    Loader2,
    Calendar,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import { useGetUserOrdersQuery, api } from "@/state/api"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAppDispatch } from "@/state/redux"
import { useSSE } from "@/hooks/useSSE"

const statusConfig = {
    all: {
        label: "All Orders",
        variant: "outline" as const,
        icon: ArrowRightLeft,
    },
    pending_payment: {
        label: "Waiting for Payment",
        variant: "secondary" as const,
        icon: Clock,
    },
    payment_received: {
        label: "Payment Received",
        variant: "default" as const,
        icon: CheckCircle2,
    },
    processing: {
        label: "Processing",
        variant: "default" as const,
        icon: Clock,
    },
    completed: {
        label: "Completed",
        variant: "secondary" as const,
        icon: CheckCircle2,
    },
    failed: {
        label: "Failed",
        variant: "destructive" as const,
        icon: XCircle,
    },
    cancelled: {
        label: "Cancelled",
        variant: "outline" as const,
        icon: XCircle,
    },
}

export default function UserOrdersPage() {
    const dispatch = useAppDispatch()
    const { user } = useUser()
    const router = useRouter()
    const userEmail = user?.emailAddresses[0]?.emailAddress
    const { data: response, isLoading, error } = useGetUserOrdersQuery(userEmail ?? "", {
        skip: !userEmail,
    })

    const sseUrl = userEmail
        ? `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?email=${userEmail}`
        : null;

    useSSE({
        url: sseUrl || "",
        events: {
            order_updated: (updatedOrder: any) => {
                console.log('🔔 SSE: Received order_updated for history:', updatedOrder)
                dispatch(
                    api.util.updateQueryData('getUserOrders' as any, userEmail, (draft: any) => {
                        if (draft && draft.data) {
                            const index = draft.data.findIndex((o: any) => o.id === updatedOrder.id)
                            if (index !== -1) {
                                console.log('✅ Updating order in history cache')
                                draft.data[index] = updatedOrder
                            }
                        }
                    })
                )
            },
            new_order: (newOrder: any) => {
                console.log('🔔 SSE: Received new_order for history:', newOrder)
                dispatch(
                    api.util.updateQueryData('getUserOrders' as any, userEmail, (draft: any) => {
                        if (draft && draft.data) {
                            if (!draft.data.some((o: any) => o.id === newOrder.id)) {
                                console.log('✅ Adding new order to history cache')
                                draft.data.unshift(newOrder)
                            }
                        }
                    })
                )
            }
        }
    });

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [copied, setCopied] = useState<string | null>(null)

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(id)
            setTimeout(() => setCopied(null), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const filteredOrders = useMemo(() => {
        if (!response?.data) return []
        return response.data.filter((order: any) => {
            const matchesSearch =
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (order.recipientName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (order.recipientWalletAddress?.toLowerCase() || "").includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter === "all" || order.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [response?.data, searchQuery, statusFilter])

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Loading your transaction history...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Transaction History</h1>
                        <p className="text-muted-foreground mt-1">View and track all your exchange orders in one place.</p>
                    </div>
                    <Button onClick={() => router.push("/create-order")}>
                        New Exchange
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-card  border p-4 mb-6 ">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Order ID or Recipient..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                <config.icon className="w-4 h-4" />
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-card  border p-12 text-center">
                            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                <ArrowRightLeft className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No transactions found</h3>
                            <p className="text-muted-foreground mb-6">You haven't made any exchanges that match your filters yet.</p>
                            <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all") }}>
                                Clear All Filters
                            </Button>
                        </div>
                    ) : (
                        filteredOrders.map((order: any) => {
                            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.processing
                            const StatusIcon = status.icon

                            return (
                                <div
                                    key={order.id}
                                    className="bg-card  border p-5 md:p-6 hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Order ID & Date */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-mono text-sm font-semibold text-primary">
                                                    #{order.id.split('-')[0]}...{order.id.slice(-8)}
                                                </span>
                                                <Badge variant={status.variant} className="flex items-center gap-1.5 py-0.5 px-2 text-[10px] uppercase tracking-wider font-bold">
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        {/* Exchange Details */}
                                        <div className="flex flex-1 items-center justify-between md:justify-center gap-2 md:gap-8 px-4 py-3 bg-muted/40 ">
                                            <div className="text-center">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">You Sent</div>
                                                <div className="flex items-center gap-2">
                                                    {order.fromCurrency?.flagUrl ? (
                                                        <div className="relative w-6 h-6 overflow-hidden rounded-full border border-muted-foreground/20">
                                                            <Image
                                                                src={order.fromCurrency.flagUrl}
                                                                alt={order.fromCurrency.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-lg">{order.fromCurrency?.flag || "💰"}</span>
                                                    )}
                                                    <span className="font-bold">{(order.fromAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.fromCurrency?.code}</span>
                                                </div>
                                            </div>
                                            <ArrowRightLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <div className="text-center">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">Received</div>
                                                <div className="flex items-center gap-2">
                                                    {order.toCurrency?.flagUrl ? (
                                                        <div className="relative w-6 h-6 overflow-hidden rounded-full border border-muted-foreground/20">
                                                            <Image
                                                                src={order.toCurrency.flagUrl}
                                                                alt={order.toCurrency.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-lg">{order.toCurrency?.flag || "💰"}</span>
                                                    )}
                                                    <span className="font-bold">{(order.toAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.toCurrency?.code}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 md:flex-none gap-2 h-10 px-4"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Details
                                            </Button>
                                            {order.status === "pending_payment" && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 md:flex-none gap-2 h-10 px-4"
                                                    onClick={() => router.push(`/order-payment/${order.id}`)}
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Pay Now
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.id.split('-')[0]}...</DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 pt-4">
                            {/* Status Section */}
                            <div className="flex items-center justify-between p-4 bg-muted/40  border">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-1">Current Status</p>
                                    <h4 className="font-bold text-lg capitalize">{selectedOrder.status.replace('_', ' ')}</h4>
                                </div>
                                <Badge className="h-10 px-4 text-sm font-bold gap-2">
                                    {(() => {
                                        const config = statusConfig[selectedOrder.status as keyof typeof statusConfig] || statusConfig.processing
                                        const Icon = config.icon
                                        return <><Icon className="w-4 h-4" /> {config.label}</>
                                    })()}
                                </Badge>
                            </div>

                            {/* Primary Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Exchange Info
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex flex-col justify-start items-start text-sm">
                                            <span className="text-muted-foreground">You Send</span>
                                            <span className="font-bold">{(selectedOrder.fromAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedOrder.fromCurrency?.code}</span>
                                        </div>
                                        <div className="flex flex-col justify-start items-start text-sm">
                                            <span className="text-muted-foreground">Recipient Gets</span>
                                            <span className="font-bold">{(selectedOrder.toAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedOrder.toCurrency?.code}</span>
                                        </div>
                                        <div className="flex flex-col justify-start items-start text-sm border-t pt-3">
                                            <span className="text-muted-foreground">Exchange Rate</span>
                                            <span className="font-mono text-xs">1 {selectedOrder.fromCurrency?.code} = {(selectedOrder.exchangeRate || 0).toFixed(2)} {selectedOrder.toCurrency?.code}</span>
                                        </div>
                                        {/* <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Total Fee</span>
                                            <span className="font-bold">$0.00</span>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Recipient Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex flex-col text-sm">
                                            <span className="text-muted-foreground text-xs mb-1">Account Name</span>
                                            <span className="font-bold">{selectedOrder.recipientName || "N/A"}</span>
                                        </div>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-muted-foreground text-xs mb-1">Bank / Provider</span>
                                            <span className="font-bold">{selectedOrder.recipientBank || "N/A"}</span>
                                        </div>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-muted-foreground text-xs mb-1">Account / Wallet</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs bg-muted p-1 rounded break-all flex-1">
                                                    {selectedOrder.recipientAccountNumber || selectedOrder.recipientWalletAddress || "N/A"}
                                                </span>
                                                {(selectedOrder.recipientAccountNumber || selectedOrder.recipientWalletAddress) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => copyToClipboard(selectedOrder.recipientAccountNumber || selectedOrder.recipientWalletAddress, 'dialog-copy')}
                                                    >
                                                        <Copy className={`w-3.5 h-3.5 ${copied === 'dialog-copy' ? "text-green-600" : ""}`} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="border-t pt-6">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Admin Notes
                                </h4>
                                <div className="bg-muted/40 p-4 border italic text-sm text-muted-foreground">
                                    {selectedOrder.notes || "No additional notes from the administrator."}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center gap-3 pt-4">
                                {selectedOrder.status === "pending_payment" && (
                                    <Button className="flex-1 h-12 gap-2" onClick={() => router.push(`/order-payment/${selectedOrder.id}`)}>
                                        <ExternalLink className="w-4 h-4" />
                                        View Payment Instructions
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1 h-12" onClick={() => setSelectedOrder(null)}>
                                    Close Details
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function CreditCard(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}
