import Image from "next/image"
import { cn } from "@/lib/utils"

interface HeroBannerProps {
  src: string
  children: React.ReactNode
  className?: string
}

export function HeroBanner({ src, children, className }: HeroBannerProps) {
  return (
    <div className="relative -mx-4 overflow-hidden rounded-2xl sm:-mx-0">
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />
      <div
        className={cn(
          "relative flex flex-col p-5 sm:p-8",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
