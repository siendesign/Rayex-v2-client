"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function AuthCallback() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // If no user, redirect to login
        router.push("/login")
        return
      }

      // Check user role
      const role = user.publicMetadata?.role || user.unsafeMetadata?.role || "user"

      console.log("User role:", role) // Debug log

      // Redirect based on role
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
