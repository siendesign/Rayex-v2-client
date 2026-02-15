"use client"

import { useState } from "react"
import {
  useSuspendUserMutation,
  useActivateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "@/state/api"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Ban, CheckCircle, Shield, UserX } from "lucide-react"

interface UserActionsProps {
  userId: string
  userEmail: string
  status: string
  role: string
}

export function UserActions({ userId, userEmail, status, role }: UserActionsProps) {
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation()
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation()
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const handleSuspend = async () => {
    try {
      await suspendUser(userId).unwrap()
      // Show success toast
      console.log("User suspended successfully")
    } catch (error) {
      console.error("Failed to suspend user:", error)
      // Show error toast
    }
  }

  const handleActivate = async () => {
    try {
      await activateUser(userId).unwrap()
      // Show success toast
      console.log("User activated successfully")
    } catch (error) {
      console.error("Failed to activate user:", error)
      // Show error toast
    }
  }

  const handleMakeAdmin = async () => {
    try {
      await updateRole({ id: userId, role: "admin" }).unwrap()
      // Show success toast
      console.log("User role updated to admin")
    } catch (error) {
      console.error("Failed to update user role:", error)
      // Show error toast
    }
  }

  const handleMakeUser = async () => {
    try {
      await updateRole({ id: userId, role: "user" }).unwrap()
      // Show success toast
      console.log("User role updated to user")
    } catch (error) {
      console.error("Failed to update user role:", error)
      // Show error toast
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(userId).unwrap()
      // Show success toast
      console.log("User deleted successfully")
    } catch (error) {
      console.error("Failed to delete user:", error)
      // Show error toast
    }
  }

  const isLoading = isSuspending || isActivating || isUpdatingRole || isDeleting

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Suspend/Activate */}
        {status === "active" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Suspend User?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will suspend {userEmail} and ban them from Clerk. They won't be able to sign in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSuspend} disabled={isSuspending}>
                  {isSuspending ? "Suspending..." : "Suspend"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <DropdownMenuItem onClick={handleActivate} disabled={isActivating}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isActivating ? "Activating..." : "Activate User"}
          </DropdownMenuItem>
        )}

        {/* Change Role */}
        <DropdownMenuSeparator />
        {role === "user" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Shield className="mr-2 h-4 w-4" />
                Make Admin
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Make Admin?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will give {userEmail} admin privileges. They will have full access to the admin panel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMakeAdmin} disabled={isUpdatingRole}>
                  {isUpdatingRole ? "Updating..." : "Make Admin"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Shield className="mr-2 h-4 w-4" />
                Remove Admin
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Admin Privileges?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove admin privileges from {userEmail}. They will become a regular user.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMakeUser} disabled={isUpdatingRole}>
                  {isUpdatingRole ? "Updating..." : "Remove Admin"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete User */}
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
              <UserX className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {userEmail} from both the database and Clerk. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
