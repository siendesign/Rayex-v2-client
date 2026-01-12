import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative py-20 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Exchange Currency,
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Send Anywhere
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The fastest way to exchange currency and send money globally. No account needed,
              just create an order and we&apos;ll handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/create-order">
                <Button size="lg" className="h-14 px-8 w-full sm:w-auto">
                  Create Exchange Order
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto">
                See How It Works
              </Button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative lg:h-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1758862527435-1b623cbd4206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmaW5hbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjY1MDQ3NjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Currency exchange platform"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
