import * as React from "react"

import { Button } from "@/components/ui/button"

export interface SignaturePadHandle {
  toDataURL: () => string | null
  clear: () => void
  isEmpty: () => boolean
}

export const SignaturePad = React.forwardRef<SignaturePadHandle, {}>(
  function SignaturePad(_, ref) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const drawingRef = React.useRef(false)
    const emptyRef = React.useRef(true)
    const lastRef = React.useRef<{ x: number; y: number } | null>(null)

    React.useImperativeHandle(ref, () => ({
      toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? null,
      clear: () => {
        const c = canvasRef.current
        if (!c) return
        const ctx = c.getContext("2d")
        ctx?.clearRect(0, 0, c.width, c.height)
        emptyRef.current = true
      },
      isEmpty: () => emptyRef.current,
    }))

    React.useEffect(() => {
      const c = canvasRef.current
      if (!c) return
      const ratio = window.devicePixelRatio || 1
      const rect = c.getBoundingClientRect()
      c.width = rect.width * ratio
      c.height = rect.height * ratio
      const ctx = c.getContext("2d")
      if (ctx) {
        ctx.scale(ratio, ratio)
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.strokeStyle = "#0a0a0a"
      }
    }, [])

    function pos(e: React.PointerEvent<HTMLCanvasElement>) {
      const r = e.currentTarget.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    return (
      <canvas
        ref={canvasRef}
        aria-label="Signature pad"
        className="h-36 w-full touch-none rounded-2xl border border-dashed border-border bg-input/30"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drawingRef.current = true
          lastRef.current = pos(e)
        }}
        onPointerMove={(e) => {
          if (!drawingRef.current) return
          const ctx = canvasRef.current?.getContext("2d")
          const p = pos(e)
          if (ctx && lastRef.current) {
            ctx.beginPath()
            ctx.moveTo(lastRef.current.x, lastRef.current.y)
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
            emptyRef.current = false
          }
          lastRef.current = p
        }}
        onPointerUp={() => {
          drawingRef.current = false
          lastRef.current = null
        }}
        onPointerLeave={() => {
          drawingRef.current = false
          lastRef.current = null
        }}
      />
    )
  },
)

export function SignaturePadFrame({
  padRef,
}: {
  padRef: React.RefObject<SignaturePadHandle | null>
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Recipient signature</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => padRef.current?.clear()}
        >
          Clear
        </Button>
      </div>
      <SignaturePad ref={padRef} />
      <p className="text-xs text-muted-foreground">
        Draw with your finger on the trace area.
      </p>
    </div>
  )
}
