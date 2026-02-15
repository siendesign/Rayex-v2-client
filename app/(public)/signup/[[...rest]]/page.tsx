"use client"

import Link from "next/link"
import { ArrowRightLeft } from "lucide-react"
import { SignUp } from "@clerk/nextjs"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold">RayEx</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Start exchanging currency in minutes
              </h1>
              <p className="text-xl text-muted-foreground">
                Create your account to access the best exchange rates and send money globally.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Real-time rates</h3>
                  <p className="text-muted-foreground">Always get the best exchange rates available</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Secure transactions</h3>
                  <p className="text-muted-foreground">Bank-level encryption protects your money</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Fast transfers</h3>
                  <p className="text-muted-foreground">Money arrives in minutes, not days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">RayEx</span>
          </div>

          <SignUp
            fallbackRedirectUrl="/auth-callback"
            signInFallbackRedirectUrl="/auth-callback"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                card: "shadow-2xl",
                headerTitle: "text-3xl font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton:
                  "border-input hover:bg-accent hover:text-accent-foreground",
                formFieldInput: "h-12",
                footerActionLink: "text-primary hover:underline font-semibold"
              }
            }}
            unsafeMetadata={{
              role: "user"
            }}
          />

          <p className="text-center text-sm text-muted-foreground mt-6">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
