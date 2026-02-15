import Link from "next/link"
import { ArrowRightLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreateOrderCard() {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-4 md:p-8 text-primary-foreground">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Create Exchange Order</h2>
          <p className="text-sm md:text-base text-primary-foreground/90">
            Exchange currency and send to any bank account
          </p>
        </div>
        <div className="size-10 md:size-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ArrowRightLeft className="size-5 md:size-6" />
        </div>
      </div>

      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <div className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs">1</span>
          </div>
          <span>Create your exchange order</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <div className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs">2</span>
          </div>
          <span>Send funds to our account (Bank or Crypto)</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <div className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs">3</span>
          </div>
          <span>We exchange and send to destination</span>
        </div>
      </div>

      <Link href="/create-order">
        <Button className="w-full bg-white text-primary hover:bg-white/90 text-sm md:text-base">
          <Plus className="size-4 md:size-5 mr-2" />
          New Exchange Order
        </Button>
      </Link>

      {/* <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20">
        <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
          <div>
            <div className="text-lg md:text-2xl font-bold">0.0%</div>
            <div className="text-[10px] md:text-xs text-primary-foreground/80">Our Fee</div>
          </div>
          <div>
            <div className="text-lg md:text-2xl font-bold">24/7</div>
            <div className="text-[10px] md:text-xs text-primary-foreground/80">Support</div>
          </div>
          <div>
            <div className="text-lg md:text-2xl font-bold">150+</div>
            <div className="text-[10px] md:text-xs text-primary-foreground/80">Countries</div>
          </div>
        </div>
      </div> */}
    </div>
  )
}
