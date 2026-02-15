import type { ReactNode } from "react"

export type ToastActionElement = ReactNode

export type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
