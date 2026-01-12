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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: "active" | "suspended" | "pending"
  totalOrders: number
  totalVolume: string
  joinedAt: string
  lastActive: string
  verificationStatus: "verified" | "unverified" | "pending"
}

const initialUsers: User[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234-567-8900",
    status: "active",
    totalOrders: 45,
    totalVolume: "$125,450",
    joinedAt: "2024-01-15",
    lastActive: "2024-12-23 10:30:00",
    verificationStatus: "verified",
  },
  {
    id: "USR-002",
    name: "Sarah Smith",
    email: "sarah@example.com",
    phone: "+1 234-567-8901",
    status: "active",
    totalOrders: 32,
    totalVolume: "$98,320",
    joinedAt: "2024-02-20",
    lastActive: "2024-12-23 09:15:00",
    verificationStatus: "verified",
  },
  {
    id: "USR-003",
    name: "Mike Johnson",
    email: "mike@example.com",
    status: "active",
    totalOrders: 67,
    totalVolume: "$245,890",
    joinedAt: "2023-11-10",
    lastActive: "2024-12-22 14:20:00",
    verificationStatus: "verified",
  },
  {
    id: "USR-004",
    name: "Lisa Anderson",
    email: "lisa@example.com",
    phone: "+1 234-567-8903",
    status: "pending",
    totalOrders: 2,
    totalVolume: "$8,500",
    joinedAt: "2024-12-20",
    lastActive: "2024-12-23 08:00:00",
    verificationStatus: "pending",
  },
  {
    id: "USR-005",
    name: "Robert Brown",
    email: "robert@example.com",
    status: "suspended",
    totalOrders: 12,
    totalVolume: "$34,200",
    joinedAt: "2024-08-05",
    lastActive: "2024-12-15 16:45:00",
    verificationStatus: "verified",
  },
  {
    id: "USR-006",
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "+1 234-567-8905",
    status: "active",
    totalOrders: 28,
    totalVolume: "$72,180",
    joinedAt: "2024-03-12",
    lastActive: "2024-12-23 11:00:00",
    verificationStatus: "verified",
  },
]

const statusConfig = {
  active: {
    label: "Active",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive" as const,
    className: "",
  },
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
}

const verificationConfig = {
  verified: { label: "Verified", color: "text-green-600" },
  unverified: { label: "Unverified", color: "text-muted-foreground" },
  pending: { label: "Pending", color: "text-yellow-600" },
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(row.getValue("name"))}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.getValue("name")}</div>
              <div className="text-sm text-muted-foreground">
                {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              {row.getValue("email")}
            </div>
            {row.original.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                {row.original.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "totalOrders",
        header: "Orders",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("totalOrders")}</span>
        ),
      },
      {
        accessorKey: "totalVolume",
        header: "Total Volume",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("totalVolume")}</span>
        ),
      },
      {
        accessorKey: "verificationStatus",
        header: "Verification",
        cell: ({ row }) => {
          const status = row.getValue("verificationStatus") as User["verificationStatus"]
          return (
            <div className="flex items-center gap-1">
              {status === "verified" && (
                <CheckCircle2 className="size-4 text-green-600" />
              )}
              <span
                className={`text-sm font-medium ${verificationConfig[status].color}`}
              >
                {verificationConfig[status].label}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as User["status"]
          const config = statusConfig[status]
          return (
            <Badge variant={config.variant} className={config.className}>
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="size-4" />
            {row.getValue("joinedAt")}
          </div>
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
              variant="ghost"
              size="sm"
              onClick={() => toggleUserStatus(row.original.id)}
              className={
                row.original.status === "active"
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {row.original.status === "active" ? (
                <>
                  <Ban className="size-4 mr-1" />
                  Suspend
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-1" />
                  Activate
                </>
              )}
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const newStatus = user.status === "active" ? "suspended" : "active"
          return { ...user, status: newStatus }
        }
        return user
      })
    )
    if (selectedUser && selectedUser.id === userId) {
      setIsDetailsOpen(false)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track and manage platform users
          </p>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
          <div className="text-center min-w-20">
            <div className="text-lg md:text-2xl font-bold">{stats.total}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Total Users</div>
          </div>
          <div className="text-center min-w-20">
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center min-w-20">
            <div className="text-lg md:text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center min-w-20">
            <div className="text-lg md:text-2xl font-bold text-red-600">
              {stats.suspended}
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Suspended</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or email..."
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-50">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
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

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.id}</p>
                </div>
                <Badge
                  variant={statusConfig[selectedUser.status].variant}
                  className={statusConfig[selectedUser.status].className}
                >
                  {statusConfig[selectedUser.status].label}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Activity Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Total Orders
                    </div>
                    <div className="text-2xl font-bold">
                      {selectedUser.totalOrders}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Total Volume
                    </div>
                    <div className="text-2xl font-bold">
                      {selectedUser.totalVolume}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Verification Status</h4>
                <div className="flex items-center gap-2">
                  {selectedUser.verificationStatus === "verified" && (
                    <CheckCircle2 className="size-5 text-green-600" />
                  )}
                  <span
                    className={`font-medium ${
                      verificationConfig[selectedUser.verificationStatus].color
                    }`}
                  >
                    {verificationConfig[selectedUser.verificationStatus].label}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <div>{selectedUser.joinedAt}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Active</Label>
                  <div>{selectedUser.lastActive}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <Button
                  onClick={() => toggleUserStatus(selectedUser.id)}
                  className={`w-full ${
                    selectedUser.status === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {selectedUser.status === "active"
                    ? "Suspend User"
                    : "Activate User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
